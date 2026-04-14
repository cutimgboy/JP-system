import { useMemo, useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, extractMessage } from '../../utils/api';

const passwordRule =
  /^(?=.{8,20}$)(?:(?=.*[A-Za-z])(?=.*\d)|(?=.*[A-Za-z])(?=.*[^A-Za-z\d])|(?=.*\d)(?=.*[^A-Za-z\d]))\S+$/;

export function SetupPassword() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const passwordChecks = useMemo(
    () => [
      {
        label: '密码至少8个字符',
        passed: password.length >= 8,
      },
      {
        label: '字母、数字或标点至少包含2种',
        passed: passwordRule.test(password),
      },
      {
        label: '两次输入的新密码需要一致',
        passed: Boolean(password) && password === confirmPassword,
      },
    ],
    [confirmPassword, password],
  );

  const validate = () => {
    if (!passwordRule.test(password)) {
      return '密码至少8位，且需包含字母、数字、特殊字符中的至少2种';
    }

    if (password !== confirmPassword) {
      return '两次输入的密码不一致';
    }

    return '';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = validate();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await apiClient.put('/user/password/setup', {
        password,
      });

      await refreshUser();
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(extractMessage(err.response?.data, '密码设置失败'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden bg-[#09090b] px-5 pb-32 pt-6">
        <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-[#6c48f5]/18 blur-[90px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="relative mt-1">
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/[0.06]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-8">
          <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.03em] text-white">
            输入您的登录密码
          </h1>
        </div>

        <form id="setup-password-form" onSubmit={handleSubmit} className="relative mt-9">
          <div>
            <label className="mb-3 block text-[14px] font-medium text-white/72">新密码</label>
            <div className="relative rounded-[20px] border border-white/5 bg-[#14141c] px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="输入新密码"
                className="w-full bg-transparent pr-10 text-[17px] font-medium text-white outline-none placeholder:text-white/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a58dff]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-[14px] font-medium text-white/72">确认新密码</label>
            <div className="relative rounded-[20px] border border-white/5 bg-[#14141c] px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="输入新密码"
                className="w-full bg-transparent pr-10 text-[17px] font-medium text-white outline-none placeholder:text-white/25"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a58dff]"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-[14px] leading-6 text-white/42">
            {passwordChecks.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span className={`mt-2 h-1.5 w-1.5 rounded-full ${item.passed ? 'bg-[#a58dff]' : 'bg-white/20'}`} />
                <span className={item.passed ? 'text-white/76' : ''}>{item.label}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-5 rounded-[14px] border border-[#7f1d1d]/60 bg-[#2a1115] px-4 py-3 text-sm text-[#fca5a5]">
              {error}
            </div>
          )}
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent">
        <div className="mx-auto w-full max-w-md px-5 pb-6 pt-4">
          <button
            type="submit"
            form="setup-password-form"
            disabled={submitting}
            className="h-14 w-full rounded-[16px] bg-[linear-gradient(135deg,#6c48f5_0%,#8b5cf6_100%)] text-[18px] font-semibold text-white shadow-[0_14px_30px_rgba(108,72,245,0.36)] transition disabled:bg-[#26262d] disabled:shadow-none disabled:text-white/30"
          >
            {submitting ? '设置中...' : '继续'}
          </button>
        </div>
      </div>
    </div>
  );
}
