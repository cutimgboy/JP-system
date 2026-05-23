# UI 重构实施计划

更新时间：2026-05-23

## 背景

当前用户端前端位于 `frontend/`，新版完整 UI 位于仓库根目录 `JPM 新版本UI/`。本次重构以新版 UI 的视觉、布局、动效和交互为基准，同时保留当前项目已经接入的登录鉴权、账户上下文、交易、行情、银行卡、入金和资金记录等后端能力。

用户明确要求：修改代码前先完整分析 `JPM 新版本UI` 的 UI 及实现效果，并将实施清单和计划保存到前后端 `doc` 目录。

## 目录与关键文件

新版 UI：

- `JPM 新版本UI/src/imports/RedesignTradingAppStyles.tsx`：新版首页壳、底部导航、市场首页、交易引导入口。
- `JPM 新版本UI/src/app/routes.tsx`：新版独立路由清单。
- `JPM 新版本UI/src/app/components/TradePage.tsx`：新版交易页、图表行情、交易引导。
- `JPM 新版本UI/src/app/components/OrderDetailsPage.tsx`：新版订单详情和分享。
- `JPM 新版本UI/src/app/components/ProfilePage.tsx`：新版我的页面。
- `JPM 新版本UI/src/app/components/PersonalInfoPage.tsx`：个人资料。
- `JPM 新版本UI/src/app/components/WithdrawSelectBankPage.tsx`、`WithdrawAmountPage.tsx`、`WithdrawIdentityPage.tsx`：提取资金流程。
- `JPM 新版本UI/src/app/components/FundsRecordPage.tsx`：资金记录。
- `JPM 新版本UI/src/app/components/MyBanksPage.tsx`、`AddBankCardPage.tsx`：我的银行。
- `JPM 新版本UI/src/app/components/InstallAppPage.tsx`：安装 APP。
- `JPM 新版本UI/src/app/components/LanguagePage.tsx`：切换语言。

当前前端：

- `frontend/src/App.tsx`：当前路由。
- `frontend/src/components/BottomNav.tsx`、`PageHeader.tsx`、`AccountSelector.tsx`：公共导航和账户入口。
- `frontend/src/pages/market/index.tsx`：市场页，已经接入产品行情接口。
- `frontend/src/pages/trading/TradingDetail.tsx`：当前交易页，已经接入交易下单、余额、订单恢复和实时图表。
- `frontend/src/pages/positions/index.tsx`、`positions/OrderDetail.tsx`：持仓和订单详情。
- `frontend/src/pages/profile/index.tsx`：我的页。
- `frontend/src/pages/deposit/*`、`withdraw/index.tsx`、`fund-records/index.tsx`、`my-bank/*`：资金和银行卡相关页面。
- `frontend/src/i18n/config.ts`：已有 i18n 初始化。
- `frontend/src/utils/api.ts`：已有 axios 封装。

## 页面迁移对照

| 功能 | 新版 UI 文件 | 当前页面/路由 | 迁移策略 |
| --- | --- | --- | --- |
| 市场首页 | `RedesignTradingAppStyles.tsx` 内市场模块 | `/market`，`frontend/src/pages/market/index.tsx` | 保留当前行情 API，对齐新版顶部账户、Banner、分类、列表视觉。 |
| 交易页行情 | `TradePage.tsx` | `/trading`，`TradingDetail.tsx` 和 `pages/trading/components/*` | 保留当前下单、余额、订单恢复逻辑，迁移新版交易页壳、产品切换、行情头部、图表标记、看涨/看跌比例和浮动交易面板。 |
| 新增交易引导 | `TradePage.tsx`、`RedesignTradingAppStyles.tsx` | 当前缺少完整引导 | 新增欢迎弹窗、时间选择引导、金额引导、方向引导、下单成功弹窗。使用 `sessionStorage` 控制只展示一次，并提供从市场/我的入口触发。 |
| 持仓/订单列表 | `PositionsPage.tsx` | `/positions` | 当前已有 dashboard API 和新版风格，可微调交互和空态。 |
| 订单详情+分享 | `OrderDetailsPage.tsx` | `/positions/order/:orderId` | 保留订单详情 API，迁移新版内容结构，新增分享弹窗、复制/原生分享/海报式展示。 |
| 我的首页 | `ProfilePage.tsx` | `/profile` | 当前已接近新版，继续补齐新版入口路径和视觉细节。 |
| 个人资料 | `PersonalInfoPage.tsx` | `/personal-info` | 迁移新版 UI，尽量接 `AuthContext.user` 和 `/user/info`，复制 ID/邀请码等先本地处理。 |
| 提取资金 | `WithdrawSelectBankPage.tsx`、`WithdrawAmountPage.tsx`、`WithdrawIdentityPage.tsx` | 当前只有 `/withdraw` | 新增 `/withdraw/select-bank`、`/withdraw/amount`、`/withdraw/identity`，保留 `/withdraw` 重定向或兼容入口。银行卡列表接现有 API，金额和身份提交按后端能力处理。 |
| 资金记录 | `FundsRecordPage.tsx` | `/fund-records` | 当前已有入金和交易记录聚合，迁移新版 UI 并保留 API 聚合逻辑。 |
| 我的银行 | `MyBanksPage.tsx`、`AddBankCardPage.tsx` | `/my-bank`、`/my-bank/add` | 当前已有 API，迁移新版卡片、空态和新增表单视觉。 |
| 安装 APP | `InstallAppPage.tsx` | `/install-app` | 迁移新版安装引导，纯前端能力。 |
| 切换语言 | `LanguagePage.tsx` | `/change-language` | 迁移新版语言列表，接 `i18next.changeLanguage` 和 localStorage。 |

