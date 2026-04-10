import axios from 'axios';

// 统一的 API 基础 URL 配置
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // 不要在这里返回 response.data,保持原始响应结构
    // 让调用方自己处理 response.data
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除认证信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 只在非登录页时跳转
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * 从响应中提取实际数据
 * 当前后端标准返回格式: { data: ..., code: 0, msg: '请求成功' }
 * 这里保留对旧版嵌套结构的兼容，方便渐进收敛。
 */
export function extractData<T = any>(response: any): T | null {
  if (!response?.data) {
    return null;
  }

  let current = response.data;

  for (let depth = 0; depth < 3; depth += 1) {
    if (Array.isArray(current)) {
      return current as T;
    }

    if (!current || typeof current !== 'object') {
      return current;
    }

    if (!('data' in current)) {
      return current;
    }

    current = current.data;
  }

  return current as T;
}

export function extractMessage(input: any, fallback = '操作失败') {
  if (!input || typeof input !== 'object') {
    return fallback;
  }

  if (typeof input.msg === 'string' && input.msg) {
    return input.msg;
  }

  if (typeof input.message === 'string' && input.message) {
    return input.message;
  }

  if ('data' in input) {
    return extractMessage(input.data, fallback);
  }

  return fallback;
}

export function isSuccessResponse(input: any): boolean {
  if (!input || typeof input !== 'object') {
    return true;
  }

  if (typeof input.code === 'number') {
    return input.code === 0;
  }

  if ('data' in input) {
    return isSuccessResponse(input.data);
  }

  return true;
}

export { apiClient };
export default apiClient;
