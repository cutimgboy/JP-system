-- 为 K 线历史快照和后续聚合查询补充业务时间索引。
-- 使用 information_schema 生成幂等 ALTER，避免重复执行时失败。

SET @schema_name = DATABASE();

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `stock_realtime_price` ADD INDEX `idx_stock_realtime_price_code_tick_time` (`code`, `tick_time`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'stock_realtime_price'
    AND index_name = 'idx_stock_realtime_price_code_tick_time'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `stock_realtime_price` ADD INDEX `idx_stock_realtime_price_tick_time` (`tick_time`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'stock_realtime_price'
    AND index_name = 'idx_stock_realtime_price_tick_time'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `stock_price_change` ADD INDEX `idx_stock_price_change_code_tick_time` (`code`, `tick_time`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'stock_price_change'
    AND index_name = 'idx_stock_price_change_code_tick_time'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `stock_price_change` ADD INDEX `idx_stock_price_change_tick_time` (`tick_time`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'stock_price_change'
    AND index_name = 'idx_stock_price_change_tick_time'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