补充对照：

| 新版路由 | 当前建议路由 | 说明 |
| --- | --- | --- |
| `/order-detail/:id` | `/positions/order/:orderId` | 不新增重复订单详情页；可增加兼容跳转。 |
| `/funds-record` | `/fund-records` | 当前路由保留，可增加兼容跳转。 |
| `/my-banks` | `/my-bank` | 当前路由保留，可增加兼容跳转。 |
| `/deposit/add-card` | `/my-bank/add` | 新版路径实际是新增银行卡，统一到当前银行卡模块。 |
| `/about` | `/about-us` | 当前路由保留，可增加兼容跳转。 |
| `/activity` | `/promotion` | 新版活动页映射当前推广/活动页。 |
| `/transfer-detail/:id` | `/deposit/detail?id=:id` | 可作为入金/提现详情统一页；当前先保留入金详情。 |
| `/profile/info` | `/personal-info` | 可增加兼容跳转。 |
| `/profile/language` | `/change-language` | 可增加兼容跳转。 |
| `/profile/install` | `/install-app` | 可增加兼容跳转。 |
| `/profile/password` | `/change-password` | 可增加兼容跳转。 |

## 新增/调整路由

需要在 `frontend/src/App.tsx` 中确认或新增：

- `/withdraw/select-bank`
- `/withdraw/amount`
- `/withdraw/identity`
- `/profile/info` 可兼容跳转到 `/personal-info`
- `/profile/language` 可兼容跳转到 `/change-language`
- `/profile/install` 可兼容跳转到 `/install-app`
- `/profile/password` 可兼容跳转到 `/change-password`
- `/order-detail/:id` 可兼容跳转到 `/positions/order/:orderId`
- `/funds-record` 可兼容跳转到 `/fund-records`
- `/my-banks` 可兼容跳转到 `/my-bank`

## 依赖和资源

当前项目已有：

- `framer-motion`
- `lucide-react`
- `react-router-dom`
- `axios`
- `i18next` / `react-i18next`

新版 UI 使用但当前前端未必具备：

- `recharts`：新版 `TradePage.tsx` 的 AreaChart 依赖。可选择新增依赖，或沿用当前 `KLineChart` canvas 实现并迁移视觉层。
- `sonner`：新版 toast 依赖。当前已有 `Toast`，可优先复用，避免引入。
- `figma:asset/*`：需要改为普通相对导入或复制到 `frontend/src/assets` / `frontend/public`。
- `motion/react`：当前项目使用 `framer-motion`，迁移时改为 `framer-motion` import。

资源迁移：

- `JPM 新版本UI/src/assets/aa504d021d0ab401e5223db475649354af7666ff.png`：我的页 Banner。
- `JPM 新版本UI/src/assets/a051d475d6f74bd8a2670c733ce115a21182f8b7.png`：市场活动图。
- `frontend/public/rujin.png`、`frontend/public/logo/*` 当前已经存在，可继续复用。

## 实施清单

- [x] 完成新版 UI 组件到当前页面的最终差异分析。
- [x] 保存前后端实施计划文档。
- [x] 补齐路由兼容层，避免新版路径跳转到 404。
- [x] 迁移交易引导状态机和弹层。
- [ ] 重构交易页视觉，保留当前后端下单、余额、订单恢复和行情能力。
- [x] 重构订单详情页，新增分享功能。
- [x] 重构个人资料页，接当前用户信息。
- [x] 新增提取资金三步页面并接银行卡/余额能力。
- [x] 重构资金记录页，保留现有入金和交易记录聚合。
- [x] 重构我的银行和新增银行卡页面。
- [x] 重构安装 APP 和切换语言页面。
- [x] 统一暗色主题、底部导航、页面头部、加载态、空态和 Toast。
- [x] 运行 `pnpm --filter jp-system-frontend build`。
- [ ] 启动前端开发服务，用浏览器检查关键页面。

## 验收路径

- `/market`
- `/trading`
- `/positions`
- `/positions/order/:orderId`
- `/profile`
- `/personal-info`
- `/withdraw/select-bank`
- `/withdraw/amount`
- `/withdraw/identity`
- `/fund-records`
- `/my-bank`
- `/my-bank/add`
- `/install-app`
- `/change-language`

## 风险与处理

- 新版 UI 大量数据是 mock：迁移时不能覆盖当前已经接通的真实 API。
- 新版路由使用 `react-router`，当前项目使用 `react-router-dom`：导入和导航 API 需要统一。
- `figma:asset` 不能直接在当前项目解析：需要复制资源或改为 public 路径。
- 交易页是高风险页面：视觉迁移必须保留余额校验、下单接口、订单恢复、倒计时和平仓结果获取。
- 提现后端能力可能不完整：前端先做完整流程和本地成功态，真实提交能力按后端接口补齐。
- 新版交易页行情是 `Math.random()` mock；当前交易页已有 SSE/自研 K 线，迁移时保留真实行情数据通道。
- 新版语言页列出更多语言，但当前资源只有 `zh-CN`、`en-US`、`vi`；新增语言前必须补资源文件。
- 新版分享海报只展示 toast，没有真实生成图片；当前先实现复制/原生分享/分享弹窗，保存图片后续可接 `html2canvas`。
