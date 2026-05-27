# 后端架构与 K 线性能审计

审计日期：2026-05-23

更新：2026-05-27 已将行情持久化收口为 `stock_klines` 默认写入、`stock_ticks` 可选短期调试流水；旧的 `stock_realtime_price` / `stock_price_change` 流水表已从运行时模型移除。下文保留部分历史审计内容用于追溯。

## 需求改写

原始需求可以拆成以下可执行任务：

1. 从后端架构、模块边界、鉴权、配置、缓存、实时通道、测试覆盖等方面评估当前设计是否合理。
2. 从 TypeORM 实体、迁移、索引、字段类型、外键约束和 schema 演进角度评估数据库设计。
3. 重点追踪前端打开单只股票行情/K 线图卡顿的端到端链路，区分后端、数据库、网络和前端渲染原因。
4. 将结论记录到仓库文档中。
5. 第一阶段在独立 git worktree 中修改；用户确认后已合入主工作区，并在 `master` 上继续第二阶段修复。

## 已执行

1. 移除了启动自动迁移中的清库逻辑，避免应用启动时误清业务表。
2. 给 Quote 运维/调试接口增加了 JWT + admin role 保护。
3. 为 quote 实体补充 `code + tick_time` 和 `tick_time` 索引定义，并新增显式 SQL 迁移脚本。
4. 为 `/api/products/quotes` 去掉 N+1 查询。
5. 新增 `GET /api/quote/kline/:code?interval=1s&limit=300`，先基于 `stock_realtime_price` 聚合历史快照。
6. 交易页进入时先加载 K 线快照，再接 SSE 增量；SSE tick 合并为 200ms 批量刷新。
7. `KLineChart` 从每个 animation frame 触发 React state 重绘，降到约 10fps。
8. 交易倒计时刷新从 100ms 降到 250ms。
9. 给后台订单、后台消息、后台社区、入金全量/审核、系统收款卡管理、奖励设置、文章写删等管理能力补充 admin 角色保护。
10. 修复入金详情 IDOR：普通用户只能查看自己的入金记录，管理员可查看全部。
11. 新增 `stock_ticks` 原始 tick 表和 `stock_klines` K 线聚合表实体及 SQL 迁移。
12. `QuoteService` 写入链路现在会保留同价 tick，并按 1s/5s/15s/60s/300s 聚合 K 线。
13. `GET /api/quote/kline/:code` 优先读取 `stock_klines`，没有聚合数据时再回落到 `stock_realtime_price` 临时聚合和 Redis 最新价兜底。

## 总体结论

后端当前是一个 NestJS 单体应用，按业务域拆分了用户、交易、CFD 产品、行情、Redis、入金、奖励、消息等模块。整体方向可以继续演进，但仍存在三类问题：

1. **权限体系已完成第一轮收口**：主要后台写操作和全量数据接口已加 `RolesGuard`，后续仍建议引入默认保护、显式公开的全局鉴权策略。
2. **行情/K 线数据模型已落地基础表**：已新增 `stock_ticks` 和 `stock_klines`，快照接口优先读聚合表；迁移执行机制仍需统一。
3. **前端卡顿主因已先行缓解**：交易页 K 线不再等待纯实时 tick 从零填图，也降低了 React 重绘频率。

## 后端架构现状

入口在 `backend/src/app.module.ts`。根模块集中装配 `ConfigModule`、`ScheduleModule`、`TypeOrmModule`、`RedisModule`、`UserModule`、`CfdModule`、`QuoteModule`、`AdminModule` 等模块。

行情模块核心仍在 `backend/src/quote/quote.service.ts`。该 service 同时承担外部 AllTick WebSocket、tick 处理、Redis 最新报价缓存、DB buffer、SSE 推送、mock 数据和维护能力。短期可继续使用，后续建议拆分为：

- `QuoteFeedService`
- `QuoteCacheService`
- `QuotePersistenceService`
- `QuoteStreamService`
- `QuoteKlineService`

## 主要风险

### P0：启动迁移中的清库逻辑

已处理。`002-clear-all-test-data` 已从启动迁移列表移除。测试数据清理应迁移到显式脚本，并加环境保护。

### P0：后台和运维接口权限边界不足

已处理 Quote 运维/调试接口：

