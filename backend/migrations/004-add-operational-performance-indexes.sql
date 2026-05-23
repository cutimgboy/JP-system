-- 补充订单自动平仓、后台订单列表和入金审核列表的关键索引。
-- 使用 information_schema 生成幂等 ALTER，避免重复执行失败。

SET @schema_name = DATABASE();

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `trade_orders` ADD INDEX `idx_trade_orders_status_expected_close_time` (`status`, `expected_close_time`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'trade_orders'
    AND index_name = 'idx_trade_orders_status_expected_close_time'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `trade_orders` ADD INDEX `idx_trade_orders_account_type_created_at` (`account_type`, `created_at`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'trade_orders'
    AND index_name = 'idx_trade_orders_account_type_created_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `trade_orders` ADD INDEX `idx_trade_orders_account_type_status_created_at` (`account_type`, `status`, `created_at`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'trade_orders'
    AND index_name = 'idx_trade_orders_account_type_status_created_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `deposit_records` ADD INDEX `idx_deposit_records_status_create_time` (`status`, `createTime`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'deposit_records'
    AND index_name = 'idx_deposit_records_status_create_time'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `deposit_records` ADD INDEX `idx_deposit_records_user_id_create_time` (`userId`, `createTime`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'deposit_records'
    AND index_name = 'idx_deposit_records_user_id_create_time'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
