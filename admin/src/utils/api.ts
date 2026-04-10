import axios from 'axios';

interface ApiEnvelope<T = unknown> {
  code?: number;
  data?: T;
  msg?: string;
  message?: string;
}

// 统一的 API 基础 URL 配置
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function extractData<T>(input: unknown): T | null {
  let current = input;

  for (let depth = 0; depth < 3; depth += 1) {
    if (Array.isArray(current)) {
      return current as T;
    }

    if (!current || typeof current !== 'object') {
      return (current as T) ?? null;
    }

    const record = current as Record<string, unknown>;

    if ('data' in record) {
      current = record.data;
      continue;
    }

    return current as T;
  }

  return (current as T) ?? null;
}

export function extractMessage(
  input: unknown,
  fallback: string = '操作失败',
): string {
  if (!input || typeof input !== 'object') {
    return fallback;
  }

  const record = input as ApiEnvelope;

  if (typeof record.msg === 'string' && record.msg) {
    return record.msg;
  }

  if (typeof record.message === 'string' && record.message) {
    return record.message;
  }

  if ('data' in record) {
    return extractMessage(record.data, fallback);
  }

  return fallback;
}

export function isSuccessResponse(input: unknown): boolean {
  if (!input || typeof input !== 'object') {
    return true;
  }

  const record = input as ApiEnvelope;

  if (typeof record.code === 'number') {
    return record.code === 0;
  }

  if ('data' in record) {
    return isSuccessResponse(record.data);
  }

  return true;
}

export { apiClient };
