export const BASE_URL = (__ENV.BASE_URL || 'http://8.134.77.172').replace(/\/$/, '');
export const API_PREFIX = normalizePrefix(__ENV.API_PREFIX || '/api');
export const API_BASE_URL = `${BASE_URL}${API_PREFIX}`;

export const DEFAULT_PRODUCT_CODES = (__ENV.PRODUCT_CODES || 'BTC,ETH,AAPL,NVDA,TSLA')
  .split(',')
  .map((code) => code.trim())
  .filter(Boolean);

export const SCENARIOS = {
  smoke: [
    { duration: '30s', target: 1 },
  ],
  baseline: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 10 },
    { duration: '1m', target: 30 },
    { duration: '3m', target: 30 },
    { duration: '1m', target: 0 },
  ],
  ramp: [
    { duration: '2m', target: 20 },
    { duration: '5m', target: 20 },
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  stress: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 400 },
    { duration: '5m', target: 400 },
    { duration: '3m', target: 0 },
  ],
};

export function buildOptions(defaultScenarioName = 'baseline') {
  const scenarioName = __ENV.SCENARIO || defaultScenarioName;
  const stages = SCENARIOS[scenarioName];

  if (!stages) {
    throw new Error(`Unknown SCENARIO=${scenarioName}. Use one of: ${Object.keys(SCENARIOS).join(', ')}`);
  }

  return {
    stages,
    thresholds: {
      http_req_failed: [`rate<${__ENV.MAX_FAILED_RATE || '0.01'}`],
      http_req_duration: [`p(95)<${__ENV.MAX_P95_MS || '1000'}`],
      checks: [`rate>${__ENV.MIN_CHECK_RATE || '0.99'}`],
    },
    userAgent: 'JP-system-k6-load-test/1.0',
    noConnectionReuse: false,
  };
}

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function parseJson(response) {
  try {
    return response.json();
  } catch (_) {
    return null;
  }
}

export function isSuccessEnvelope(response) {
  if (response.status < 200 || response.status >= 300) {
    return false;
  }

  const body = parseJson(response);
  return !body || typeof body.code !== 'number' || body.code === 0;
}

export function extractData(response) {
  let current = parseJson(response);

  for (let depth = 0; depth < 3; depth += 1) {
    if (!current || typeof current !== 'object') {
      return current;
    }

    if (!Object.prototype.hasOwnProperty.call(current, 'data')) {
      return current;
    }

    current = current.data;
  }

  return current;
}

export function getAuthHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

function normalizePrefix(prefix) {
  if (!prefix || prefix === '/') {
    return '';
  }

  return prefix.startsWith('/') ? prefix.replace(/\/$/, '') : `/${prefix.replace(/\/$/, '')}`;
}
