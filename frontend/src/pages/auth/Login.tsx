import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, extractData } from '../../utils/api';

export function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 如果已登录，直接跳转到首页
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 验证手机号格式
  const validatePhone = (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // 发送验证码
  const handleSendCode = async () => {
    setError('');

    if (!validatePhone(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    if (countdown > 0) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/auth/send-sms', { phone });

      // 开发环境下显示验证码
      if (import.meta.env.DEV && response.data?.code) {
        console.log('验证码:', response.data.code);
        alert(`验证码: ${response.data.code} (开发环境)`);
      }

      setCountdown(60);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || '发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePhone(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    if (!code || code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    try {
      setLoading(true);

      console.log('发送登录请求:', { phone, code });

      const response = await apiClient.post('/auth/sms-login', {
        phone,
        code,
      });

      console.log('登录响应:', response);

      // 使用 extractData 自动处理不同的数据嵌套格式
      const loginData = extractData(response);

      if (loginData?.token && loginData?.userInfo) {
        login(loginData.token, loginData.userInfo);
        // 跳转到首页
        navigate('/', { replace: true });
      } else {
        console.error('登录数据格式错误:', response);
        setError('登录失败，请重试');
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      console.error('错误响应:', err.response);

      // 显示后端返回的具体错误信息
      const errorMessage = err.response?.data?.data?.message
        || err.response?.data?.message
        || err.message
        || '登录失败';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen !bg-gradient-to-br !from-[#1a1f2e] !to-[#2d3548] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold !text-white mb-2">欢迎登录</h1>
          <p className="!text-gray-400">使用手机号验证码登录</p>
        </div>

        {/* 登录表单 */}
        <div className="!bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin}>
            {/* 手机号输入 */}
            <div className="mb-6">
              <label className="block !text-white text-sm font-medium mb-2">
                手机号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入手机号"
                className="w-full px-4 py-3 !bg-white/10 !border !border-white/20 rounded-lg !text-white !placeholder-gray-400 focus:outline-none focus:!border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                maxLength={11}
              />
            </div>

            {/* 验证码输入 */}
            <div className="mb-6">
              <label className="block !text-white text-sm font-medium mb-2">
                验证码
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="请输入验证码"
                  className="flex-1 px-4 py-3 !bg-white/10 !border !border-white/20 rounded-lg !text-white !placeholder-gray-400 focus:outline-none focus:!border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || loading}
                  className={`px-4 py-3 rounded-lg font-medium transition whitespace-nowrap flex-shrink-0 ${
                    countdown > 0 || loading
                      ? '!bg-gray-500 !text-gray-300 cursor-not-allowed'
                      : '!bg-blue-500 !text-white hover:!bg-blue-600'
                  }`}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-4 p-3 !bg-red-500/20 !border !border-red-500/50 rounded-lg !text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition ${
                loading
                  ? '!bg-gray-500 !text-gray-300 cursor-not-allowed'
                  : '!bg-gradient-to-r !from-blue-500 !to-purple-500 !text-white hover:!from-blue-600 hover:!to-purple-600'
              }`}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* 提示信息 */}
          <div className="mt-6 text-center !text-gray-400 text-sm">
            <p>首次登录将自动注册账号</p>
          </div>

          {/* 第三方登录（预留） */}
          <div className="mt-8 pt-6 !border-t !border-white/10">
            <p className="text-center !text-gray-400 text-sm mb-4">其他登录方式</p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                disabled
                className="p-3 !bg-white/10 rounded-full !text-gray-500 cursor-not-allowed"
                title="即将开放"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button
                type="button"
                disabled
                className="p-3 !bg-white/10 rounded-full !text-gray-500 cursor-not-allowed"
                title="即将开放"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
