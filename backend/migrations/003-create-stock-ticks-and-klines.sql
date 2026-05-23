-- 新增原始 tick 表和 K 线聚合表。
-- 当前项目的 MigrationService 仍未自动读取 backend/migrations/*.sql；
-- 部署时需要显式执行该脚本，或将迁移链路统一后纳入正式迁移。

CREATE TABLE IF NOT EXISTS `stock_ticks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL COMMENT '股票代码',
  `seq` VARCHAR(64) NOT NULL COMMENT '行情源序列号',
  `tick_time` TIMESTAMP NOT NULL COMMENT 'tick时间戳',
  `price` DECIMAL(18,6) NOT NULL COMMENT '成交价格',
  `volume` BIGINT NOT NULL DEFAULT 0 COMMENT '成交量',
  `turnover` DECIMAL(20,2) NOT NULL DEFAULT 0 COMMENT '成交额',
  `trade_direction` TINYINT NULL COMMENT '交易方向：1-买入，2-卖出',
  `received_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '接收时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_stock_ticks_code_seq` (`code`, `seq`),
  KEY `idx_stock_ticks_code_tick_time` (`code`, `tick_time`),
  KEY `idx_stock_ticks_tick_time` (`tick_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='股票原始Tick表';

CREATE TABLE IF NOT EXISTS `stock_klines` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL COMMENT '股票代码',
  `interval_sec` INT NOT NULL COMMENT 'K线周期，单位秒',
  `bucket_time` TIMESTAMP NOT NULL COMMENT 'K线桶起始时间',
  `open` DECIMAL(18,6) NOT NULL COMMENT '开盘价',
  `high` DECIMAL(18,6) NOT NULL COMMENT '最高价',
  `low` DECIMAL(18,6) NOT NULL COMMENT '最低价',
  `close` DECIMAL(18,6) NOT NULL COMMENT '收盘价',
  `volume` BIGINT NOT NULL DEFAULT 0 COMMENT '成交量',
  `turnover` DECIMAL(20,2) NOT NULL DEFAULT 0 COMMENT '成交额',
  `trade_count` INT NOT NULL DEFAULT 0 COMMENT '成交笔数',
  `first_tick_time` TIMESTAMP NOT NULL COMMENT '桶内最早tick时间',
  `last_tick_time` TIMESTAMP NOT NULL COMMENT '桶内最晚tick时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_stock_klines_code_interval_bucket` (`code`, `interval_sec`, `bucket_time`),
  KEY `idx_stock_klines_interval_bucket` (`interval_sec`, `bucket_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='股票K线聚合表';
