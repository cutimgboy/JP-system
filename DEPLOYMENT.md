# JP-system 项目部署实施文档

## 目录
- [1. 项目架构](#1-项目架构)
- [2. 服务器环境要求](#2-服务器环境要求)
- [3. 环境准备](#3-环境准备)
- [4. 数据库配置](#4-数据库配置)
- [5. 项目部署](#5-项目部署)
- [6. Nginx 配置](#6-nginx-配置)
- [7. 进程管理](#7-进程管理)
- [8. Docker 部署（可选）](#8-docker-部署可选)
- [9. 监控与日志](#9-监控与日志)
- [10. 故障排查](#10-故障排查)
- [11. 性能优化](#11-性能优化)
- [12. 安全建议](#12-安全建议)

---

## 1. 项目架构

### 1.1 技术栈
- **包管理**: pnpm workspace (monorepo)
- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式框架**: Tailwind CSS v4
- **后端框架**: NestJS + TypeORM
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **进程管理**: PM2
- **反向代理**: Nginx

### 1.2 项目结构
```
JP-system/
├── frontend/          # 用户端 (React + Vite)
├── admin/            # 管理后台 (React + Vite)
├── backend/          # 后端服务 (NestJS)
├── pnpm-workspace.yaml
└── package.json
```

### 1.3 服务端口
- **Backend API**: 3000 (内部)
- **Frontend**: 80 (通过 Nginx)
- **Admin**: 8080 (通过 Nginx)
- **MySQL**: 3306 (内部)
- **Redis**: 6379 (内部)

---

## 2. 服务器环境要求

### 2.1 最低配置
- **CPU**: 2核
- **内存**: 4GB
- **硬盘**: 50GB
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **Node.js**: >= 18.0.0

### 2.2 推荐配置
- **CPU**: 4核
- **内存**: 8GB
- **硬盘**: 100GB SSD
- **操作系统**: Ubuntu 22.04 LTS
- **Node.js**: 20.x LTS

### 2.3 需要的端口
- `80`: HTTP - 前端 (Nginx)
- `8080`: HTTP - 管理后台 (Nginx)
- `3000`: 后端 API (内部)
- `3306`: MySQL (内部)
- `6379`: Redis (内部)
- `22`: SSH (管理)

---

## 3. 环境准备

### 3.1 更新系统
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

### 3.2 安装 Node.js (v18+)
```bash
# 使用 nvm 安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v  # 验证版本

# 或使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3.3 安装 pnpm
```bash
npm install -g pnpm
pnpm -v  # 验证版本
```

### 3.4 安装 MySQL 8.0
```bash
# Ubuntu/Debian
sudo apt install mysql-server -y

# CentOS
sudo yum install mysql-server -y

# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

### 3.5 安装 Redis
```bash
# Ubuntu/Debian
sudo apt install redis-server -y

# CentOS
sudo yum install redis -y

# 启动 Redis
sudo systemctl start redis
sudo systemctl enable redis

# 验证
redis-cli ping  # 应返回 PONG
```

### 3.6 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS
sudo yum install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.7 安装 PM2 (进程管理)
```bash
npm install -g pm2
pm2 -v  # 验证版本
```

### 3.8 安装 Git
```bash
# Ubuntu/Debian
sudo apt install git -y

# CentOS
sudo yum install git -y

git --version  # 验证版本
```

---

## 4. 数据库配置

### 4.1 创建数据库和用户
```bash
# 登录 MySQL
sudo mysql -u root -p

# 执行以下 SQL
CREATE DATABASE vietnam_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jpuser'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON vietnam_test.* TO 'jpuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4.2 配置 MySQL
编辑 MySQL 配置文件：
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

添加或修改以下配置：
```ini
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
max_connections=500
max_allowed_packet=64M
```

重启 MySQL：
```bash
sudo systemctl restart mysql
```

---

## 5. 项目部署

### 5.1 克隆代码
```bash
# 创建项目目录
sudo mkdir -p /var/www
cd /var/www

# 克隆仓库（替换为你的仓库地址）
sudo git clone <your-repository-url> JP-system
cd JP-system

# 设置权限
sudo chown -R $USER:$USER /var/www/JP-system
```

### 5.2 安装依赖
```bash
cd /var/www/JP-system

# 使用 pnpm workspace 安装所有依赖
pnpm install
```

### 5.3 配置后端环境变量
```bash
cd /var/www/JP-system/backend

# 复制环境配置文件
cp .env.dev .env.production

# 编辑生产环境配置
nano .env.production
```

**后端环境变量配置** (`.env.production`):
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=jpuser
DB_PASSWD=your_strong_password_here
DB_DATABASE=vietnam_test

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
# REDIS_PASSWORD=your_redis_password  # 如果设置了密码

# JWT 配置
JWT_SECRET=your_jwt_secret_key_change_this_in_production_min_32_chars
JWT_EXPIRES_IN=7d

# 服务端口
PORT=3000

# 环境
NODE_ENV=production

# Google OAuth 配置（可选）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://119.29.161.60/auth/google/callback

# Facebook OAuth 配置（可选）
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://119.29.161.60/auth/facebook/callback

# WebSocket 行情源配置
QUOTE_WS_TOKEN=your-quote-ws-token
TARGET_STOCK_SYMBOLS=NVDA.US,MSFT.US,AAPL.US,AMZN.US,GOOG.US

# 缓存配置
STOCK_QUOTE_CACHE_TTL=60
ALL_QUOTES_CACHE_TTL=2
SPREAD_CACHE_TTL=300

# 性能配置
ENABLE_PRICE_CHANGE_LOG=true
CLEANUP_OLD_RECORDS_DAYS=30
MAX_CONCURRENT_DB_WRITES=10

# 生产环境关闭模拟数据
MOCK_QUOTE_DATA=false
```

### 5.4 配置前端环境变量
```bash
cd /var/www/JP-system/frontend

# 创建生产环境配置
cat > .env.production << 'EOF'
VITE_API_URL=http://119.29.161.60
EOF
```

### 5.5 配置管理后台环境变量
```bash
cd /var/www/JP-system/admin

# 创建生产环境配置
cat > .env.production << 'EOF'
VITE_API_URL=http://119.29.161.60
EOF
```

### 5.6 构建项目
```bash
cd /var/www/JP-system

# 构建所有项目（后端、前端、管理后台）
pnpm build

# 或者单独构建
# pnpm build:backend
# pnpm build:frontend
# pnpm build:admin
```

### 5.7 数据库初始化
```bash
cd /var/www/JP-system/backend

# 检查初始化脚本是否存在
ls -la scripts/

# 如果有初始化 SQL 文件
mysql -u jpuser -p vietnam_test < scripts/init.sql

# 运行数据导入脚本（注意是连字符，不是冒号）
pnpm run import-products
pnpm run import-base-info

# 创建管理员账户
pnpm run create-admin
```

**注意**：
- 如果 `scripts/` 目录不存在或脚本文件缺失，可以跳过这一步
- 可以在后端启动后通过 API 或数据库手动添加初始数据

### 5.8 启动后端服务

#### 验证构建结果
```bash
# 确认 main.js 文件存在
ls -la /var/www/JP-system/backend/dist/src/main.js

# 如果文件不存在，需要重新构建
cd /var/www/JP-system/backend
pnpm run build
```

#### 创建 PM2 配置文件
```bash
cd /var/www/JP-system

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'jp-backend',
    script: 'dist/src/main.js',
    cwd: '/var/www/JP-system/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/jp-backend-error.log',
    out_file: '/var/log/jp-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    min_uptime: '10s',
    max_restarts: 10
  }]
};
EOF
```

**注意**：
- `script` 路径是 `dist/src/main.js`（不是 `dist/main.js`）
- 使用单实例模式（`instances: 1, exec_mode: 'fork'`）更稳定
- 环境变量通过后端代码中的 `ConfigModule` 加载 `.env.production`

#### 启动应用
```bash
# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
# 复制并执行上面命令输出的命令

# 查看状态
pm2 status

# 查看日志
pm2 logs jp-backend --lines 50

# 如果启动失败，查看错误日志
pm2 logs jp-backend --err --lines 100
```

#### 测试后端 API
```bash
# 测试健康检查接口
curl http://localhost:3000/api/health

# 或者测试根路径
curl http://localhost:3000/
```

---

## 6. Nginx 配置

### 6.1 创建 Nginx 配置文件
```bash
sudo vi /etc/nginx/sites-available/jp-system
```

配置内容：
```nginx
# 前端配置
server {
    listen 80;
    server_name 119.29.161.60;

    root /var/www/JP-system/frontend/dist;
    index index.html;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 增加请求体大小限制
        client_max_body_size 10M;
    }

    # 直接代理后端路由(不带/api前缀)
    location ~ ^/(auth|users|products|orders|quotes|health|admin) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        client_max_body_size 10M;
    }

    # WebSocket 支持
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;
}

# 管理后台配置（使用不同端口）
server {
    listen 8080;
    server_name 119.29.161.60;

    root /var/www/JP-system/admin/dist;
    index index.html;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 增加请求体大小限制
        client_max_body_size 10M;
    }

    # 直接代理后端路由(不带/api前缀)
    location ~ ^/(auth|users|products|orders|quotes|health|admin) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;
}
```

**注意**: 由于使用 IP 地址而非域名，管理后台使用不同端口（8080）来区分。

### 6.2 启用配置
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/jp-system /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx
```

### 6.3 开放端口
由于使用 IP 地址访问，需要确保防火墙开放相应端口：
```bash
# Ubuntu UFW
sudo ufw allow 80/tcp     # 前端
sudo ufw allow 8080/tcp   # 管理后台
sudo ufw allow 22/tcp     # SSH
sudo ufw status

# CentOS Firewalld
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

**注意**:
- 前端访问地址: http://119.29.161.60
- 管理后台访问地址: http://119.29.161.60:8080
- 由于使用 IP 地址，无法申请免费的 Let's Encrypt SSL 证书
- 如需 HTTPS，需要购买 SSL 证书或使用自签名证书

---

## 7. 进程管理

### 7.1 PM2 常用命令
```bash
# 查看所有进程
pm2 list

# 查看实时日志
pm2 logs jp-backend

# 查看最近 100 行日志
pm2 logs jp-backend --lines 100

# 只查看错误日志
pm2 logs jp-backend --err

# 重启应用
pm2 restart jp-backend

# 重载应用（零停机）
pm2 reload jp-backend

# 停止应用
pm2 stop jp-backend

# 删除应用
pm2 delete jp-backend

# 监控
pm2 monit

# 查看详细信息
pm2 show jp-backend

# 清空日志
pm2 flush
```

### 7.2 更新部署脚本
创建自动化部署脚本：
```bash
cat > /var/www/JP-system/deploy.sh << 'EOF'
#!/bin/bash

set -e  # 遇到错误立即退出

echo "=========================================="
echo "开始部署 JP-system..."
echo "=========================================="

# 进入项目目录
cd /var/www/JP-system

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin master

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建项目
echo "🔨 构建项目..."
pnpm build

# 重启后端服务
echo "🔄 重启后端服务..."
pm2 reload jp-backend

# 重启 Nginx
echo "🔄 重启 Nginx..."
sudo systemctl reload nginx

# 检查服务状态
echo "✅ 检查服务状态..."
pm2 status

echo "=========================================="
echo "部署完成！"
echo "=========================================="

# 显示最近的日志
pm2 logs jp-backend --lines 20 --nostream
EOF

chmod +x /var/www/JP-system/deploy.sh
```

使用部署脚本：
```bash
/var/www/JP-system/deploy.sh
```

### 7.3 健康检查
测试服务是否正常运行：
```bash
# 检查后端 API
curl http://localhost:3000/api/health

# 检查前端
curl http://119.29.161.60/

# 检查管理后台
curl http://119.29.161.60:8080/
```

---

## 8. Docker 部署（可选）

### 8.1 创建 Docker Compose 配置
```bash
cd /var/www/JP-system

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: jp-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: your_root_password
      MYSQL_DATABASE: vietnam_test
      MYSQL_USER: jpuser
      MYSQL_PASSWORD: your_strong_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/scripts:/docker-entrypoint-initdb.d
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

  redis:
    image: redis:7-alpine
    container_name: jp-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: jp-backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    depends_on:
      - mysql
      - redis
    volumes:
      - ./backend/logs:/app/logs

  nginx:
    image: nginx:alpine
    container_name: jp-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend/dist:/usr/share/nginx/html/frontend:ro
      - ./admin/dist:/usr/share/nginx/html/admin:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend

volumes:
  mysql_data:
  redis_data:
EOF
```

### 8.2 创建后端 Dockerfile
```bash
cd /var/www/JP-system/backend

cat > Dockerfile << 'EOF'
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建
RUN pnpm run build

# 生产镜像
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main.js"]
EOF
```

### 8.3 使用 Docker 部署
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down

# 重启服务
docker-compose restart backend
```

---

## 9. 监控与日志

### 9.1 日志位置
- **后端日志**: `/var/log/jp-backend-*.log`
- **Nginx 访问日志**: `/var/log/nginx/access.log`
- **Nginx 错误日志**: `/var/log/nginx/error.log`
- **MySQL 日志**: `/var/log/mysql/error.log`
- **Redis 日志**: `/var/log/redis/redis-server.log`

### 9.2 查看日志
```bash
# 实时查看后端日志
pm2 logs jp-backend --lines 100

# 查看 Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看 MySQL 错误日志
sudo tail -f /var/log/mysql/error.log

# 查看系统日志
sudo journalctl -u nginx -f
sudo journalctl -u mysql -f
```

### 9.3 日志轮转
创建日志轮转配置：
```bash
sudo nano /etc/logrotate.d/jp-system
```

内容：
```
/var/log/jp-backend-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

测试日志轮转：
```bash
sudo logrotate -f /etc/logrotate.d/jp-system
```

### 9.4 监控工具

#### 安装 htop
```bash
sudo apt install htop -y
htop
```

#### 安装 Netdata（实时监控）
```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# 访问 http://your-server-ip:19999
```

#### PM2 监控
```bash
# 实时监控
pm2 monit

# Web 监控（可选）
pm2 install pm2-server-monit
```

---

## 10. 故障排查

### 10.1 后端无法启动
**症状**: PM2 启动后立即退出或不断重启

**排查步骤**:
```bash
# 1. 查看详细错误日志
pm2 logs jp-backend --err --lines 50

# 2. 检查环境变量配置
cat /var/www/JP-system/backend/.env.production

# 3. 测试数据库连接
mysql -u jpuser -p -h localhost vietnam_test

# 4. 检查 Redis 连接
redis-cli ping

# 5. 检查端口占用
sudo netstat -tulpn | grep 3000
sudo lsof -i :3000

# 6. 手动启动测试
cd /var/www/JP-system/backend
node dist/main.js
```

**常见原因**:
- 数据库连接失败（检查用户名、密码、数据库名）
- Redis 连接失败
- 端口被占用
- 环境变量配置错误
- 缺少依赖包

### 10.2 前端页面空白或 404
**症状**: 访问前端显示空白页面或 404 错误

**排查步骤**:
```bash
# 1. 检查构建文件是否存在
ls -la /var/www/JP-system/frontend/dist
ls -la /var/www/JP-system/admin/dist

# 2. 检查 Nginx 配置
sudo nginx -t
cat /etc/nginx/sites-available/jp-system

# 3. 检查文件权限
sudo chown -R www-data:www-data /var/www/JP-system/frontend/dist
sudo chown -R www-data:www-data /var/www/JP-system/admin/dist

# 4. 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 5. 检查浏览器控制台错误
# 打开浏览器开发者工具 (F12) 查看 Console 和 Network 标签
```

**常见原因**:
- 未执行 `pnpm build`
- Nginx root 路径配置错误
- 文件权限问题
- API 地址配置错误（检查 .env.production）

### 10.3 数据库连接失败
**症状**: 后端日志显示数据库连接错误

**排查步骤**:
```bash
# 1. 检查 MySQL 是否运行
sudo systemctl status mysql

# 2. 测试数据库连接
mysql -u jpuser -p -h localhost vietnam_test

# 3. 检查用户权限
mysql -u root -p
SHOW GRANTS FOR 'jpuser'@'localhost';

# 4. 检查防火墙
sudo ufw status
sudo ufw allow 3306/tcp

# 5. 检查 MySQL 配置
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# 确保 bind-address = 127.0.0.1
```

**常见原因**:
- MySQL 服务未启动
- 用户名或密码错误
- 数据库不存在
- 用户权限不足
- 防火墙阻止连接

### 10.4 Nginx 502 Bad Gateway
**症状**: 访问 API 返回 502 错误

**排查步骤**:
```bash
# 1. 检查后端是否运行
pm2 status
pm2 logs jp-backend

# 2. 测试后端端口
curl http://localhost:3000/api/health

# 3. 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 4. 检查 SELinux (CentOS)
sudo getenforce
sudo setenforce 0  # 临时关闭测试

# 5. 检查 Nginx 配置
sudo nginx -t
```

**常见原因**:
- 后端服务未启动或崩溃
- 端口配置错误
- SELinux 阻止连接
- 防火墙规则问题

### 10.5 内存不足
**症状**: 服务器内存占用过高，服务变慢或崩溃

**排查步骤**:
```bash
# 1. 查看内存使用
free -h
htop

# 2. 查看进程内存占用
pm2 monit
ps aux --sort=-%mem | head -10

# 3. 限制 PM2 内存使用
pm2 restart jp-backend --max-memory-restart 500M

# 4. 减少 PM2 实例数
# 编辑 ecosystem.config.js，将 instances 改为 1
pm2 restart jp-backend
```

**解决方案**:
```bash
# 添加 swap 空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 验证 swap
free -h
```

### 10.6 WebSocket 连接失败
**症状**: 实时行情不更新，WebSocket 连接失败

**排查步骤**:
```bash
# 1. 检查后端 WebSocket 服务
pm2 logs jp-backend | grep -i websocket

# 2. 测试 WebSocket 连接
# 使用浏览器开发者工具 Network 标签查看 WS 连接

# 3. 检查 Nginx WebSocket 配置
sudo nano /etc/nginx/sites-available/jp-system
# 确保有 Upgrade 和 Connection 头配置

# 4. 检查防火墙
sudo ufw status
```

### 10.7 pnpm 安装失败
**症状**: pnpm install 报错或卡住

**解决方案**:
```bash
# 清理缓存
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install

# 如果还是失败，尝试使用 npm
npm install
```

---

## 11. 性能优化

### 11.1 防火墙配置
```bash
# Ubuntu UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS Firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 11.2 定期备份
创建备份脚本：
```bash
cat > /var/www/JP-system/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/jp-system"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u jpuser -p'your_password' vietnam_test > $BACKUP_DIR/db_$DATE.sql

# 备份代码
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /var/www/JP-system

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $DATE"
EOF

chmod +x /var/www/JP-system/backup.sh

# 添加定时任务
crontab -e
# 添加: 0 2 * * * /var/www/JP-system/backup.sh
```

### 11.3 更新系统
```bash
# 定期更新系统
sudo apt update && sudo apt upgrade -y

# 更新 Node.js 依赖
cd /var/www/JP-system/backend
pnpm update

cd /var/www/JP-system/frontend
pnpm update

cd /var/www/JP-system/admin
pnpm update
```

### 11.1 数据库优化
```sql
-- 连接到数据库
USE vietnam_test;

-- 为常用查询字段添加索引
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE users ADD INDEX idx_phone (phone);
ALTER TABLE trade_orders ADD INDEX idx_user_id (user_id);
ALTER TABLE trade_orders ADD INDEX idx_status (status);
ALTER TABLE trade_orders ADD INDEX idx_created_at (created_at);
ALTER TABLE products ADD INDEX idx_symbol (symbol);

-- 启用慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow-query.log';

-- 查看表状态
SHOW TABLE STATUS;

-- 优化表
OPTIMIZE TABLE users, trade_orders, products;
```

### 11.2 Redis 优化
```bash
# 编辑 Redis 配置
sudo nano /etc/redis/redis.conf

# 添加或修改以下配置
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000

# 重启 Redis
sudo systemctl restart redis
```

### 11.3 Nginx 优化
编辑 `/etc/nginx/nginx.conf`：
```nginx
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    # 基础优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/atom+xml image/svg+xml;

    # 缓存配置
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m
                     max_size=1g inactive=60m use_temp_path=off;

    # 包含站点配置
    include /etc/nginx/sites-enabled/*;
}
```

### 11.4 PM2 优化
```bash
# 编辑 ecosystem.config.js
nano /var/www/JP-system/ecosystem.config.js
```

优化配置：
```javascript
module.exports = {
  apps: [{
    name: 'jp-backend',
    script: './backend/dist/main.js',
    cwd: '/var/www/JP-system/backend',
    instances: 'max',  // 使用所有 CPU 核心
    exec_mode: 'cluster',
    env_file: '.env.production',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Node.js 优化参数
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 11.5 系统优化
```bash
# 增加文件描述符限制
sudo nano /etc/security/limits.conf

# 添加以下内容
* soft nofile 65535
* hard nofile 65535

# 优化内核参数
sudo nano /etc/sysctl.conf

# 添加以下内容
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 1024 65535

# 应用配置
sudo sysctl -p
```

---

## 12. 安全建议

### 12.1 防火墙配置
```bash
# Ubuntu UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP - 前端
sudo ufw allow 8080/tcp    # HTTP - 管理后台
sudo ufw enable
sudo ufw status

# CentOS Firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

### 12.2 SSH 安全加固
```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 修改以下配置
Port 2222                    # 更改默认端口
PermitRootLogin no          # 禁止 root 登录
PasswordAuthentication no   # 禁用密码登录（使用密钥）
MaxAuthTries 3              # 限制认证尝试次数

# 重启 SSH 服务
sudo systemctl restart sshd

# 记得在防火墙中开放新端口
sudo ufw allow 2222/tcp
```

### 12.3 定期备份
创建自动备份脚本：
```bash
cat > /var/www/JP-system/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/jp-system"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u jpuser -p'your_password' vietnam_test | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# 备份上传文件（如果有）
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/JP-system/backend/uploads 2>/dev/null || true

# 删除 30 天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "备份完成: $DATE"
EOF

chmod +x /var/www/JP-system/backup.sh

# 添加定时任务（每天凌晨 2 点执行）
crontab -e
# 添加: 0 2 * * * /var/www/JP-system/backup.sh >> /var/log/jp-backup.log 2>&1
```

### 12.4 环境变量安全
```bash
# 确保环境变量文件权限正确
chmod 600 /var/www/JP-system/backend/.env.production

# 不要将 .env 文件提交到 Git
echo ".env*" >> /var/www/JP-system/.gitignore
```

### 12.5 定期更新
```bash
# 创建更新脚本
cat > /var/www/JP-system/update-system.sh << 'EOF'
#!/bin/bash

echo "更新系统..."
sudo apt update && sudo apt upgrade -y

echo "更新 Node.js 依赖..."
cd /var/www/JP-system
pnpm update

echo "重启服务..."
pm2 restart jp-backend

echo "更新完成！"
EOF

chmod +x /var/www/JP-system/update-system.sh

# 每月执行一次（添加到 crontab）
# 0 3 1 * * /var/www/JP-system/update-system.sh >> /var/log/jp-update.log 2>&1
```

### 12.6 安全检查清单
- [ ] 已配置防火墙，只开放必要端口（22, 80, 8080）
- [ ] SSH 已加固（更改端口、禁用 root 登录）
- [ ] 数据库只监听 localhost
- [ ] Redis 已设置密码（如需要）
- [ ] 环境变量文件权限正确（600）
- [ ] 已设置自动备份
- [ ] 定期更新系统和依赖
- [ ] 日志轮转已配置
- [ ] 监控系统已部署
- [ ] 强密码策略已实施

---

## 13. 部署验证清单

### 13.1 服务检查
```bash
# 检查所有服务状态
sudo systemctl status mysql
sudo systemctl status redis
sudo systemctl status nginx
pm2 status

# 检查端口监听
sudo netstat -tulpn | grep -E '(3000|3306|6379|80|443)'
```

### 13.2 功能测试
```bash
# 测试后端 API
curl http://localhost:3000/api/health
curl http://119.29.161.60/api/health

# 测试数据库连接
mysql -u jpuser -p vietnam_test -e "SELECT 1;"

# 测试 Redis 连接
redis-cli ping

# 测试前端访问
curl -I http://119.29.161.60
curl -I http://119.29.161.60:8080
```

### 13.3 验证清单
- [ ] 后端 API 可访问: `http://119.29.161.60/api/health`
- [ ] 前端页面正常显示: `http://119.29.161.60`
- [ ] 管理后台可登录: `http://119.29.161.60:8080`
- [ ] 数据库连接正常
- [ ] Redis 连接正常
- [ ] PM2 进程运行正常（`pm2 status`）
- [ ] Nginx 配置正确（`sudo nginx -t`）
- [ ] 日志正常记录
- [ ] 备份脚本测试通过
- [ ] WebSocket 连接正常
- [ ] 防火墙配置正确（端口 80, 8080, 22 已开放）
- [ ] 监控系统运行正常

---

## 14. 快速参考

### 常用命令
```bash
# 查看服务状态
pm2 status
sudo systemctl status nginx mysql redis

# 查看日志
pm2 logs jp-backend
sudo tail -f /var/log/nginx/error.log

# 重启服务
pm2 restart jp-backend
sudo systemctl restart nginx

# 部署更新
/var/www/JP-system/deploy.sh

# 备份数据
/var/www/JP-system/backup.sh

# 查看系统资源
htop
free -h
df -h
```

### 紧急恢复
```bash
# 回滚到上一个版本
cd /var/www/JP-system
git log --oneline -5
git reset --hard <commit-hash>
/var/www/JP-system/deploy.sh

# 恢复数据库备份
gunzip < /var/backups/jp-system/db_YYYYMMDD_HHMMSS.sql.gz | mysql -u jpuser -p vietnam_test
```

---

## 15. 联系与支持

如遇到部署问题，请按以下顺序排查：
1. 查看日志文件（PM2、Nginx、MySQL）
2. 检查环境配置（.env 文件）
3. 验证网络连接和端口
4. 检查服务状态
5. 参考故障排查章节

---

**文档版本**: v2.0
**最后更新**: 2026-03-08
**适用项目**: JP-system (Frontend + Admin + Backend)
