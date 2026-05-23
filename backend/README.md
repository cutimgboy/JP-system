# JP 后端

NestJS + TypeORM 后端，负责用户、交易、行情、入金、系统银行卡、奖励和社区数据。

## 启动

```bash
npm install
npm run start:dev
```

## 环境变量

复制 [backend/.env.example](./.env.example) 作为本地配置参考。生产环境至少需要：

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWD`
- `DB_DATABASE`
- `JWT_SECRET`
- `QUOTE_WS_TOKEN`

## 安全约定

- 生产环境不要使用默认 `JWT_SECRET`
- 不要把真实 `.env.dev` / `.env.prod` 提交到仓库
- `ENABLE_SWAGGER=false` 时建议生产关闭文档页
- 真实账户的充值/提现必须走正式入金流程，不走测试接口

## 性能约定

- 订单统计和后台统计使用 SQL 聚合，不拉全量订单
- 自动平仓按批处理，避免每秒扫全量订单
- 行情快照优先读 `stock_klines`
- `stock_ticks` / `stock_klines` 需要先执行迁移 `backend/migrations/003-create-stock-ticks-and-klines.sql`

## 迁移

当前仓库保留 SQL 迁移文件在 `backend/migrations/`，部署时需要确保按顺序执行：

1. `001-update-user-id-start.sql`
2. `002-add-quote-tick-time-indexes.sql`
3. `003-create-stock-ticks-and-klines.sql`
4. `004-add-operational-performance-indexes.sql`

## 主要模块

- `src/user` 用户、登录、交易、账户
- `src/quote` 行情、K 线、SSE
- `src/deposit` 入金审核
- `src/system-bank-card` 系统收款卡
- `src/reward` 奖励设置
- `src/community` 社区和排行榜
- `src/message` 消息管理
- `src/admin` 后台订单管理
