-- 创建管理员账户
-- 用户名: admin
-- 密码: Admin@123456

-- 插入管理员用户
INSERT INTO `users` (
  `username`,
  `password`,
  `phone`,
  `email`,
  `role`,
  `status`,
  `createTime`,
  `updateTime`
) VALUES (
  'admin',
  '$2b$10$M0ELPLLh9biI25kBN6qIpOw.yEzvMTlFq.1DkyIU.tRyVzGYyz/5G',  -- 密码: Admin@123456
  '13800138000',
  'admin@jp-system.com',
  'admin',
  1,
  NOW(),
  NOW()
);

-- 获取刚创建的用户ID
SET @admin_id = LAST_INSERT_ID();

-- 为管理员创建账户
INSERT INTO `user_account` (
  `userId`,
  `accountType`,
  `balance`,
  `frozenBalance`,
  `createdAt`,
  `updatedAt`
) VALUES
  (@admin_id, 'demo', 1000000, 0, NOW(), NOW()),
  (@admin_id, 'real', 0, 0, NOW(), NOW());
