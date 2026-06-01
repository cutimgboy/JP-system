-- 补充公开读接口常用查询索引。
-- 使用 information_schema 生成幂等 ALTER，避免重复执行失败。

SET @schema_name = DATABASE();

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `products` ADD INDEX `idx_products_type_active_sort` (`type`, `is_active`, `sort_order`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'products'
    AND index_name = 'idx_products_type_active_sort'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `products` ADD INDEX `idx_products_code_active` (`code`, `is_active`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'products'
    AND index_name = 'idx_products_code_active'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `leaderboard` ADD INDEX `idx_leaderboard_active_sort_rank` (`is_active`, `sort_order`, `rank`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'leaderboard'
    AND index_name = 'idx_leaderboard_active_sort_rank'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `messages` ADD INDEX `idx_messages_active_sort_created` (`is_active`, `sort_order`, `created_at`)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'messages'
    AND index_name = 'idx_messages_active_sort_created'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
