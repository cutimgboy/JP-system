# 行情模块说明

## 当前链路

当前行情模块以 `QuoteService` 为核心：

```text
AllTick WebSocket
  -> QuoteService.handleTickData()
  -> processPriceChange()
  -> Redis 最新报价缓存
  -> DB buffer 批量落库 stock_ticks / stock_klines / stock_realtime_price / stock_price_change
  -> SSE /api/quote/stream/:code
  -> 前端 TradingChart/KLineChart
```

前端交易页会先加载历史 K 线快照，再建立 SSE 连接接收后续 tick。历史快照现在优先读取 `stock_klines` 聚合表；新表没有数据时，会回落到 `stock_realtime_price` 实时流水临时聚合。

## 主要接口

- `GET /api/quote/symbols`：获取订阅股票列表。
- `GET /api/quote/realtime`：获取所有实时买卖价。
- `GET /api/quote/realtime/:code`：获取单只股票实时买卖价。
- `GET /api/quote/kline/:code?interval=1s&limit=300`：获取历史 K 线快照。
- `GET /api/quote/status/connection`：查看外部行情 WebSocket 状态。
- `GET /api/quote/status/cache`：查看 Redis 缓存统计。
- `POST /api/quote/maintenance/clean-cache`：清理缓存。
- `POST /api/quote/test/price-calculation`：测试价差计算。
- `GET /api/quote/stream/:code`：SSE tick 推送。

注意：缓存统计、清缓存、测试价差属于运维/调试接口，已加 JWT + admin 角色保护。

## Redis Key

- `stock:quote:{code}`：单只股票最新报价，TTL 60 秒。
- `stock:price:{code}`：单只股票最新成交价，TTL 60 秒。
- `stock:spread:{code}`：价差设置，TTL 300 秒。
- `stock:quotes:all`：所有股票实时报价汇总，TTL 2 秒。

## 数据库存储

当前持久化表：

- `stock_ticks`：原始 tick 流水，按 `code + seq` 去重，支持问题回放和重新聚合。
- `stock_klines`：K 线聚合表，唯一键为 `code + interval_sec + bucket_time`。
- `stock_realtime_price`：实时价格流水。
- `stock_price_change`：价格变化流水。

K 线聚合周期：

- 1s
- 5s
- 15s
- 60s
- 300s

迁移文件：

- `backend/migrations/002-add-quote-tick-time-indexes.sql`
- `backend/migrations/003-create-stock-ticks-and-klines.sql`

注意：当前项目的 `MigrationService` 不会自动读取 `backend/migrations/*.sql`，部署时需要显式执行这些 SQL，或先统一迁移机制。

建议详见 `backend/docs/architecture-and-kline-audit.md`。

## K 线性能结论

用户感知的交易页 K 线卡顿，最强嫌疑在前端绘制：

- `KLineChart` 每个 `requestAnimationFrame` 都用 React state 触发 render。
- 每帧又重新计算价格范围、可见数据、网格、曲线、标签并绘制 canvas。
- 每条 SSE tick 还会更新 `TradingChart` 和父组件 `TradingDetail` 的状态。

后端已经补了历史快照接口和 K 线聚合表。眼前卡顿不应只按数据库慢查询处理，前端渲染频率和状态更新同样关键。

## 推荐演进

1. 统一迁移机制，让 `backend/migrations/*.sql` 能进入部署链路。
2. SSE 后续可只推实时 tick 或当前 bucket 更新，减少前端合并成本。
3. 给高频行情表增加归档、分区或冷热数据策略。
4. 增加 K 线接口 P95/P99、DB buffer 长度和丢弃行数指标。
5. 前端继续保持 tick 合并和 KLine canvas 降频刷新。
