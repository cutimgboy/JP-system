# JP 后台管理

这是 JP 交易系统的后台管理前端，负责入金审核、订单管理、收款银行卡、奖励设置、社区和消息运营。

## 启动

```bash
npm install
npm run dev
```

默认开发地址：

```bash
http://localhost:5176
```

## 环境变量

```bash
VITE_API_URL=http://localhost:3000
```

## 页面模块

- 入金审核
- 订单管理
- 收款银行卡
- 奖励设置
- 社区管理
- 消息管理

## 说明

- 登录 token 存在 `localStorage` 的 `admin_token`
- 401 会自动跳回登录页并保留原路径
- 后台布局和表格使用统一的管理组件
