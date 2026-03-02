# 交易系统实现文档

## 已完成功能

### 后端实现

#### 1. 数据库实体

**用户账户实体** (`backend/src/user/entities/user-account.entity.ts`)
- 账户余额 (balance)
- 冻结金额 (frozenBalance) - 交易中的资金
- 累计充值/提现/盈利/亏损统计
- 初始余额：1,000,000 VND（自动创建）

**交易订单实体** (`backend/src/user/entities/trade-order.entity.ts`)
- 订单类型：看涨(bull) / 看跌(bear)
- 订单状态：待开仓/已开仓/已平仓/已取消
- 订单结果：待结算/盈利/亏损/平局
- 开仓价格、平仓价格、盈亏金额
- 交易时长（30-300秒）
- 盈利率：默认85%

#### 2. 核心服务

**账户服务** (`backend/src/user/services/account.service.ts`)
- `getOrCreateAccount()` - 获取或创建账户（自动初始化1,000,000 VND）
- `getBalance()` - 获取账户余额信息
- `freezeBalance()` - 冻结资金（开仓时）
- `unfreezeBalance()` - 解冻资金（取消订单时）
- `settleProfitOrder()` - 结算盈利订单
- `settleLossOrder()` - 结算亏损订单
- `deposit()` / `withdraw()` - 充值/提现

**交易订单服务** (`backend/src/user/services/trade-order.service.ts`)
- `createOrder()` - 创建交易订单（开仓）
  - 验证投资金额和交易时长
  - 获取当前价格作为开仓价
  - 冻结投资金额
  - 创建订单记录
- `closeOrder()` - 平仓订单
  - 获取平仓价格
  - 判断盈亏（看涨：平仓价>开仓价为盈利；看跌：平仓价<开仓价为盈利）
  - 结算资金（盈利：返还本金+利润；亏损：扣除本金）
- `autoCloseExpiredOrders()` - 定时任务，每秒自动平仓到期订单
- `getUserOrders()` - 获取用户订单列表
- `getUserOpenOrders()` - 获取用户当前持仓
- `getUserStats()` - 获取用户交易统计

#### 3. API接口

**账户管理** (`/account`)
- `GET /account/balance` - 获取账户余额
- `POST /account/deposit` - 充值（测试用）
- `POST /account/withdraw` - 提现（测试用）

**交易订单** (`/trade`)
- `POST /trade/order` - 创建交易订单（开仓）
  ```json
  {
    "stockCode": "AAPL.US",
    "stockName": "苹果",
    "tradeType": "bull",  // bull=看涨, bear=看跌
    "investmentAmount": 100000,
    "durationSeconds": 60,  // 30-300秒
    "profitRate": 85  // 可选，默认85%
  }
  ```
- `POST /trade/order/:id/close` - 手动平仓订单
- `GET /trade/orders` - 获取订单列表（支持status和limit参数）
- `GET /trade/orders/open` - 获取当前持仓
- `GET /trade/order/:id` - 获取订单详情
- `GET /trade/stats` - 获取交易统计

#### 4. 盈亏计算逻辑

**看涨(Bull)**
- 盈利条件：平仓价 > 开仓价
- 盈利金额：投资金额 × 盈利率（默认85%）
- 亏损金额：投资金额（全部）

**看跌(Bear)**
- 盈利条件：平仓价 < 开仓价
- 盈利金额：投资金额 × 盈利率（默认85%）
- 亏损金额：投资金额（全部）

**示例**
- 投资100,000 VND，盈利率85%
- 盈利：返还100,000 + 85,000 = 185,000 VND
- 亏损：扣除100,000 VND

#### 5. 自动平仓机制

- 使用 `@nestjs/schedule` 定时任务
- 每秒检查一次到期订单
- 自动获取当前价格并平仓
- 自动结算盈亏到账户

## 前端集成指南

### 1. API调用示例

```typescript
// 获取账户余额
const getBalance = async () => {
  const response = await apiClient.get('/account/balance');
  return response.data;
  // 返回: { balance, frozenBalance, availableBalance, totalProfit, totalLoss, netProfit }
};

// 创建交易订单
const createOrder = async (orderData) => {
  const response = await apiClient.post('/trade/order', {
    stockCode: 'AAPL.US',
    stockName: '苹果',
    tradeType: 'bull', // 或 'bear'
    investmentAmount: 100000,
    durationSeconds: 60,
  });
  return response.data;
};

// 获取当前持仓
const getOpenOrders = async () => {
  const response = await apiClient.get('/trade/orders/open');
  return response.data;
};

// 获取交易统计
const getStats = async () => {
  const response = await apiClient.get('/trade/stats');
  return response.data;
  // 返回: { totalOrders, openOrders, closedOrders, winOrders, lossOrders, winRate, totalProfit, totalLoss, netProfit }
};
```

