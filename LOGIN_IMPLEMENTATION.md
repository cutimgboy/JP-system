# 手机验证码登录系统实现文档

## 功能概述

实现了完整的手机验证码登录系统，包括：
- ✅ 手机号验证码登录
- ✅ 自动注册（首次登录自动创建账号）
- ✅ JWT Token 认证
- ✅ 路由守卫保护
- ✅ 认证状态管理
- ✅ 第三方登录预留（Google、Facebook）

## 技术栈

- **前端**: React + TypeScript + React Router v6
- **后端**: NestJS + TypeORM + MySQL + Redis
- **认证**: JWT (7天有效期)
- **验证码**: Redis 缓存 (5分钟有效期)

## 文件结构

### 前端文件

```
frontend/src/
├── pages/auth/
│   └── Login.tsx                    # 登录页面组件
├── contexts/
│   └── AuthContext.tsx              # 认证上下文（管理登录状态）
├── components/
│   └── ProtectedRoute.tsx           # 路由守卫组件
├── utils/
│   └── api.ts                       # API 客户端（已更新）
├── App.tsx                          # 路由配置（已更新）
└── main.tsx                         # 入口文件（已更新）
```

### 后端接口

```
POST /auth/send-sms              # 发送验证码
POST /auth/sms-login             # 验证码登录
GET  /user/info                  # 获取当前用户信息
```

## 使用流程

### 1. 用户登录流程

1. 用户访问 `/login` 页面
2. 输入手机号（格式：1[3-9]xxxxxxxxx）
3. 点击"获取验证码"按钮
4. 后端发送6位验证码到 Redis（开发环境会在 alert 中显示）
5. 用户输入验证码
6. 点击"登录"按钮
7. 后端验证验证码：
   - 如果手机号不存在，自动创建新用户
   - 如果手机号已存在，直接登录
8. 返回 JWT Token 和用户信息
9. 前端保存 Token 到 localStorage
10. 跳转到首页

### 2. 认证状态管理

**AuthContext** 提供以下功能：
- `user`: 当前登录用户信息
- `token`: JWT Token
- `loading`: 初始化加载状态
- `login(token, user)`: 登录方法
- `logout()`: 登出方法
- `refreshUser()`: 刷新用户信息

### 3. 路由保护

所有需要登录的页面都使用 `<ProtectedRoute>` 包裹：

```tsx
<Route
  path="/home"
  element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  }
/>
```

未登录用户访问受保护页面会自动跳转到 `/login`。

### 4. API 请求拦截

**请求拦截器**：
- 自动从 localStorage 读取 token
- 添加到请求头：`Authorization: Bearer {token}`

**响应拦截器**：
- 401 错误时自动清除 token
- 跳转到登录页面

## 开发环境测试

### 启动服务

```bash
# 启动后端（在 backend 目录）
npm run dev

# 启动前端（在 frontend 目录）
npm run dev
```

### 测试登录

1. 访问 `http://localhost:5173/login`
2. 输入任意手机号（格式正确即可）
3. 点击"获取验证码"
4. 在弹出的 alert 中查看验证码
5. 输入验证码并登录

### 验证码说明

- **开发环境**: 验证码会在 alert 中显示，方便测试
- **生产环境**: 需要集成真实的短信服务（阿里云、腾讯云等）

## 数据库表结构

### users 表

```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nickname` varchar(100) DEFAULT NULL,
  `avatar` text,
  `googleId` varchar(50) DEFAULT NULL,
  `facebookId` varchar(50) DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  `createTime` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_phone` (`phone`),
  UNIQUE KEY `IDX_email` (`email`),
  UNIQUE KEY `IDX_googleId` (`googleId`),
  UNIQUE KEY `IDX_facebookId` (`facebookId`)
);
```

## 环境变量配置

### 后端 (.env.prod)

```env
# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWD=123456
DB_DATABASE=vietnam
```

### 前端 (.env)

```env
VITE_API_URL=http://localhost:3000
```

## 安全特性

1. **JWT Token**: 7天有效期，存储在 localStorage
2. **验证码**: 5分钟有效期，存储在 Redis
3. **防重复发送**: 验证码未过期时无法重复发送
4. **手机号验证**: 严格的正则表达式验证
5. **验证码验证**: 6位数字，验证后自动删除
6. **401 自动登出**: Token 失效时自动清除并跳转登录页

## 后续扩展

### 1. 第三方登录

已预留 Google 和 Facebook 登录接口：
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/facebook`
- `GET /auth/facebook/callback`

需要配置相应的环境变量即可启用。

### 2. 邮箱验证码登录

后端已实现邮箱验证码登录接口：
- `POST /auth/send-email`
- `POST /auth/email-login`

前端可以参考手机登录实现邮箱登录。

### 3. 用户信息管理

可以添加以下功能：
- 修改昵称
- 上传头像
- 绑定邮箱
- 绑定第三方账号

## 常见问题

### Q: 验证码收不到？
A: 开发环境验证码会在 alert 中显示。生产环境需要集成真实短信服务。

### Q: 登录后刷新页面需要重新登录？
A: 不会。Token 存储在 localStorage，刷新页面会自动从 localStorage 读取。

### Q: Token 过期后会怎样？
A: 后端返回 401 错误，前端自动清除 Token 并跳转到登录页。

### Q: 如何测试登录功能？
A: 输入任意符合格式的手机号，获取验证码后在 alert 中查看并输入即可。

## 最佳实践

1. ✅ 使用 Context API 管理全局认证状态
2. ✅ 使用路由守卫保护需要登录的页面
3. ✅ 使用 Axios 拦截器统一处理 Token
4. ✅ 验证码存储在 Redis，提高性能
5. ✅ JWT Token 有效期设置合理（7天）
6. ✅ 首次登录自动注册，提升用户体验
7. ✅ 开发环境显示验证码，方便测试

## 测试清单

- [ ] 访问登录页面
- [ ] 输入手机号并获取验证码
- [ ] 查看 alert 中的验证码
- [ ] 输入验证码并登录
- [ ] 验证登录成功后跳转到首页
- [ ] 刷新页面验证登录状态保持
- [ ] 访问受保护页面验证路由守卫
- [ ] 清除 localStorage 验证自动跳转登录页
- [ ] 测试错误提示（手机号格式错误、验证码错误等）
- [ ] 测试倒计时功能（60秒内不能重复发送）
