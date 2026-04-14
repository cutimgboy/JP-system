import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Battery,
  Eye,
  EyeOff,
  Mail,
  Signal,
  Smartphone,
  Wifi,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, extractData, extractMessage } from '../../utils/api';

type LoginStep = 'phone' | 'password' | 'sms';

interface CheckPhoneLoginMethodResult {
  phone: string;
  userExists: boolean;
  hasPassword: boolean;
  loginMethod: 'password' | 'sms';
}

const phoneRegex = /^1[3-9]\d{9}$/;

function maskPhone(phone: string) {
  if (phone.length !== 11) {
    return phone;
  }

  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

function ScreenShell({
  title,
  subtitle,
  onBack,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden bg-[#09090b] px-5 pb-32 pt-3">
        <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-[#6c48f5]/18 blur-[90px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="relative flex items-center justify-between text-xs text-white">
          <span>12:00</span>
          <div className="flex items-center gap-1">
            <Signal className="h-4 w-4" />
            <Wifi className="h-4 w-4" />
            <Battery className="h-4 w-4" />
          </div>
        </div>

        <div className="relative mt-5">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/[0.06]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-8">
          <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.03em] text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-[14px] leading-6 text-white/55">{subtitle}</p>
          )}
        </div>

        <div className="relative mt-10">{children}</div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent">
        <div className="mx-auto w-full max-w-md px-5 pb-6 pt-4">{footer}</div>
      </div>
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const hiddenCodeInputRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    if (!hasSeenSplash) {
      navigate('/splash', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const isPhoneValid = useMemo(() => phoneRegex.test(phone), [phone]);
  const maskedPhone = useMemo(() => maskPhone(phone), [phone]);

  const goToStep = (nextStep: LoginStep) => {
    setError('');
    setStep(nextStep);

    if (nextStep !== 'password') {
      setPassword('');
      setShowPassword(false);
    }

    if (nextStep !== 'sms') {
      setCode('');
      setCountdown(0);
    }
  };

  const sendSmsCode = async () => {
    if (!isPhoneValid) {
      setError('请输入正确的手机号');
      return false;
    }

    if (countdown > 0) {
      return true;
    }

    try {
      setSendingCode(true);
      setError('');

      const response = await apiClient.post('/auth/send-sms', { phone });
      const smsData = extractData<{ code?: string | number }>(response);

      if (import.meta.env.DEV && smsData?.code) {
        console.log('验证码:', smsData.code);
        alert(`验证码: ${smsData.code} (开发环境)`);
      }

      setCountdown(58);
      return true;
    } catch (err: any) {
      setError(extractMessage(err.response?.data, '发送验证码失败'));
      return false;
    } finally {
      setSendingCode(false);
    }
  };

  const handlePhoneContinue = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!isPhoneValid) {
      setError('请输入正确的手机号');
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiClient.post('/auth/check-phone-login-method', {
        phone,
      });
      const result = extractData<CheckPhoneLoginMethodResult>(response);

      if (!result) {
        setError('登录方式识别失败，请稍后重试');
        return;
      }

      if (result.loginMethod === 'password') {
        goToStep('password');
        return;
      }

      const sent = await sendSmsCode();
      if (sent) {
        setStep('sms');
        setError('');
        window.setTimeout(() => hiddenCodeInputRef.current?.focus(), 0);
      }
    } catch (err: any) {
      setError(extractMessage(err.response?.data, '登录方式识别失败'));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('请输入登录密码');
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiClient.post('/auth/phone-password-login', {
        phone,
        password,
      });
      const loginData = extractData(response);

      if (loginData?.token && loginData?.userInfo) {
        login(loginData.token, loginData.userInfo);
        navigate('/', { replace: true });
        return;
      }

      setError('登录失败，请重试');
    } catch (err: any) {
      setError(extractMessage(err.response?.data, err.message || '登录失败'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSmsLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!code || code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiClient.post('/auth/sms-login', {
        phone,
        code,
      });
      const loginData = extractData(response);

      if (loginData?.token && loginData?.userInfo) {
        login(loginData.token, loginData.userInfo);
        navigate(loginData.userInfo.requiresPasswordSetup ? '/setup-password' : '/', {
          replace: true,
        });
        return;
      }

      setError('登录失败，请重试');
    } catch (err: any) {
      setError(extractMessage(err.response?.data, err.message || '登录失败'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'phone') {
      navigate('/splash');
      return;
    }

    goToStep('phone');
  };

  const handleUseSmsInstead = async () => {
    const sent = await sendSmsCode();
    if (sent) {
      setStep('sms');
      setError('');
      window.setTimeout(() => hiddenCodeInputRef.current?.focus(), 0);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, 6));
  };

  const primaryText =
    step === 'phone'
      ? submitting
        ? '识别中...'
        : '继续'
      : submitting
        ? '登录中...'
        : '继续';

  if (step === 'phone') {
    return (
      <ScreenShell
        title="一键注册登录"
        subtitle="新用户最高可领取5000000奖励，1分钟开始投资"
        onBack={handleBack}
        footer={
          <button
            type="submit"
            form="phone-login-form"
            disabled={!isPhoneValid || submitting}
            className="h-14 w-full rounded-[16px] bg-[linear-gradient(135deg,#6c48f5_0%,#8b5cf6_100%)] text-[18px] font-semibold text-white shadow-[0_14px_30px_rgba(108,72,245,0.36)] transition disabled:bg-[#26262d] disabled:shadow-none disabled:text-white/30"
          >
            {primaryText}
          </button>
        }
      >
        <form id="phone-login-form" onSubmit={handlePhoneContinue}>
          <div className="flex items-center gap-8 text-[15px] font-medium text-white">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              手机号
            </div>
            <div className="flex items-center gap-2 text-white/35">
              <Mail className="h-5 w-5" />
              邮箱
            </div>
          </div>

          <div className="mt-6 rounded-[20px] border border-white/5 bg-[#14141c] px-3 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-[#1e1e28] px-2.5 py-1.5 text-[14px] font-medium text-white shadow-[0_4px_10px_rgba(108,72,245,0.08)]">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2a263c] text-[10px] font-semibold text-[#a58dff]">
                  CN
                </span>
                +86
              </div>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入手机号"
                className="min-w-0 flex-1 bg-transparent text-[17px] font-medium text-white outline-none placeholder:text-white/25"
                maxLength={11}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-[14px] border border-[#7f1d1d]/60 bg-[#2a1115] px-4 py-3 text-sm text-[#fca5a5]">
              {error}
            </div>
          )}

          <div className="mt-44">
            <div className="flex items-center gap-4 text-[14px] text-white/35">
              <div className="h-px flex-1 bg-white/8" />
              <span>其他方式</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <div className="mt-8 flex items-center justify-center gap-7">
              {['X', '谷歌', '脸书'].map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-white/8 bg-[#14141c] text-[15px] text-white/45 shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </form>
      </ScreenShell>
    );
  }

  if (step === 'sms') {
    return (
      <ScreenShell
        title="请输入验证码"
        subtitle={`验证码短信已经发送到 ${maskedPhone || '您的手机号'}`}
        onBack={handleBack}
        footer={
          <button
            type="submit"
            form="sms-login-form"
            disabled={code.length !== 6 || submitting}
            className="h-14 w-full rounded-[16px] bg-[linear-gradient(135deg,#6c48f5_0%,#8b5cf6_100%)] text-[18px] font-semibold text-white shadow-[0_14px_30px_rgba(108,72,245,0.36)] transition disabled:bg-[#26262d] disabled:shadow-none disabled:text-white/30"
          >
            {primaryText}
          </button>
        }
      >
        <form id="sms-login-form" onSubmit={handleSmsLogin}>
          <div
            onClick={() => hiddenCodeInputRef.current?.focus()}
            className="relative mt-2 cursor-text"
          >
            <input
              ref={hiddenCodeInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => handleCodeChange(event.target.value)}
              className="absolute inset-0 opacity-0"
              maxLength={6}
            />
            <div className="flex items-center justify-between gap-3">
              {Array.from({ length: 6 }).map((_, index) => {
                const char = code[index] ?? '';
                const isActive = index === code.length && code.length < 6;
                return (
                  <div key={index} className="flex w-9 flex-col items-center gap-2">
                    <span
                      className={`min-h-10 text-[30px] font-medium leading-10 ${
                        char ? 'text-white' : isActive ? 'text-[#a58dff]' : 'text-transparent'
                      }`}
                    >
                      {char || '|'}
                    </span>
                    <span className={`h-[2px] w-full rounded-full ${char || isActive ? 'bg-[#6c48f5]' : 'bg-white/14'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-[15px]">
            <span className="text-white/50">没有收到？</span>
            <button
              type="button"
              onClick={sendSmsCode}
              disabled={sendingCode || countdown > 0}
              className="font-semibold text-[#a58dff] disabled:text-white/25"
            >
              {sendingCode ? '发送中...' : countdown > 0 ? `重新发送（${countdown}秒）` : '重新发送'}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-[14px] border border-[#7f1d1d]/60 bg-[#2a1115] px-4 py-3 text-sm text-[#fca5a5]">
              {error}
            </div>
          )}
        </form>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title="输入您的登录密码"
      onBack={handleBack}
      footer={
        <button
          type="submit"
          form="password-login-form"
          disabled={!password.trim() || submitting}
          className="h-14 w-full rounded-[16px] bg-[linear-gradient(135deg,#6c48f5_0%,#8b5cf6_100%)] text-[18px] font-semibold text-white shadow-[0_14px_30px_rgba(108,72,245,0.36)] transition disabled:bg-[#26262d] disabled:shadow-none disabled:text-white/30"
        >
          {primaryText}
        </button>
      }
    >
      <form id="password-login-form" onSubmit={handlePasswordLogin}>
        <div className="mt-5 rounded-[20px] border border-white/5 bg-[#14141c] px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入登录密码"
              className="w-full bg-transparent pr-10 text-[17px] font-medium text-white outline-none placeholder:text-white/25"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[#a58dff]"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseSmsInstead}
          disabled={sendingCode}
          className="mt-5 inline-flex items-center justify-center rounded-full border border-[#2a263c] bg-[#161420] px-4 py-2.5 text-[14px] font-medium text-[#b9a8ff] shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition hover:border-[#3a3556] hover:bg-[#1b1828] hover:text-white disabled:cursor-not-allowed disabled:border-white/6 disabled:bg-white/[0.03] disabled:text-white/25"
        >
          {sendingCode ? '验证码发送中...' : '去验证码登录'}
        </button>

        {error && (
          <div className="mt-4 rounded-[14px] border border-[#7f1d1d]/60 bg-[#2a1115] px-4 py-3 text-sm text-[#fca5a5]">
            {error}
          </div>
        )}
      </form>
    </ScreenShell>
  );
}