### 2. 前端需要修改的文件

**TradingDetail.tsx** - 主交易页面
- 添加账户余额显示
- 集成真实的开仓API调用
- 显示当前持仓订单
- 显示交易统计

**TradingControls.tsx** - 交易控制组件
- 修改看涨/看跌按钮，调用真实API
- 验证账户余额是否足够
- 显示实时账户余额

**建议新增组件**
- `AccountBalance.tsx` - 账户余额显示组件
- `OpenOrders.tsx` - 当前持仓列表组件
- `OrderHistory.tsx` - 历史订单列表组件
- `TradingStats.tsx` - 交易统计组件

### 3. 状态管理建议

```typescript
// 使用 React Context 或状态管理库
interface TradingState {
  balance: number;
  frozenBalance: number;
  availableBalance: number;
  openOrders: TradeOrder[];
  stats: TradingStats;
}

// 定期刷新数据
useEffect(() => {
  const interval = setInterval(() => {
    refreshBalance();
    refreshOpenOrders();
  }, 2000); // 每2秒刷新一次

  return () => clearInterval(interval);
}, []);
```

### 4. 用户体验优化

1. **实时更新**
   - 账户余额实时刷新
   - 持仓订单倒计时显示
   - 订单状态实时更新

2. **错误处理**
   - 余额不足提示
   - 网络错误重试
   - 订单创建失败提示

3. **视觉反馈**
   - 盈利显示绿色
   - 亏损显示红色
   - 加载状态显示

## 测试步骤

### 1. 测试账户余额

```bash
# 登录获取token
curl -X POST http://localhost:3000/auth/send-sms -H "Content-Type: application/json" -d '{"phone":"13800000000"}'
curl -X POST http://localhost:3000/auth/sms-login -H "Content-Type: application/json" -d '{"phone":"13800000000","code":"验证码"}'

# 获取余额
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/account/balance
```

### 2. 测试创建订单

```bash
curl -X POST http://localhost:3000/trade/order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stockCode": "AAPL.US",
    "stockName": "苹果",
    "tradeType": "bull",
    "investmentAmount": 100000,
    "durationSeconds": 60
  }'
```

### 3. 测试查询订单

```bash
# 获取当前持仓
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/trade/orders/open

# 获取交易统计
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/trade/stats
```

## 数据库表结构

系统会自动创建以下表：

1. **user_accounts** - 用户账户表
2. **trade_orders** - 交易订单表

TypeORM 的 `synchronize: true` 会自动创建表结构。

## 注意事项

1. **生产环境配置**
   - 关闭 `synchronize: true`
   - 使用数据库迁移
   - 配置真实的短信服务
   - 添加支付接口

2. **安全性**
   - 所有交易API都需要JWT认证
   - 验证用户权限
   - 防止恶意刷单

3. **性能优化**
   - 使用Redis缓存账户余额
   - 批量处理到期订单
   - 数据库索引优化

4. **监控告警**
   - 监控自动平仓任务
   - 监控账户余额异常
   - 记录所有交易日志

## 下一步工作

1. ✅ 后端交易系统完成
2. ⏳ 前端交易界面集成
3. ⏳ 充值/提现功能
4. ⏳ 交易记录查询
5. ⏳ 数据统计图表
6. ⏳ 风控系统

## API响应示例

### 账户余额
```json
{
  "data": {
    "balance": 1000000,
    "frozenBalance": 0,
    "availableBalance": 1000000,
    "totalProfit": 0,
    "totalLoss": 0,
    "netProfit": 0
  },
  "code": 0,
  "msg": "请求成功"
}
```

### 创建订单成功
```json
{
  "data": {
    "id": 1,
    "userId": 2,
    "stockCode": "AAPL.US",
    "stockName": "苹果",
    "tradeType": "bull",
    "status": "open",
    "result": "pending",
    "investmentAmount": 100000,
    "profitRate": 85,
    "openPrice": 258.09,
    "closePrice": null,
    "profitLoss": 0,
    "durationSeconds": 60,
    "openTime": "2026-02-01T14:00:00.000Z",
    "closeTime": null,
    "expectedCloseTime": "2026-02-01T14:01:00.000Z",
    "createdAt": "2026-02-01T14:00:00.000Z",
    "updatedAt": "2026-02-01T14:00:00.000Z"
  },
  "code": 0,
  "msg": "订单创建成功"
}
```

### 交易统计
```json
{
  "data": {
    "totalOrders": 10,
    "openOrders": 1,
    "closedOrders": 9,
    "winOrders": 6,
    "lossOrders": 3,
    "winRate": 66.67,
    "totalProfit": 510000,
    "totalLoss": 300000,
    "netProfit": 210000
  },
  "code": 0,
  "msg": "请求成功"
}
```
