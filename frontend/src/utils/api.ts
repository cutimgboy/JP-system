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
 * 后端返回格式: { data: { data: [...], code: 0, msg: '...' } }
 * 或三层嵌套: { data: { data: { data: {...}, message: '...' }, code: 0, msg: '...' } }
 */
export function extractData(response: any) {
  if (!response || !response.data) {
    return null;
  }

  // response.data 是后端返回的第一层
  const level1 = response.data;

  // 如果第一层直接是数组,返回它
  if (Array.isArray(level1)) {
    return level1;
  }

  // 如果第一层不是对象,直接返回
  if (typeof level1 !== 'object' || level1 === null) {
    return level1;
  }

  // 如果第一层有 data 字段,继续往下找
  if ('data' in level1) {
    const level2 = level1.data;

    // 如果第二层是数组,返回它
    if (Array.isArray(level2)) {
      return level2;
    }

    // 如果第二层是对象,检查是否还有嵌套
    if (level2 && typeof level2 === 'object') {
      // 三层嵌套: { data: { message: '...', data: {...} } }
      if ('data' in level2) {
        return level2.data;
      }
      // 否则返回第二层
      return level2;
    }

    // 第二层是其他类型,直接返回
    return level2;
  }

  // 第一层没有 data 字段,返回第一层
  return level1;
}

export { apiClient };
export default apiClient;
