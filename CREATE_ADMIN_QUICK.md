# 快速创建管理员账户

由于需要数据库配置，这里提供一个简单的 SQL 脚本直接在数据库中创建管理员账户。

## 管理员账户信息

- **用户名**: `admin`
- **密码**: `Admin@123456`

## 创建步骤

### 1. 连接到 MySQL 数据库

```bash
mysql -u root -p
```

### 2. 选择数据库

```sql
USE jp_system;  -- 或者你的数据库名称
```

### 3. 执行以下 SQL 语句

```sql
-- 插入管理员用户
INSERT INTO `users` (
  `username`,
  `password`,
  `role`,
  `phone`,
  `email`,
  `status`,
  `createTime`,
  `updateTime`
) VALUES (
  'admin',
  '$2b$10$M0ELPLLh9biI25kBN6qIpOw.yEzvMTlFq.1DkyIU.tRyVzGYyz/5G',  -- 密码: Admin@123456
  'admin',
  '13800138000',
  'admin@jp-system.com',
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

### 4. 验证创建成功

```sql
SELECT * FROM users WHERE username = 'admin';
```

## 生成新的密码哈希（可选）

如果你想使用不同的密码，可以使用以下 Node.js 代码生成新的密码哈希：

```javascript
const bcrypt = require('bcrypt');
const password = 'YourNewPassword';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

然后将生成的哈希值替换到上面 SQL 中的 password 字段。

## 登录后台

创建成功后，访问后台管理系统：

- **地址**: http://localhost:5174/login
- **用户名**: `admin`
- **密码**: `Admin@123456`

## 注意事项

1. 确保数据库表已经创建（运行后端服务时会自动创建）
2. 如果表名不同，请根据实际情况调整 SQL 语句
3. 首次登录后建议立即修改密码
4. 不要在生产环境使用默认密码
