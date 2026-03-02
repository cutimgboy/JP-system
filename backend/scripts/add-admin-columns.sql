-- 为 users 表添加管理员登录所需的字段

-- 添加 username 字段
ALTER TABLE `users`
ADD COLUMN `username` VARCHAR(50) NULL COMMENT '用户名' AFTER `id`,
ADD UNIQUE INDEX `IDX_username` (`username`);

-- 添加 password 字段
ALTER TABLE `users`
ADD COLUMN `password` VARCHAR(255) NULL COMMENT '密码' AFTER `username`;

-- 添加 role 字段
ALTER TABLE `users`
ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '角色：user-普通用户，admin-管理员' AFTER `password`;
