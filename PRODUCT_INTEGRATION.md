# 产品数据集成实现文档

## 概述

将 Excel 文件中的 100 个产品数据集成到系统中，实现真实的产品列表和 Mock 行情数据。

## 已完成的工作

### 1. 数据库实体

**新增：ProductEntity** (`backend/src/cfd/entities/product.entity.ts`)
- 整合了交易设置和基础信息
- 包含所有 Excel 中的字段
- 支持按类型、代码、交易代码查询
- 添加了索引优化查询性能

主要字段：
- `orderNum`: 序号
- `type`: 品种类型（指数/股票/商品/Crypto/外汇）
- `code`: 代码（唯一）
- `tradeCode`: 交易代码（用于获取行情）
- `nameCn/nameEn/nameVn`: 多语言名称
- `currencyType`: 货币类型
- `bidSpread/askSpread`: 买卖价差
- `fixedLeverage`: 固定杠杆
- `tradingHours`: 交易时间
- `isActive`: 是否启用
- `sortOrder`: 排序顺序

### 2. Mock 行情服务

**新增：MockQuoteService** (`backend/src/quote/services/mock-quote.service.ts`)

功能：
- 自动初始化所有产品的基础价格
- 每秒更新一次价格（模拟波动 -0.5% 到 +0.5%）
- 根据产品类型设置不同的价格范围：
  - 指数：5000-15000
  - 股票：50-550
  - 商品：500-2500
  - Crypto：10000-60000
  - 外汇：0.5-2.5
- 计算买价和卖价（加上价差）
- 提供实时行情查询接口

### 3. 产品管理服务

**新增：ProductService** (`backend/src/cfd/services/product.service.ts`)

功能：
- 获取所有产品（支持按类型筛选）
- 根据代码/交易代码查询产品
- 获取产品类型列表
- 获取产品类型统计

### 4. API 接口

**新增：ProductController** (`backend/src/cfd/controllers/product.controller.ts`)

接口列表：

```
GET /api/products              # 获取所有产品（可选 type 参数）
GET /api/products/types        # 获取产品类型列表
GET /api/products/stats        # 获取产品类型统计
GET /api/products/quotes       # 获取产品行情（可选 type 或 codes 参数）
GET /api/products/:code/quote  # 获取单个产品行情
```

### 5. 数据导入脚本

**新增：import-products.ts** (`backend/scripts/import-products.ts`)

功能：
- 读取 Excel 文件（CFD品种信息表.xlsx）
- 解析"品种交易设置" sheet
- 导入 100 个产品到数据库
- 支持更新已存在的产品

使用方法：
```bash
cd backend
npm run import-products
```

### 6. 模块配置更新

- 更新 `CfdModule`：注册 ProductEntity 和 ProductService
- 更新 `QuoteModule`：注册 MockQuoteService
- 更新 `AppModule`：注册 ProductEntity 到 TypeORM

## 使用步骤

### 1. 启动后端服务

```bash
cd backend
npm run start:dev
```

服务启动后，TypeORM 会自动创建 `products` 表。

### 2. 导入产品数据

```bash
cd backend
npm run import-products
```

这将导入 100 个产品到数据库。

### 3. 测试 API

```bash
# 获取所有产品
curl http://localhost:3000/api/products

# 获取指数类产品
curl http://localhost:3000/api/products?type=指数

# 获取产品类型列表
curl http://localhost:3000/api/products/types

# 获取所有产品行情
curl http://localhost:3000/api/products/quotes

# 获取指数类产品行情
curl http://localhost:3000/api/products/quotes?type=指数

# 获取单个产品行情
curl http://localhost:3000/api/products/US500/quote
```

## 前端集成

### 修改市场页面

需要修改 `frontend/src/pages/market/index.tsx`：

```typescript
// 修改获取市场数据的接口
const fetchMarkets = async () => {
  try {
    setLoading(true);
    // 改为调用新的产品行情接口
    const response = await apiClient.get('/api/products/quotes', {
      params: { type: activeTab === '股票' ? '股票' : activeTab }
    });
    const quotesData = response.data.data || [];

    const marketData: Market[] = quotesData.map((quote: any) => ({
      code: quote.code,
      icon: quote.nameCn.charAt(0),
      symbol: quote.code,
      name: quote.nameEn,
      nameCn: quote.nameCn,
      price: quote.price.toFixed(2),
      change: quote.change,
      changePercent: `${quote.changePercent.toFixed(2)}%`,
      buy_price: quote.bidPrice,
      sale_price: quote.askPrice,
    }));

    setMarkets(marketData);
  } catch (error) {
    console.error('获取市场数据失败:', error);
  } finally {
    setLoading(false);
  }
};
```

