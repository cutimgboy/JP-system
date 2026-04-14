import { useMemo, useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient, extractMessage } from '../../utils/api';

const passwordRule =
  /^(?=.{8,20}$)(?:(?=.*[A-Za-z])(?=.*\d)|(?=.*[A-Za-z])(?=.*[^A-Za-z\d])|(?=.*\d)(?=.*[^A-Za-z\d]))\S+$/;

export function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const passwordChecks = useMemo(
    () => [
      {
        label: '密码至少8个字符',
        passed: newPassword.length >= 8,
      },
      {
        label: '字母、数字或标点至少包含2种',
        passed: passwordRule.test(newPassword),
      },
      {
        label: '两次输入的新密码需要一致',
        passed: Boolean(newPassword) && newPassword === confirmPassword,
      },
    ],
    [confirmPassword, newPassword],
  );

  const validateForm = () => {
    if (!currentPassword.trim()) {
      return '请输入旧密码';
    }

    if (!passwordRule.test(newPassword)) {
      return '新密码至少8位，且需包含字母、数字、特殊字符中的至少2种';
    }

    if (newPassword !== confirmPassword) {
      return '两次输入的新密码不一致';
    }

    if (currentPassword === newPassword) {
      return '新密码不能与旧密码相同';
    }

    return '';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);
      setSuccessMessage('');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      await apiClient.put('/user/password/change', {
        currentPassword,
        newPassword,
      });

      setSuccessMessage('密码修改成功');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      window.setTimeout(() => {
        navigate('/profile');
      }, 900);
    } catch (err: any) {
      setError(extractMessage(err.response?.data, '密码修改失败'));
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
            onClick={() => navigate('/profile')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/[0.06]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-8">
          <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.03em] text-white">
            修改登录密码
          </h1>
          <p className="mt-4 text-[14px] leading-6 text-white/55">
            为了保障账户安全，修改密码前需要先验证当前登录密码。
          </p>
        </div>

        <form id="change-password-form" onSubmit={handleSubmit} className="relative mt-9">
          <div>
            <label className="mb-3 block text-[14px] font-medium text-white/72">旧密码</label>
            <div className="relative rounded-[20px] border border-white/5 bg-[#14141c] px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="请输入旧密码"
                className="w-full bg-transparent pr-10 text-[17px] font-medium text-white outline-none placeholder:text-white/25"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a58dff]"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-[14px] font-medium text-white/72">新密码</label>
            <div className="relative rounded-[20px] border border-white/5 bg-[#14141c] px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
              <input
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="请输入新密码"
                className="w-full bg-transparent pr-10 text-[17px] font-medium text-white outline-none placeholder:text-white/25"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a58dff]"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                placeholder="请再次输入新密码"
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

          {successMessage && (
            <div className="mt-5 rounded-[14px] border border-[#14532d]/60 bg-[#0f2418] px-4 py-3 text-sm text-[#86efac]">
              {successMessage}
            </div>
          )}
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent">
        <div className="mx-auto w-full max-w-md px-5 pb-6 pt-4">
          <button
            type="submit"
            form="change-password-form"
            disabled={submitting}
            className="h-14 w-full rounded-[16px] bg-[linear-gradient(135deg,#6c48f5_0%,#8b5cf6_100%)] text-[18px] font-semibold text-white shadow-[0_14px_30px_rgba(108,72,245,0.36)] transition disabled:bg-[#26262d] disabled:shadow-none disabled:text-white/30"
          >
            {submitting ? '提交中...' : '确认修改'}
          </button>
        </div>
      </div>
    </div>
  );
}
