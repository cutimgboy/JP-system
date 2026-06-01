import http from 'k6/http';
import { check, group, sleep } from 'k6';
import {
  apiUrl,
  buildOptions,
  extractData,
  getAuthHeaders,
  isSuccessEnvelope,
} from './lib/config.js';

export const options = buildOptions('smoke');

const ACCOUNT_TYPE = __ENV.ACCOUNT_TYPE || 'demo';
const INVESTMENT_AMOUNT = Number(__ENV.INVESTMENT_AMOUNT || 100000);
const TRADE_DURATION_SECONDS = Number(__ENV.TRADE_DURATION_SECONDS || 15);
const LOAD_USER_COUNT = Number(__ENV.LOAD_USER_COUNT || __ENV.VUS || 10);
const LOAD_PHONE_BASE = Number(__ENV.LOAD_PHONE_BASE || 19970000000);
const SMS_CODE = __ENV.SMS_CODE || '123456';
const SNAPSHOT_LIMIT = Number(__ENV.KLINE_LIMIT || 80);

export function setup() {
  const productCodes = loadProductCodes();
  const users = loadUsers();

  if (users.length === 0) {
    throw new Error('No load-test users available. Set AUTH_TOKENS, or allow SMS login with LOAD_PHONE_BASE/SMS_CODE.');
  }

  return {
    productCodes,
    users,
  };
}

export default function (data) {
  const user = data.users[(__VU - 1) % data.users.length];
  const params = getAuthHeaders(user.token);
  const productCodes = data.productCodes.length > 0 ? data.productCodes : ['BTC', 'ETH', 'AAPL', 'NVDA', 'TSLA'];
  const stockCode = productCodes[((__VU - 1) * 17 + __ITER) % productCodes.length];
  const tradeType = (__VU + __ITER) % 2 === 0 ? 'bull' : 'bear';

  group('trading page operation flow', () => {
    const initialResponses = http.batch([
      ['GET', apiUrl('/api/products/quotes'), null, { tags: { name: 'GET /api/products/quotes' } }],
      ['GET', apiUrl(`/api/products/${encodeURIComponent(stockCode)}`), null, { tags: { name: 'GET /api/products/:code' } }],
      ['GET', apiUrl(`/api/quote/kline/${encodeURIComponent(stockCode)}?interval=1s&limit=${SNAPSHOT_LIMIT}`), null, { tags: { name: 'GET /api/quote/kline/:code' } }],
      ['GET', apiUrl(`/account/balance?accountType=${ACCOUNT_TYPE}`), null, { ...params, tags: { name: 'GET /account/balance' } }],
      ['GET', apiUrl(`/trade/orders/open?accountType=${ACCOUNT_TYPE}`), null, { ...params, tags: { name: 'GET /trade/orders/open' } }],
    ]);

    check(initialResponses[0], { 'quotes list ok': isSuccessEnvelope });
    check(initialResponses[1], { 'product detail ok': isSuccessEnvelope });
    check(initialResponses[2], { 'kline snapshot ok': isSuccessEnvelope });
    check(initialResponses[3], { 'balance before order ok': isSuccessEnvelope });
    check(initialResponses[4], { 'open orders before order ok': isSuccessEnvelope });

    const createOrder = http.post(
      apiUrl('/trade/order'),
      JSON.stringify({
        stockCode,
        stockName: stockCode,
        tradeType,
        investmentAmount: INVESTMENT_AMOUNT,
        durationSeconds: TRADE_DURATION_SECONDS,
        accountId: user.accountId,
      }),
      {
        ...params,
        tags: { name: 'POST /trade/order' },
      },
    );

    check(createOrder, {
      'create order ok': isSuccessEnvelope,
    });

    const created = extractData(createOrder);
    if (!created || !created.id) {
      sleep(randomThinkTime());
      return;
    }

    const orderDetail = http.get(apiUrl(`/trade/order/${created.id}`), {
      ...params,
      tags: { name: 'GET /trade/order/:id' },
    });
    check(orderDetail, { 'created order detail ok': isSuccessEnvelope });

    sleep(TRADE_DURATION_SECONDS + Number(__ENV.CLOSE_DELAY_SECONDS || 1));

    const closeOrder = http.post(apiUrl(`/trade/order/${created.id}/close`), null, {
      ...params,
      tags: { name: 'POST /trade/order/:id/close' },
    });
    check(closeOrder, { 'close order ok': isSuccessEnvelope });

    const finalResponses = http.batch([
      ['GET', apiUrl(`/trade/order/${created.id}`), null, { ...params, tags: { name: 'GET /trade/order/:id after close' } }],
      ['GET', apiUrl(`/account/balance?accountType=${ACCOUNT_TYPE}`), null, { ...params, tags: { name: 'GET /account/balance after close' } }],
      ['GET', apiUrl(`/trade/orders/open?accountType=${ACCOUNT_TYPE}`), null, { ...params, tags: { name: 'GET /trade/orders/open after close' } }],
    ]);

    check(finalResponses[0], { 'closed order detail ok': isSuccessEnvelope });
    check(finalResponses[1], { 'balance after close ok': isSuccessEnvelope });
    check(finalResponses[2], { 'open orders after close ok': isSuccessEnvelope });
  });

  sleep(randomThinkTime());
}

function loadProductCodes() {
  const response = http.get(apiUrl('/api/products/quotes'), {
    tags: { name: 'GET /api/products/quotes setup' },
  });
  check(response, { 'setup products ok': isSuccessEnvelope });

  const products = extractData(response);
  if (!Array.isArray(products)) {
    return [];
  }

  return products
    .map((product) => product && product.code)
    .filter(Boolean);
}

function loadUsers() {
  const explicitTokens = (__ENV.AUTH_TOKENS || '')
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);

  if (explicitTokens.length > 0) {
    return explicitTokens.map((token) => {
      const accountId = getDemoAccountId(token);
      return { token, accountId };
    }).filter((user) => user.accountId);
  }

  const users = [];
  for (let i = 0; i < LOAD_USER_COUNT; i += 1) {
    const phone = String(LOAD_PHONE_BASE + i);
    const token = loginWithSms(phone);
    const accountId = token ? getDemoAccountId(token) : null;
    if (token && accountId) {
      users.push({ token, accountId });
    }
  }

  return users;
}

function loginWithSms(phone) {
  const response = http.post(
    apiUrl('/auth/sms-login'),
    JSON.stringify({ phone, code: SMS_CODE }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'POST /auth/sms-login setup' },
    },
  );

  check(response, { 'setup sms login ok': isSuccessEnvelope });
  const data = extractData(response);
  return data && data.token ? data.token : '';
}

function getDemoAccountId(token) {
  const response = http.get(apiUrl('/account/list'), {
    ...getAuthHeaders(token),
    tags: { name: 'GET /account/list setup' },
  });

  check(response, { 'setup account list ok': isSuccessEnvelope });
  const accounts = extractData(response);
  if (!Array.isArray(accounts)) {
    return null;
  }

  const account = accounts.find((item) => item.accountType === ACCOUNT_TYPE);
  return account && account.id ? account.id : null;
}

function randomThinkTime() {
  const min = Number(__ENV.THINK_TIME_MIN || 1);
  const max = Number(__ENV.THINK_TIME_MAX || 3);
  return Math.random() * (max - min) + min;
}