### 更新分类标签

```typescript
// 从后端获取产品类型
const [categories, setCategories] = useState<string[]>([]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/products/types');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };
  fetchCategories();
}, []);
```

## API 响应示例

### 获取产品列表

```json
{
  "code": 0,
  "msg": "请求成功",
  "data": [
    {
      "id": 1,
      "orderNum": 1,
      "type": "指数",
      "code": "US500",
      "tradeCode": "US500",
      "nameCn": "标准普尔500指数",
      "nameEn": "S&P 500",
      "nameVn": "Chỉ số S&P 500",
      "currencyType": "USD",
      "bidSpread": 30,
      "askSpread": 30,
      "isActive": true,
      "sortOrder": 1
    }
  ]
}
```

### 获取产品行情

```json
{
  "code": 0,
  "msg": "请求成功",
  "data": [
    {
      "code": "US500",
      "tradeCode": "US500",
      "name": "S&P 500",
      "nameCn": "标准普尔500指数",
      "nameVn": "Chỉ số S&P 500",
      "type": "指数",
      "price": 5234.56,
      "bidPrice": 5204.56,
      "askPrice": 5264.56,
      "change": 12.34,
      "changePercent": 0.24,
      "high": 5239.25,
      "low": 5129.87,
      "open": 5222.22,
      "volume": 456789,
      "timestamp": 1709280000000
    }
  ]
}
```

## 数据特点

### 产品分布

- **指数**：3个（US500, NAS100, US30）
- **股票**：约50个（美股、港股等）
- **商品**：约20个（黄金、原油等）
- **Crypto**：约20个（BTC, ETH等）
- **外汇**：约7个（EUR/USD等）

### Mock 行情特点

1. **价格初始化**：根据产品类型设置合理的基础价格
2. **实时波动**：每秒更新，波动幅度 -0.5% 到 +0.5%
3. **买卖价差**：根据产品配置的 bidSpread 和 askSpread 计算
4. **统计数据**：包含开盘价、最高价、最低价、成交量等

## 注意事项

1. **数据库同步**：
   - 开发环境使用 `synchronize: true`，会自动创建表
   - 生产环境建议关闭，使用迁移脚本

2. **性能优化**：
   - Mock 服务使用内存缓存，重启后价格会重置
   - 可以考虑使用 Redis 缓存价格数据

3. **扩展性**：
   - 后续可以替换 MockQuoteService 为真实的行情服务
   - 接口保持不变，只需替换服务实现

4. **多语言支持**：
   - 产品名称支持中文、英文、越南语
   - 前端可以根据语言设置显示对应名称

## 下一步工作

1. ✅ 创建产品实体和服务
2. ✅ 实现 Mock 行情服务
3. ✅ 创建 API 接口
4. ✅ 创建数据导入脚本
5. ⏳ 启动服务并导入数据
6. ⏳ 修改前端市场页面
7. ⏳ 测试完整流程
8. ⏳ 接入真实行情数据（可选）

## 文件清单

### 新增文件

1. `backend/src/cfd/entities/product.entity.ts` - 产品实体
2. `backend/src/cfd/services/product.service.ts` - 产品服务
3. `backend/src/cfd/controllers/product.controller.ts` - 产品控制器
4. `backend/src/quote/services/mock-quote.service.ts` - Mock 行情服务
5. `backend/scripts/import-products.ts` - 数据导入脚本
6. `backend/scripts/read-excel.ts` - Excel 读取测试脚本

### 修改文件

1. `backend/src/cfd/cfd.module.ts` - 注册新的服务和控制器
2. `backend/src/quote/quote.module.ts` - 注册 Mock 服务
3. `backend/src/app.module.ts` - 注册产品实体
4. `backend/package.json` - 添加导入脚本命令

### 待修改文件

1. `frontend/src/pages/market/index.tsx` - 市场页面（需要修改）
