import http from 'k6/http';
import { check, group, sleep } from 'k6';
import {
  DEFAULT_PRODUCT_CODES,
  apiUrl,
  buildOptions,
  isSuccessEnvelope,
  pick,
} from './lib/config.js';

export const options = buildOptions('baseline');

export default function () {
  group('public read flow', () => {
    const productCode = pick(DEFAULT_PRODUCT_CODES);

    const responses = http.batch([
      ['GET', apiUrl('/api/products/types')],
      ['GET', apiUrl('/api/products/stats')],
      ['GET', apiUrl('/api/products/quotes?type=Crypto')],
      ['GET', apiUrl(`/api/products/${encodeURIComponent(productCode)}`)],
      ['GET', apiUrl('/api/community/settings')],
      ['GET', apiUrl('/api/community/leaderboard')],
      ['GET', apiUrl('/api/messages')],
    ]);

    check(responses[0], {
      'product types ok': isSuccessEnvelope,
    });
    check(responses[1], {
      'product stats ok': isSuccessEnvelope,
    });
    check(responses[2], {
      'crypto quotes ok': isSuccessEnvelope,
    });
    check(responses[3], {
      'product detail request completed': (res) => res.status >= 200 && res.status < 500,
    });
    check(responses[4], {
      'community settings ok': isSuccessEnvelope,
    });
    check(responses[5], {
      'leaderboard ok': isSuccessEnvelope,
    });
    check(responses[6], {
      'messages ok': isSuccessEnvelope,
    });
  });

  sleep(randomThinkTime());
}

function randomThinkTime() {
  const min = Number(__ENV.THINK_TIME_MIN || 1);
  const max = Number(__ENV.THINK_TIME_MAX || 3);
  return Math.random() * (max - min) + min;
}