- `GET /api/quote/status/cache`
- `POST /api/quote/maintenance/clean-cache`
- `POST /api/quote/test/price-calculation`

已处理后台管理能力：

- `admin/orders`
- `api/admin/messages`
- `api/admin/community`
- `GET /deposit/all`
- `PUT /deposit/:id/review`
- 系统收款银行卡列表、详情、创建、更新、启用、删除
- 奖励设置查看和更新
- 文章创建、更新、删除

仍建议下一步把认证策略改为全局默认保护，再用 `@Public()` 显式开放公开接口。

### P1：迁移体系分裂

项目仍同时存在 TypeORM `synchronize`、自定义 `MigrationService`、`backend/src/migrations/*.sql`、`backend/migrations/*.sql`。建议统一迁移入口，生产禁用 `synchronize`，所有 schema 变更进入正式迁移。

### P1：配置和密钥管理不稳

当前配置没有 schema 校验。JWT 仍存在默认 fallback，`.env.dev/.env.prod` 在仓库中。建议生产启动时强校验 `JWT_SECRET`、`QUOTE_WS_TOKEN`、DB/Redis 配置，并移除真实 secret。

## 数据库设计评估

现有 quote 持久化表：

- `stock_realtime_price`
- `stock_price_change`

本次增加索引：

- `stock_realtime_price(code, tick_time)`
- `stock_realtime_price(tick_time)`
- `stock_price_change(code, tick_time)`
- `stock_price_change(tick_time)`

本次新增：

```sql
CREATE TABLE stock_ticks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL,
  seq VARCHAR(64) NOT NULL,
  tick_time TIMESTAMP NOT NULL,
  price DECIMAL(18,6) NOT NULL,
  volume BIGINT NOT NULL DEFAULT 0,
  turnover DECIMAL(20,2) NOT NULL DEFAULT 0,
  trade_direction TINYINT NULL,
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code_seq (code, seq),
  KEY idx_code_tick_time (code, tick_time),
  KEY idx_tick_time (tick_time)
);
```

```sql
CREATE TABLE stock_klines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL,
  interval_sec INT NOT NULL,
  bucket_time TIMESTAMP NOT NULL,
  open DECIMAL(18,6) NOT NULL,
  high DECIMAL(18,6) NOT NULL,
  low DECIMAL(18,6) NOT NULL,
  close DECIMAL(18,6) NOT NULL,
  volume BIGINT NOT NULL DEFAULT 0,
  turnover DECIMAL(20,2) NOT NULL DEFAULT 0,
  trade_count INT NOT NULL DEFAULT 0,
  first_tick_time TIMESTAMP NOT NULL,
  last_tick_time TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code_interval_bucket (code, interval_sec, bucket_time),
  KEY idx_interval_bucket (interval_sec, bucket_time)
);
```

迁移文件位于 `backend/migrations/003-create-stock-ticks-and-klines.sql`。注意当前 `MigrationService` 不会自动读取 `backend/migrations/*.sql`，生产部署时仍需显式执行该脚本，或先统一迁移入口。

## K 线卡顿链路

交易页当前链路：

1. `TradingChart` 先请求 `GET /api/quote/kline/:code?interval=1s&limit=300`。
2. 前端用历史快照填充图表。
3. 建立 `EventSource /api/quote/stream/:code` 接实时 tick。
4. tick 在前端 200ms 合并一次再更新 state。
5. `KLineChart` 约 10fps 刷新 canvas，避免每个 animation frame 触发 React render。

后端快照接口现在优先读取 `stock_klines` 聚合表。若新表还没有数据，会回落到 `stock_realtime_price` 聚合 open/high/low/close/volume/turnover；再没有历史流水时，用 Redis 最新价生成一根兜底 K 线。

## 后续建议

1. 把认证策略改为全局默认保护、显式 `@Public()` 开放，减少新接口漏 guard 的概率。
2. 把 `QuoteService` 拆分，避免高频 tick 链路和运维查询混在一个类里。
3. 引入正式迁移框架，停用自定义内联迁移，并自动执行 `backend/migrations/*.sql`。
4. 增加指标：tick 接收延迟、Redis 写入耗时、DB buffer 长度、SSE 连接数、K 线接口 P95/P99。
5. 给 `stock_ticks` 和 `stock_klines` 增加归档/分区策略，避免高频行情表无限增长。
