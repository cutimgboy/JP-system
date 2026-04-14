import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, extractData } from '../utils/api';

interface User {
  id: number;
  phone: string | null;
  email?: string | null;
  nickname?: string;
  avatar?: string;
  status?: number;
  hasPassword?: boolean;
  requiresPasswordSetup?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：从 localStorage 读取 token 和用户信息
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = normalizeUser(JSON.parse(storedUser));
          setToken(storedToken);
          setUser(parsedUser);

          // 验证 token 是否有效，并刷新用户信息
          await refreshUserInfo(storedToken);
        } catch (error) {
          console.error('初始化认证失败:', error);
          // Token 无效，清除本地存储
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const normalizeUser = (value: User): User => ({
    ...value,
    hasPassword: typeof value.hasPassword === 'boolean' ? value.hasPassword : undefined,
    requiresPasswordSetup:
      typeof value.requiresPasswordSetup === 'boolean'
        ? value.requiresPasswordSetup
        : false,
  });

  // 刷新用户信息
  const refreshUserInfo = async (authToken?: string) => {
    try {
      const currentToken = authToken || token;
      if (!currentToken) return;

      const response = await apiClient.get('/user/info', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const userData = extractData(response);
      if (userData) {
        const normalizedUser = normalizeUser(userData);
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      throw error;
    }
  };

  // 登录
  const login = (newToken: string, newUser: User) => {
    const normalizedUser = normalizeUser(newUser);
    setToken(newToken);
    setUser(normalizedUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  // 登出
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 刷新用户信息（供外部调用）
  const refreshUser = async () => {
    await refreshUserInfo();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
