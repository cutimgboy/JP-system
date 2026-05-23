import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient, extractData, extractMessage } from '../utils/api';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });
      const loginData = extractData<{ access_token: string }>(response);

      // 保存 token
      if (!loginData?.access_token) {
        throw new Error('登录响应缺少 access_token');
      }
      localStorage.setItem('admin_token', loginData.access_token);

      // 跳转到后台首页
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      console.error('登录失败:', err);
      setError(
        extractMessage(err.response?.data, '登录失败，请检查用户名和密码'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="mb-2 text-2xl font-semibold text-slate-950">JP 后台管理系统</h1>
          <p className="text-sm text-slate-500">管理员登录</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="请输入用户名"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="请输入密码"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
