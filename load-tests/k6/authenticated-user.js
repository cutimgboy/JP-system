import http from 'k6/http';
import { check, group, sleep } from 'k6';
import {
  apiUrl,
  buildOptions,
  extractData,
  getAuthHeaders,
  isSuccessEnvelope,
} from './lib/config.js';

export const options = buildOptions('baseline');

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

  group('authenticated user read flow', () => {
    const responses = http.batch([
      ['GET', apiUrl('/user/info'), null, params],
      ['GET', apiUrl('/account/list'), null, params],
      ['GET', apiUrl('/account/balance?accountType=demo'), null, params],
      ['GET', apiUrl('/trade/dashboard?accountType=demo'), null, params],
      ['GET', apiUrl('/trade/orders/open?accountType=demo'), null, params],
      ['GET', apiUrl('/trade/orders?status=closed&limit=20&accountType=demo'), null, params],
    ]);

    check(responses[0], {
      'user info ok': isSuccessEnvelope,
    });
    check(responses[1], {
      'account list ok': isSuccessEnvelope,
    });
    check(responses[2], {
      'demo balance ok': isSuccessEnvelope,
    });
    check(responses[3], {
      'trade dashboard ok': isSuccessEnvelope,
    });
    check(responses[4], {
      'open orders ok': isSuccessEnvelope,
    });
    check(responses[5], {
      'closed orders ok': isSuccessEnvelope,
    });
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
