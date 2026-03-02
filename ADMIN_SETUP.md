# 管理员账户创建指南

## 方法一：使用脚本自动创建（推荐）

### 1. 安装 bcrypt 依赖

```bash
cd backend
npm install bcrypt @types/bcrypt
```

### 2. 运行创建脚本

```bash
npm run create-admin
```

脚本会自动创建管理员账户：
- **用户名**: `admin`
- **密码**: `Admin@123456`

---

## 方法二：手动创建

如果脚本方式不可行，可以手动在数据库中创建：

### 1. 生成密码哈希

在 Node.js 环境中运行：

```javascript
const bcrypt = require('bcrypt');
const password = 'Admin@123456';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

### 2. 插入数据库

将生成的哈希值替换到下面的 SQL 中：

```sql
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

-- 创建模拟账户
INSERT INTO `user_account` (
  `userId`,
  `accountType`,
  `balance`,
  `frozenBalance`,
  `createdAt`,
  `updatedAt`
) VALUES
  (@admin_id, 'demo', 1000000, 0, NOW(), NOW());

-- 创建真实账户
INSERT INTO `user_account` (
  `userId`,
  `accountType`,
  `balance`,
  `frozenBalance`,
  `createdAt`,
  `updatedAt`
) VALUES
  (@admin_id, 'real', 0, 0, NOW(), NOW());
```

---

## 登录信息

创建成功后，使用以下信息登录后台管理系统：

- **访问地址**: http://localhost:5174/login (或您配置的管理后台地址)
- **用户名**: `admin`
- **密码**: `Admin@123456`

---

## 安全建议

1. 首次登录后，建议立即修改默认密码
2. 不要在生产环境使用默认密码
3. 定期更换管理员密码
4. 妥善保管管理员账户信息

---

## 故障排查

### 问题：脚本运行失败

**解决方案**：
1. 确保数据库连接配置正确（检查 `.env` 文件）
2. 确保数据库服务正在运行
3. 确保已安装所有依赖：`npm install`

### 问题：登录失败

**解决方案**：
1. 检查用户名和密码是否正确
2. 检查数据库中是否成功创建了管理员账户
3. 检查后端服务是否正常运行
4. 查看浏览器控制台和后端日志获取详细错误信息
