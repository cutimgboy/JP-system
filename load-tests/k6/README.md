# JP-system k6 压测说明

这组脚本用于压测已经部署到服务器的 JP-system 服务。默认目标是 `http://8.134.77.172`，并通过前端 Nginx 暴露的 `/api` 代理访问后端。

## 脚本

- `public-read.js`：公开读接口压测，可直接运行。覆盖产品类型、统计、行情、社区、消息等接口。
- `authenticated-user.js`：登录后用户读接口压测。需要 `AUTH_TOKEN`，或 `TEST_PHONE` + `TEST_PASSWORD`。
- `trading-demo.js`：模拟账户下单写接口压测。会真实创建 demo 订单，建议只在测试账号和测试环境使用。
- `trading-operation.js`：交易页操作链路压测。每个 VU 使用独立测试账号，覆盖打开交易页、读取账户/持仓/K线、下单、等待到期、平仓、复查余额。

## 安装 k6

macOS：

```bash
brew install k6
```

Linux 可以参考 Grafana k6 官方安装文档：

```text
https://grafana.com/docs/k6/latest/set-up/install-k6/
```

## 快速开始

先跑 1 个虚拟用户的烟雾测试：

```bash
cd /Users/admin/code/JP-system
SCENARIO=smoke k6 run load-tests/k6/public-read.js
```

确认接口正常后跑基准压测：

```bash
SCENARIO=baseline k6 run load-tests/k6/public-read.js
```

逐步升压：

```bash
SCENARIO=ramp k6 run load-tests/k6/public-read.js
SCENARIO=stress k6 run load-tests/k6/public-read.js
```

保存结果摘要：

```bash
SCENARIO=ramp k6 run \
  --summary-export load-tests/results/public-read-ramp.json \
  load-tests/k6/public-read.js
```

## 登录后接口压测

用 token：

```bash
AUTH_TOKEN='你的测试用户JWT' SCENARIO=baseline \
  k6 run load-tests/k6/authenticated-user.js
```

或让脚本自动登录：

```bash
TEST_PHONE='测试手机号' TEST_PASSWORD='测试密码' SCENARIO=baseline \
  k6 run load-tests/k6/authenticated-user.js
```

## 模拟交易写接口压测

这个脚本会真实创建 demo 订单，请先确认测试账号余额足够，并且不要对真实生产用户执行。

```bash
AUTH_TOKEN='你的测试用户JWT' SCENARIO=smoke \
  k6 run load-tests/k6/trading-demo.js
```

更接近交易页真实操作的多账号场景：

```bash
LOAD_USER_COUNT=40 LOAD_PHONE_BASE=19970000000 \
  k6 run --vus 40 --duration 3m load-tests/k6/trading-operation.js
```

## 推荐压测顺序

1. `public-read.js` + `SCENARIO=smoke`
2. `public-read.js` + `SCENARIO=baseline`
3. 服务器稳定后跑 `public-read.js` + `SCENARIO=ramp`
4. 准备测试账号后跑 `authenticated-user.js`
5. 只有在明确接受写入测试数据时，再跑 `trading-demo.js` 或 `trading-operation.js`

## 服务器观测命令

压测时在服务器上开另一个 SSH 窗口：

```bash
ssh root@8.134.77.172
docker stats
```

如果不是 Docker 部署，用：

```bash
top
free -h
vmstat 1
ss -s
```

看日志：

```bash
docker compose logs -f backend frontend
```

重点观察：

- `http_req_failed` 是否小于 1%
- `http_req_duration p(95)` 是否小于 1000ms 或你的业务目标值
- CPU 是否长期接近 100%
- 内存是否持续上涨或触发 OOM
- MySQL/Redis/backend 是否出现连接数耗尽、502、504、超时

当错误率开始升高、P95 延迟明显恶化，或 CPU/数据库连接持续打满时，上一档稳定并发量就是比较可靠的承载边界。
