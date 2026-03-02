# JP-system 项目部署实施文档

## 目录
- [1. 服务器环境要求](#1-服务器环境要求)
- [2. 环境准备](#2-环境准备)
- [3. 数据库配置](#3-数据库配置)
- [4. 后端部署](#4-后端部署)
- [5. 前端部署](#5-前端部署)
- [6. 管理后台部署](#6-管理后台部署)
- [7. Nginx 配置](#7-nginx-配置)
- [8. 进程管理](#8-进程管理)
- [9. 监控与日志](#9-监控与日志)
- [10. 常见问题](#10-常见问题)

---

## 1. 服务器环境要求

### 最低配置
- **CPU**: 2核
- **内存**: 4GB
- **硬盘**: 50GB
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+

### 推荐配置
- **CPU**: 4核
- **内存**: 8GB
- **硬盘**: 100GB SSD
- **操作系统**: Ubuntu 22.04 LTS

### 需要的端口
- `80`: HTTP (Nginx)
- `443`: HTTPS (Nginx)
- `3000`: 后端 API (内部)
- `3306`: MySQL (内部)
- `6379`: Redis (内部)

---

## 2. 环境准备

### 2.1 更新系统
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

### 2.2 安装 Node.js (v18+)
```bash
# 使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node -v  # 验证版本
```

### 2.3 安装 pnpm
```bash
npm install -g pnpm
pnpm -v  # 验证版本
```

### 2.4 安装 MySQL 8.0
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

### 2.5 安装 Redis
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

### 2.6 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS
sudo yum install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.7 安装 PM2 (进程管理)
```bash
npm install -g pm2
pm2 -v  # 验证版本
```

### 2.8 安装 Git
```bash
# Ubuntu/Debian
sudo apt install git -y

# CentOS
sudo yum install git -y

git --version  # 验证版本
```

---

## 3. 数据库配置

### 3.1 创建数据库和用户
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

### 3.2 配置 MySQL
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

## 4. 后端部署

### 4.1 克隆代码
```bash
# 创建项目目录
sudo mkdir -p /var/www
cd /var/www

# 克隆仓库
sudo git clone https://github.com/cutimgboy/JP-system.git
cd JP-system

# 设置权限
sudo chown -R $USER:$USER /var/www/JP-system
```

### 4.2 配置环境变量
```bash
cd /var/www/JP-system/backend

# 复制环境配置文件
cp .env.dev .env.production

# 编辑生产环境配置
nano .env.production
```

配置内容：
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=jpuser
DB_PASSWD=your_strong_password
DB_DATABASE=vietnam_test

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 配置
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# 服务端口
PORT=3000

# 环境
NODE_ENV=production

# 邮件配置（如需要）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# 短信配置（如需要）
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
```

### 4.3 安装依赖
```bash
cd /var/www/JP-system/backend
pnpm install --prod
```

### 4.4 构建项目
```bash
pnpm run build
```

### 4.5 数据库初始化
```bash
# 导入基础数据（如果有 SQL 文件）
mysql -u jpuser -p vietnam_test < scripts/init.sql

# 或者运行导入脚本
pnpm run import:products
pnpm run import:base-info
```

### 4.6 使用 PM2 启动后端
```bash
# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'jp-backend',
    script: 'dist/main.js',
    cwd: '/var/www/JP-system/backend',
    instances: 2,
    exec_mode: 'cluster',
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
    watch: false
  }]
};
EOF

# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
# 执行上面命令输出的命令

# 查看状态
pm2 status
pm2 logs jp-backend
```

---

## 5. 前端部署

### 5.1 配置环境变量
```bash
cd /var/www/JP-system/frontend

# 创建生产环境配置
cat > .env.production << 'EOF'
VITE_API_URL=https://your-domain.com
EOF
```

### 5.2 安装依赖并构建
```bash
pnpm install
pnpm run build
```

构建完成后，静态文件会生成在 `dist` 目录。

---

## 6. 管理后台部署

### 6.1 配置环境变量
```bash
cd /var/www/JP-system/admin

# 创建生产环境配置
cat > .env.production << 'EOF'
VITE_API_URL=https://your-domain.com
EOF
```

### 6.2 安装依赖并构建
```bash
pnpm install
pnpm run build
```

构建完成后，静态文件会生成在 `dist` 目录。

---

## 7. Nginx 配置

### 7.1 创建 Nginx 配置文件
```bash
sudo nano /etc/nginx/sites-available/jp-system
```

配置内容：
```nginx
# 前端配置
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS（可选）
    # return 301 https://$server_name$request_uri;

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
    }

    # WebSocket 支持（如需要）
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
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
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}

# 管理后台配置
server {
    listen 80;
    server_name admin.your-domain.com;

    root /var/www/JP-system/admin/dist;
    index index.html;

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
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

### 7.2 启用配置
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/jp-system /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 7.3 配置 SSL (可选但推荐)
使用 Let's Encrypt 免费 SSL 证书：
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com -d admin.your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 8. 进程管理

### 8.1 PM2 常用命令
```bash
# 查看所有进程
pm2 list

# 查看日志
pm2 logs jp-backend

# 重启应用
pm2 restart jp-backend

# 停止应用
pm2 stop jp-backend

# 删除应用
pm2 delete jp-backend

# 监控
pm2 monit

# 查看详细信息
pm2 show jp-backend
```

### 8.2 更新部署
创建部署脚本：
```bash
cat > /var/www/JP-system/deploy.sh << 'EOF'
#!/bin/bash

echo "开始部署..."

# 进入项目目录
cd /var/www/JP-system

# 拉取最新代码
echo "拉取最新代码..."
git pull origin master

# 后端部署
echo "部署后端..."
cd backend
pnpm install --prod
pnpm run build
pm2 restart jp-backend

# 前端部署
echo "部署前端..."
cd ../frontend
pnpm install
pnpm run build

# 管理后台部署
echo "部署管理后台..."
cd ../admin
pnpm install
pnpm run build

# 重启 Nginx
echo "重启 Nginx..."
sudo systemctl reload nginx

echo "部署完成！"
EOF

chmod +x /var/www/JP-system/deploy.sh
```

使用部署脚本：
```bash
/var/www/JP-system/deploy.sh
```

---

## 9. 监控与日志

### 9.1 日志位置
- **后端日志**: `/var/log/jp-backend-*.log`
- **Nginx 访问日志**: `/var/log/nginx/access.log`
- **Nginx 错误日志**: `/var/log/nginx/error.log`
- **MySQL 日志**: `/var/log/mysql/error.log`

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

### 9.4 监控工具 (可选)
```bash
# 安装 htop
sudo apt install htop -y

# 安装 netdata (实时监控)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
# 访问 http://your-server-ip:19999
```

---

## 10. 常见问题

### 10.1 后端无法启动
**问题**: PM2 启动后立即退出

**解决方案**:
```bash
# 查看详细错误日志
pm2 logs jp-backend --err

# 检查环境变量
cat /var/www/JP-system/backend/.env.production

# 检查数据库连接
mysql -u jpuser -p vietnam_test

# 检查端口占用
sudo netstat -tulpn | grep 3000
```

### 10.2 前端页面空白
**问题**: 访问前端显示空白页面

**解决方案**:
```bash
# 检查构建文件是否存在
ls -la /var/www/JP-system/frontend/dist

# 检查 Nginx 配置
sudo nginx -t

# 查看浏览器控制台错误
# 检查 API 地址配置是否正确
```

### 10.3 数据库连接失败
**问题**: 后端无法连接数据库

**解决方案**:
```bash
# 检查 MySQL 是否运行
sudo systemctl status mysql

# 测试数据库连接
mysql -u jpuser -p -h localhost vietnam_test

# 检查防火墙
sudo ufw status

# 检查 MySQL 用户权限
mysql -u root -p
SHOW GRANTS FOR 'jpuser'@'localhost';
```

### 10.4 Nginx 502 错误
**问题**: 访问 API 返回 502 Bad Gateway

**解决方案**:
```bash
# 检查后端是否运行
pm2 status

# 检查后端端口
curl http://localhost:3000/api/health

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查 SELinux (CentOS)
sudo setenforce 0
```

### 10.5 内存不足
**问题**: 服务器内存占用过高

**解决方案**:
```bash
# 查看内存使用
free -h

# 限制 PM2 内存使用
pm2 restart jp-backend --max-memory-restart 500M

# 减少 PM2 实例数
# 编辑 ecosystem.config.js，将 instances 改为 1

# 添加 swap 空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 11. 安全建议

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

---

## 12. 性能优化

### 12.1 启用 Redis 缓存
确保 Redis 配置正确并在后端使用缓存。

### 12.2 数据库优化
```sql
-- 添加索引
USE vietnam_test;

-- 为常用查询字段添加索引
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE trade_orders ADD INDEX idx_user_id (user_id);
ALTER TABLE trade_orders ADD INDEX idx_created_at (created_at);

-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';
```

### 12.3 Nginx 优化
编辑 `/etc/nginx/nginx.conf`：
```nginx
worker_processes auto;
worker_connections 2048;

# 启用 HTTP/2
listen 443 ssl http2;

# 启用缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
```

---

## 13. 联系与支持

如遇到部署问题，请检查：
1. 日志文件
2. 环境配置
3. 网络连接
4. 服务状态

---

**部署完成后的验证清单**:
- [ ] 后端 API 可访问: `http://your-domain.com/api/health`
- [ ] 前端页面正常显示
- [ ] 管理后台可登录
- [ ] 数据库连接正常
- [ ] Redis 连接正常
- [ ] PM2 进程运行正常
- [ ] Nginx 配置正确
- [ ] SSL 证书有效（如配置）
- [ ] 日志正常记录
- [ ] 备份脚本测试通过

---

**文档版本**: v1.0
**最后更新**: 2026-03-02
