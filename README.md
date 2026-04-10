# JP System

JP 交易系统 - 包含用户端、后台管理系统和后端服务

## 项目结构

```
jp-system/
├── frontend/          # 用户端前端 (React + Vite)
├── admin/            # 后台管理系统 (React + Vite)
├── backend/          # 后端服务 (NestJS)
├── pnpm-workspace.yaml
└── package.json      # 根目录配置
```

## 技术栈

- **包管理器**: pnpm (workspace)
- **前端框架**: React 19 + TypeScript
- **后端框架**: NestJS
- **构建工具**: Vite 7
- **样式**: Tailwind CSS v4

## 快速开始

### 1. 安装 pnpm

```bash
npm install -g pnpm
```

### 2. 安装所有依赖

```bash
pnpm install
```

### 3. 启动所有项目（开发环境）

```bash
pnpm dev
```

这将同时启动：
- **Backend** (后端服务) - http://localhost:3000
- **Frontend** (用户端) - http://localhost:5173-5175
- **Admin** (后台管理) - http://localhost:5176

### 4. 单独启动某个项目

```bash
pnpm dev:frontend   # 只启动用户端
pnpm dev:backend    # 只启动后端
pnpm dev:admin      # 只启动后台管理
```

## 可用命令

### 开发环境

```bash
pnpm dev              # 启动所有项目
pnpm dev:frontend     # 启动用户端
pnpm dev:backend      # 启动后端
pnpm dev:admin        # 启动后台管理
```

### 构建

```bash
pnpm build            # 构建所有项目
pnpm build:frontend   # 构建用户端
pnpm build:backend    # 构建后端
pnpm build:admin      # 构建后台管理
```

### 生产环境

```bash
pnpm start            # 启动所有项目（生产模式）
pnpm start:frontend   # 启动用户端（生产模式）
pnpm start:backend    # 启动后端（生产模式）
pnpm start:admin      # 启动后台管理（生产模式）
```

### 其他

```bash
pnpm install:all      # 安装所有依赖（等同于 pnpm install）
pnpm clean           # 清理所有 node_modules
```

## 项目说明

### Frontend (用户端)

- 端口: 5173-5175
- 功能: 市场、交易、社区、持仓、我的
- 技术: React + TypeScript + Tailwind CSS

### Admin (后台管理)

- 端口: 5176
- 功能: 银行卡管理、入金审核、订单管理
- 技术: React + TypeScript + Tailwind CSS

### Backend (后端服务)

- 端口: 3000
- 功能: API 服务、数据库、WebSocket
- 技术: NestJS + TypeORM + MySQL

## 环境变量

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

### Admin (.env)
```
VITE_API_URL=http://localhost:3000
```

### Backend (.env.dev)
```
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=jp_system

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 注意事项

1. 确保已安装 pnpm: `npm install -g pnpm`
2. 确保 MySQL 和 Redis 服务已启动
3. 首次运行需要先执行 `pnpm install` 安装依赖
4. 开发环境使用 `pnpm dev` 一键启动所有服务

## Docker 一键部署

项目适合拆成 6 个容器：

- `mysql`: MySQL 8 数据库
- `redis`: Redis 缓存
- `seed`: 首次启动时自动导入基础数据并创建管理员
- `backend`: NestJS API 服务
- `frontend`: 用户端静态站点
- `admin`: 管理后台静态站点

其中 `frontend` 和 `admin` 都会通过 Nginx 把 `/api` 反向代理到 `backend`，所以浏览器侧不需要再写死后端域名。

### 1. 准备环境变量

```bash
cp .env.example .env
```

默认配置会启用模拟行情，适合先把系统完整跑起来。

如果要切换成真实行情：

1. 把 `.env` 中的 `MOCK_QUOTE_DATA` 改成 `false`
2. 填入 `QUOTE_WS_TOKEN`

### 2. 一键启动

```bash
docker compose up -d --build
```

首次启动会自动完成：

- MySQL / Redis 初始化
- 后端建表
- 产品数据导入
- 默认管理员账户创建

### 3. 访问地址

- 用户端: `http://localhost`
- 管理后台: `http://localhost:8080`
- 后端 API: `http://localhost:3000`
- Swagger 文档: `http://localhost:3000/docs`

默认管理员账户：

- 用户名: `admin`
- 密码: `Admin@123456`

### 4. 常用命令

```bash
# 查看全部日志
docker compose logs -f

# 查看初始化日志
docker compose logs -f seed

# 停止服务
docker compose down

# 连同数据库数据一起删除
docker compose down -v
```

### 5. 关键文件

- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `admin/Dockerfile`
- `.env.example`

## License

Private
