# JP-system 开发环境部署文档

## 目录
- [1. 环境要求](#1-环境要求)
- [2. 环境准备](#2-环境准备)
- [3. 数据库配置](#3-数据库配置)
- [4. 项目部署](#4-项目部署)
- [5. 启动项目](#5-启动项目)
- [6. 常见问题](#6-常见问题)

---

## 1. 环境要求

### 1.1 基础要求
- **Node.js**: >= 18.0.0（推荐 20.x LTS）
- **pnpm**: 最新版本
- **MySQL**: 8.0+
- **Redis**: 6.0+
- **操作系统**: macOS / Linux / Windows

### 1.2 端口占用
确保以下端口未被占用：
- `3000`: 后端 API
- `5173-5175`: 前端
- `5176`: 管理后台
- `3306`: MySQL
- `6379`: Redis

---

## 2. 环境准备

### 2.1 安装 Node.js

**macOS (使用 Homebrew)**:
```bash
brew install node@20
node -v
```

**Linux (使用 nvm)**:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v
```

**Windows**:
从 [nodejs.org](https://nodejs.org/) 下载安装包

### 2.2 安装 pnpm
```bash
npm install -g pnpm
pnpm -v
```

### 2.3 安装 MySQL

**macOS**:
```bash
brew install mysql@8.0
brew services start mysql@8.0
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql
```

**Windows**:
从 [MySQL 官网](https://dev.mysql.com/downloads/mysql/) 下载安装包

### 2.4 安装 Redis

**macOS**:
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt install redis-server -y
sudo systemctl start redis
sudo systemctl enable redis
```

**Windows**:
使用 WSL 或从 [Redis 官网](https://redis.io/download) 下载

### 2.5 验证安装
```bash
# 验证 Node.js
node -v

# 验证 pnpm
pnpm -v

# 验证 MySQL
mysql --version

# 验证 Redis
redis-cli ping  # 应返回 PONG
```

---

## 3. 数据库配置

### 3.1 创建数据库和用户
```bash
# 登录 MySQL（如果是首次安装，可能不需要密码）
mysql -u root -p
```

执行以下 SQL：
```sql
-- 创建数据库
CREATE DATABASE vietnam_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（开发环境使用简单密码）
CREATE USER 'jpuser'@'localhost' IDENTIFIED BY '123456';

-- 授权
GRANT ALL PRIVILEGES ON vietnam_test.* TO 'jpuser'@'localhost';
FLUSH PRIVILEGES;

-- 验证
SHOW DATABASES;

EXIT;
```

### 3.2 测试连接
```bash
mysql -u jpuser -p123456 vietnam_test
```

如果能成功登录，说明配置正确。

---

## 4. 项目部署

### 4.1 克隆代码
```bash
# 进入你的工作目录
cd ~/myCode  # 或其他目录

# 克隆项目（如果还没有）
git clone <your-repository-url> JP-system
cd JP-system
```

### 4.2 安装依赖
```bash
# 使用 pnpm workspace 安装所有依赖
pnpm install
```

这会同时安装 backend、frontend、admin 的所有依赖。

### 4.3 配置后端环境变量
```bash
cd backend

# 检查 .env.dev 文件是否存在
cat .env.dev
```

如果不存在或需要修改，创建/编辑 `.env.dev`：
```bash
nano .env.dev
```

**开发环境配置** (`.env.dev`):
```env
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=jpuser
DB_PASSWD=123456
DB_DATABASE=vietnam_test

# 开发环境
NODE_ENV=development

# JWT配置
JWT_SECRET=dev_secret_key_for_testing_only
JWT_EXPIRES_IN=7d

# 端口号
PORT=3000

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Google OAuth 配置（可选，开发环境可以不配置）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Facebook OAuth 配置（可选）
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback

# WebSocket 行情源配置
QUOTE_WS_TOKEN=3f3274c5cf838b29b1bb637227551bc0-c-app
TARGET_STOCK_SYMBOLS=NVDA.US,MSFT.US,AAPL.US,AMZN.US,GOOG.US

# 缓存配置
STOCK_QUOTE_CACHE_TTL=60
ALL_QUOTES_CACHE_TTL=2
SPREAD_CACHE_TTL=300

# 开发环境使用模拟数据
MOCK_QUOTE_DATA=true

# 性能配置
ENABLE_PRICE_CHANGE_LOG=true
CLEANUP_OLD_RECORDS_DAYS=30
MAX_CONCURRENT_DB_WRITES=10
```

### 4.4 配置前端环境变量
```bash
cd ../frontend

# 创建或编辑 .env 文件
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000
EOF
```

### 4.5 配置管理后台环境变量
```bash
cd ../admin

# 创建或编辑 .env 文件
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000
EOF
```

### 4.6 初始化数据库
```bash
cd ../backend

# 如果有初始化 SQL 文件
mysql -u jpuser -p123456 vietnam_test < scripts/init.sql

# 导入产品数据
pnpm run import:products

# 导入基础信息
pnpm run import:base-info

# 创建管理员账户
pnpm run create-admin
```

---

## 5. 启动项目

### 5.1 方式一：一键启动所有服务（推荐）
```bash
# 在项目根目录
cd ~/myCode/JP-system

# 同时启动后端、前端、管理后台
pnpm dev
```

这会启动：
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173 (或 5174、5175)
- **Admin**: http://localhost:5176

### 5.2 方式二：分别启动各个服务

**启动后端**:
```bash
# 终端 1
cd ~/myCode/JP-system
pnpm dev:backend
```

**启动前端**:
```bash
# 终端 2
cd ~/myCode/JP-system
pnpm dev:frontend
```

**启动管理后台**:
```bash
# 终端 3
cd ~/myCode/JP-system
pnpm dev:admin
```

### 5.3 验证服务
打开浏览器访问：
- 前端: http://localhost:5173
- 管理后台: http://localhost:5176
- 后端 API: http://localhost:3000/api/health

---

## 6. 常见问题

### 6.1 端口被占用
**症状**: 启动时提示端口已被占用

**解决方案**:
```bash
# 查看端口占用
# macOS/Linux
lsof -i :3000
lsof -i :5173

# Windows
netstat -ano | findstr :3000

# 杀死进程
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### 6.2 数据库连接失败
**症状**: 后端启动失败，提示数据库连接错误

**排查步骤**:
```bash
# 1. 检查 MySQL 是否运行
# macOS
brew services list | grep mysql

# Linux
sudo systemctl status mysql

# 2. 测试数据库连接
mysql -u jpuser -p123456 vietnam_test

# 3. 检查 .env.dev 配置
cat backend/.env.dev
```

### 6.3 Redis 连接失败
**症状**: 后端启动失败，提示 Redis 连接错误

**解决方案**:
```bash
# 检查 Redis 是否运行
# macOS
brew services list | grep redis

# Linux
sudo systemctl status redis

# 启动 Redis
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# 测试连接
redis-cli ping
```

### 6.4 pnpm install 失败
**症状**: 依赖安装失败或卡住

**解决方案**:
```bash
# 清理缓存
pnpm store prune

# 删除 node_modules
rm -rf node_modules backend/node_modules frontend/node_modules admin/node_modules

# 删除 lock 文件
rm pnpm-lock.yaml

# 重新安装
pnpm install
```

### 6.5 前端页面空白
**症状**: 浏览器打开前端显示空白

**排查步骤**:
1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签是否有错误
3. 查看 Network 标签，检查 API 请求是否成功
4. 确认后端是否正常运行
5. 检查 .env 文件中的 API 地址是否正确

### 6.6 热重载不工作
**症状**: 修改代码后页面不自动刷新

**解决方案**:
```bash
# 重启开发服务器
# Ctrl+C 停止，然后重新运行
pnpm dev
```

### 6.7 导入数据失败
**症状**: 运行 import 脚本失败

**解决方案**:
```bash
# 检查数据文件是否存在
ls backend/scripts/

# 手动运行脚本查看详细错误
cd backend
pnpm run import:products
```

---

## 7. 开发工具推荐

### 7.1 IDE
- **VS Code** (推荐)
  - 安装插件: ESLint, Prettier, TypeScript
- **WebStorm**

### 7.2 数据库管理工具
- **MySQL Workbench** (官方工具)
- **DBeaver** (免费、跨平台)
- **TablePlus** (macOS)
- **Navicat** (付费)

### 7.3 API 测试工具
- **Postman**
- **Insomnia**
- **Thunder Client** (VS Code 插件)

### 7.4 Redis 管理工具
- **RedisInsight** (官方工具)
- **Another Redis Desktop Manager**

---

## 8. 开发流程

### 8.1 日常开发
```bash
# 1. 拉取最新代码
git pull origin master

# 2. 安装新依赖（如果有）
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 开始开发...

# 5. 提交代码
git add .
git commit -m "feat: your feature description"
git push origin your-branch
```

### 8.2 数据库重置
```bash
# 清空数据库
mysql -u jpuser -p123456 vietnam_test

# 在 MySQL 中执行
SET FOREIGN_KEY_CHECKS = 0;
-- 生成清空命令
SELECT CONCAT('TRUNCATE TABLE `', table_name, '`;')
FROM information_schema.tables
WHERE table_schema = 'vietnam_test';
-- 复制并执行生成的命令
SET FOREIGN_KEY_CHECKS = 1;
EXIT;

# 重新导入数据
cd backend
pnpm run import:products
pnpm run import:base-info
pnpm run create-admin
```

### 8.3 查看日志
```bash
# 后端日志会直接输出到终端
# 如果需要查看详细日志，可以在代码中添加 console.log

# 查看 MySQL 日志
# macOS
tail -f /usr/local/var/mysql/*.err

# Linux
sudo tail -f /var/log/mysql/error.log
```

---

## 9. 快速参考

### 常用命令
```bash
# 安装依赖
pnpm install

# 启动所有服务
pnpm dev

# 单独启动
pnpm dev:backend
pnpm dev:frontend
pnpm dev:admin

# 构建（测试生产构建）
pnpm build

# 数据导入
pnpm --filter jp-vietnam import:products
pnpm --filter jp-vietnam import:base-info
pnpm --filter jp-vietnam create-admin

# 清理
pnpm clean
```

### 访问地址
- 前端: http://localhost:5173
- 管理后台: http://localhost:5176
- 后端 API: http://localhost:3000
- API 文档: http://localhost:3000/api (如果配置了 Swagger)

---

## 10. 下一步

开发环境搭建完成后，你可以：
1. 查看 README.md 了解项目结构
2. 查看各个模块的文档
3. 开始开发新功能
4. 运行测试（如果有）

如需部署到生产环境，请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**文档版本**: v1.0
**最后更新**: 2026-03-08
**适用环境**: 开发环境 (Development)
