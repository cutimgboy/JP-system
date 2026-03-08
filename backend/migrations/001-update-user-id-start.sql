-- 修改用户表的 AUTO_INCREMENT 起始值为 80000000
-- 这将使新用户的 ID 从 80000000 开始

ALTER TABLE users AUTO_INCREMENT = 80000000;

-- 注意：此操作不会影响已存在的用户 ID
-- 只会影响新创建的用户
