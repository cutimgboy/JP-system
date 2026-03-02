# JP System - 后台管理系统

## 项目说明

这是 JP 交易系统的后台管理系统前端项目，用于管理员管理系统数据。

## 技术栈

- React 19
- TypeScript
- React Router v7
- Tailwind CSS v4
- Vite 7
- Axios

## 功能模块

- 🏦 **银行卡管理** - 管理系统中的银行卡信息
- 💰 **入金审核** - 审核用户的充值申请
- 📊 **订单管理** - 查看和管理所有交易订单

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问地址: http://localhost:5176

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
admin/
├── src/
│   ├── components/        # 公共组件
│   │   └── AdminLayout.tsx
│   ├── pages/            # 页面组件
│   │   ├── Login.tsx
│   │   ├── BankCards.tsx
│   │   ├── DepositReview.tsx
│   │   └── OrderManagement.tsx
│   ├── utils/            # 工具函数
│   │   └── api.ts
│   ├── App.tsx           # 根组件
│   ├── main.tsx          # 入口文件
│   └── app.css           # 全局样式
├── index.html
├── package.json
├── tsconfig.─ vite.config.ts
└── README.md
```

## 后端 API

后台管理系统使用 `./backend` 提供的 API 服务。

默认 API 地址: http://localhost:3000

## 环境变量

创建 `.env` 文件配置环境变量:

```
VITE_API_URL=http://localhost:3000
```

## 默认登录

- 用户名: admin
- 密码: admin123

## 注意事项

- 端口 5176 用于后台管理系统，避免与用户端前端 (5173-5175) 冲突
- 所有路由都需要登录认证
- 使用 localStorage 存储管理员 token
