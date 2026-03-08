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
 * 处理后端不同的返回格式:
 * 1. { data: { data: [...], code: 0, msg: '...' } } - 标准格式
 * 2. { data: { data: { data: {...}, message: '...' }, code: 0, msg: '...' } } - 三层嵌套
 */
export function extractData(response: any) {
  if (!response || !response.data) {
    return null;
  }

  const firstLevel = response.data;

  // 如果第一层直接是数组,返回它
  if (Array.isArray(firstLevel)) {
    return firstLevel;
  }

  // 如果第一层有 data 字段
  if (firstLevel.data !== undefined) {
    const secondLevel = firstLevel.data;

    // 如果第二层是数组,直接返回
    if (Array.isArray(secondLevel)) {
      return secondLevel;
    }

    // 检查是否是三层嵌套 (第二层有 message 和 data 字段)
    if (secondLevel && typeof secondLevel === 'object' && 'data' in secondLevel && 'message' in secondLevel) {
      return secondLevel.data;
    }

    // 否则返回第二层
    return secondLevel;
  }

  // 如果没有嵌套,直接返回第一层
  return firstLevel;
}

export { apiClient };
export default apiClient;
