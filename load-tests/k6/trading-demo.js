import http from 'k6/http';
import { check, group, sleep } from 'k6';
import {
  DEFAULT_PRODUCT_CODES,
  apiUrl,
  buildOptions,
  extractData,
  getAuthHeaders,
  isSuccessEnvelope,
  pick,
} from './lib/config.js';

export const options = buildOptions('smoke');

export function setup() {
  const token = __ENV.AUTH_TOKEN || loginWithPassword();

  if (!token) {
    throw new Error(
      'Missing auth token. Set AUTH_TOKEN, or set TEST_PHONE and TEST_PASSWORD for /auth/phone-password-login.',
    );
  }

  return { token };
}

export default function (data) {
  const params = getAuthHeaders(data.token);
  const stockCode = pick(DEFAULT_PRODUCT_CODES);
  const tradeType = Math.random() > 0.5 ? 'bull' : 'bear';

  group('demo trading write flow', () => {
    const dashboard = http.get(apiUrl('/trade/dashboard?accountType=demo'), params);
    check(dashboard, {
      'dashboard before order ok': isSuccessEnvelope,
    });

    const createOrder = http.post(
      apiUrl('/trade/order'),
      JSON.stringify({
        stockCode,
        stockName: stockCode,
        tradeType,
        investmentAmount: Number(__ENV.INVESTMENT_AMOUNT || 100000),
        durationSeconds: Number(__ENV.TRADE_DURATION_SECONDS || 15),
        accountType: 'demo',
      }),
      params,
    );

    check(createOrder, {
      'create demo order request completed': (res) => res.status >= 200 && res.status < 500,
    });

    const created = extractData(createOrder);

    if (created && created.id) {
      const detail = http.get(apiUrl(`/trade/order/${created.id}`), params);
      check(detail, {
        'created order detail ok': isSuccessEnvelope,
      });
    }
  });

  sleep(randomThinkTime());
}

function loginWithPassword() {
  if (!__ENV.TEST_PHONE || !__ENV.TEST_PASSWORD) {
    return '';
  }

  const response = http.post(
    apiUrl('/auth/phone-password-login'),
    JSON.stringify({
      phone: __ENV.TEST_PHONE,
      password: __ENV.TEST_PASSWORD,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: {
        name: 'POST /auth/phone-password-login setup',
      },
    },
  );

  check(response, {
    'password login ok': isSuccessEnvelope,
  });

  const data = extractData(response);
  return data && data.token ? data.token : '';
}

function randomThinkTime() {
  const min = Number(__ENV.THINK_TIME_MIN || 1);
  const max = Number(__ENV.THINK_TIME_MAX || 3);
  return Math.random() * (max - min) + min;
}
