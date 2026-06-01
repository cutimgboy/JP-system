import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, extractData, extractMessage } from '../../utils/api';
import { tx } from "../../i18n/text";

type LoginChannel = 'phone' | 'email';
type LoginStep = 'identifier' | 'password' | 'code';

interface CheckLoginMethodResult {
  phone?: string;
  email?: string;
  userExists: boolean;
  hasPassword: boolean;
  loginMethod: 'password' | 'sms' | 'email';
}

interface LoginResult {
  token: string;
  userInfo: {
    id: number;
    phone: string | null;
    email?: string | null;
    nickname?: string;
    avatar?: string;
    hasPassword?: boolean;
    requiresPasswordSetup?: boolean;
  };
}

const phoneRegex = /^1[3-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const socialLoginMethods = [
  { key: 'x', labelKey: 'X', symbol: 'X', symbolClassName: 'text-[15px]' },
  { key: 'google', labelKey: '谷歌', symbol: 'G', symbolClassName: 'text-[19px]' },
  { key: 'facebook', labelKey: '脸书', symbol: 'f', symbolClassName: 'text-[23px] leading-none' },
];

function maskPhone(phone: string) {
  if (phone.length !== 11) {
    return phone;
  }
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!name || !domain) {
    return email;
  }
  if (name.length <= 2) {
    return `${name[0] ?? ''}***@${domain}`;
  }
  return `${name.slice(0, 2)}***@${domain}`;
}

function ScreenShell({
  title,
  subtitle,
  onBack,
  children,
  footer
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#09090b] text-white">
      <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden bg-[#09090b] px-5 pb-32 pt-6">
        <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-[#6c48f5]/18 blur-[90px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="relative mt-1">
          <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/[0.06]">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-8">
          <h1 className="text-[28px] font-semibold leading-[1.2] tracking-normal text-white">
            {title}
          </h1>
          {subtitle && <p className="mt-4 text-[14px] leading-6 text-white/55">{subtitle}</p>}
        </div>

        <div className="relative mt-10">{children}</div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent">
        <div className="mx-auto w-full max-w-md px-5 pb-6 pt-4">{footer}</div>
      </div>
    </div>;
}

export function Login() {
  const navigate = useNavigate();
  const {
    login,
    user
  } = useAuth();
  const hiddenCodeInputRef = useRef<HTMLInputElement | null>(null);
  const [channel, setChannel] = useState<LoginChannel>('phone');
  const [step, setStep] = useState<LoginStep>('identifier');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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
      navigate('/splash', {
        replace: true
      });
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      navigate('/', {
        replace: true
      });
    }
  }, [navigate, user]);

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setCountdown(value => value - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const isPhoneValid = useMemo(() => phoneRegex.test(phone), [phone]);
  const isEmailValid = useMemo(() => emailRegex.test(normalizedEmail), [normalizedEmail]);
  const isIdentifierValid = channel === 'phone' ? isPhoneValid : isEmailValid;
  const maskedPhone = useMemo(() => maskPhone(phone), [phone]);
  const maskedEmail = useMemo(() => maskEmail(normalizedEmail), [normalizedEmail]);

  const goToStep = (nextStep: LoginStep) => {
    setError('');
    setStep(nextStep);
    if (nextStep !== 'password') {
      setPassword('');
      setShowPassword(false);
    }
    if (nextStep !== 'code') {
      setCode('');
      setCountdown(0);
    }
  };

  const handleChannelChange = (nextChannel: LoginChannel) => {
    setChannel(nextChannel);
    setError('');
    setPassword('');
    setCode('');
    setCountdown(0);
  };

  const sendCode = async () => {
    if (!isIdentifierValid) {
      setError(channel === 'phone' ? tx("请输入正确的手机号") : tx("请输入正确的邮箱地址"));
      return false;
    }
    if (countdown > 0) {
      return true;
    }
    try {
      setSendingCode(true);
      setError('');
      const response = await apiClient.post(channel === 'phone' ? '/auth/send-sms' : '/auth/send-email', channel === 'phone' ? {
        phone
      } : {
        email: normalizedEmail
      });
      const codeData = extractData<{
        code?: string | number;
      }>(response);
      if (import.meta.env.DEV && codeData?.code) {
        console.log(tx("验证码:"), codeData.code);
        alert(tx('验证码开发提示', { code: codeData.code }));
      }
      setCountdown(58);
      return true;
    } catch (err: any) {
      setError(extractMessage(err.response?.data, tx("发送验证码失败")));
      return false;
    } finally {
      setSendingCode(false);
    }
  };

  const handleIdentifierContinue = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!isIdentifierValid) {
      setError(channel === 'phone' ? tx("请输入正确的手机号") : tx("请输入正确的邮箱地址"));
      return;
    }
    try {
      setSubmitting(true);
      const response = await apiClient.post(channel === 'phone' ? '/auth/check-phone-login-method' : '/auth/check-email-login-method', channel === 'phone' ? {
        phone
      } : {
        email: normalizedEmail
      });
      const result = extractData<CheckLoginMethodResult>(response);
      if (!result) {
        setError(tx("登录方式识别失败，请稍后重试"));
        return;
      }
      if (result.phone) {
        setPhone(result.phone);
      }
      if (result.email) {
        setEmail(result.email);
      }
      if (result.loginMethod === 'password') {
        goToStep('password');
        return;
      }
      const sent = await sendCode();
      if (sent) {
        setStep('code');
        setError('');
        window.setTimeout(() => hiddenCodeInputRef.current?.focus(), 0);
      }
    } catch (err: any) {
      setError(extractMessage(err.response?.data, tx("登录方式识别失败")));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!password.trim()) {
      setError(tx("请输入登录密码"));
      return;
    }
    try {
      setSubmitting(true);
      const response = await apiClient.post(channel === 'phone' ? '/auth/phone-password-login' : '/auth/email-password-login', channel === 'phone' ? {
        phone,
        password
      } : {
        email: normalizedEmail,
        password
      });
      const loginData = extractData<LoginResult>(response);
      if (loginData?.token && loginData?.userInfo) {
        login(loginData.token, loginData.userInfo);
        navigate(loginData.userInfo.requiresPasswordSetup ? '/setup-password' : '/', {
          replace: true
        });
        return;
      }
      setError(tx("登录失败，请重试"));
    } catch (err: any) {
      setError(extractMessage(err.response?.data, err.message || tx("登录失败")));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodeLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!code || code.length !== 6) {
      setError(tx("请输入6位验证码"));
      return;
    }
    try {
      setSubmitting(true);
      const response = await apiClient.post(channel === 'phone' ? '/auth/sms-login' : '/auth/email-login', channel === 'phone' ? {
        phone,
        code
      } : {
        email: normalizedEmail,
        code
      });
      const loginData = extractData<LoginResult>(response);
      if (loginData?.token && loginData?.userInfo) {
        login(loginData.token, loginData.userInfo);
        navigate(loginData.userInfo.requiresPasswordSetup ? '/setup-password' : '/', {
          replace: true
        });
        return;
      }
      setError(tx("登录失败，请重试"));
    } catch (err: any) {
      setError(extractMessage(err.response?.data, err.message || tx("登录失败")));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'identifier') {
      navigate('/splash');
      return;
    }
    goToStep('identifier');
  };

  const handleUseCodeInstead = async () => {
    const sent = await sendCode();
    if (sent) {
      setStep('code');
      setError('');
      window.setTimeout(() => hiddenCodeInputRef.current?.focus(), 0);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, 6));
  };

  const primaryText = step === 'identifier' ? submitting ? tx("识别中...") : tx("继续") : submitting ? tx("登录中...") : tx("继续");
  const channelButtonClass = (value: LoginChannel) => `flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-[15px] font-medium transition ${channel === value ? 'bg-[#1e1e28] text-white shadow-[0_4px_10px_rgba(108,72,245,0.08)]' : 'text-white/35 hover:text-white/60'}`;
  const codeSubtitle = channel === 'phone' ? tx('验证码短信已经发送到 {{phone}}', { phone: maskedPhone || tx("您的手机号") }) : tx('验证码邮件已经发送到 {{email}}', { email: maskedEmail || tx("您的邮箱") });

  if (step === 'identifier') {
    return <ScreenShell title={tx("一键注册登录")} subtitle={tx("新用户最高可领取5000000奖励，1分钟开始投资")} onBack={handleBack} footer={<button type="submit" form="identifier-login-form" disabled={!isIdentifierValid || submitting} className="h-14 w-full rounded-[16px] bg-[linear-gradient(135deg,#6c48f5_0%,#8b5cf6_100%)] text-[18px] font-semibold text-white shadow-[0_14px_30px_rgba(108,72,245,0.36)] transition disabled:bg-[#26262d] disabled:shadow-none disabled:text-white/30">
            {primaryText}
          </button>}>
        <form id="identifier-login-form" onSubmit={handleIdentifierContinue}>
          <div className="flex rounded-full border border-white/5 bg-[#14141c] p-1">
            <button type="button" aria-pressed={channel === 'phone'} onClick={() => handleChannelChange('phone')} className={channelButtonClass('phone')}>
              <Smartphone className="h-5 w-5" />{tx("手机号")}
            </button>
            <button type="button" aria-pressed={channel === 'email'} onClick={() => handleChannelChange('email')} className={channelButtonClass('email')}>
              <Mail className="h-5 w-5" />{tx("邮箱")}
            </button>
          </div>

          <div className="mt-6 rounded-[20px] border border-white/5 bg-[#14141c] px-3 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
            {channel === 'phone' ? <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-[#1e1e28] px-2.5 py-1.5 text-[14px] font-medium text-white shadow-[0_4px_10px_rgba(108,72,245,0.08)]">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2a263c] text-[10px] font-semibold text-[#a58dff]">
                    CN
                  </span>
                  +86
                </div>
                <input type="tel" inputMode="numeric" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))} placeholder={tx("请输入手机号")} className="min-w-0 flex-1 bg-transparent text-[17px] font-medium text-white outline-none placeholder:text-white/25" maxLength={11} />
              </div> : <div className="flex items-center gap-3 px-1">
                <Mail className="h-5 w-5 shrink-0 text-[#a58dff]" />
                <input type="email" inputMode="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value.replace(/\s/g, ''))} onBlur={() => setEmail(value => value.trim().toLowerCase())} placeholder={tx("请输入邮箱地址")} className="min-w-0 flex-1 bg-transparent text-[17px] font-medium text-white outline-none placeholder:text-white/25" />
              </div>}
          </div>

          {error && <div className="mt-4 rounded-[14px] border border-[#7f1d1d]/60 bg-[#2a1115] px-4 py-3 text-sm text-[#fca5a5]">
              {error}
            </div>}

          <div className="mt-28">
            <div className="flex items-center gap-4 text-[14px] text-white/35">
              <div className="h-px flex-1 bg-white/8" />
              <span>{tx("其他方式")}</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <div className="mt-8 flex items-center justify-center gap-7">
              {socialLoginMethods.map(item => <button key={item.key} type="button" aria-label={tx(item.labelKey)} disabled className="flex h-14 w-14 items-center justify-center rounded-full border border-white/8 bg-[#14141c] font-semibold text-white/50 shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
                  <span className={item.symbolClassName}>{item.symbol}</span>
                </button>)}
            </div>
          </div>
        </form>
      </ScreenShell>;
  }

  if (step === 'code') {
    return <ScreenShell title={tx("请输入验证码")} subtitle={codeSubtitle} onBack={handleBack} footer={<button type="submit" form="code-login-form" disabled={code.length !== 6 || submitting} className="h-14 w-full rounded-[16px] bg-[linear-gradient(135deg,#6c48f5_0%,#8b5cf6_100%)] text-[18px] font-semibold text-white shadow-[0_14px_30px_rgba(108,72,245,0.36)] transition disabled:bg-[#26262d] disabled:shadow-none disabled:text-white/30">
            {primaryText}
          </button>}>
        <form id="code-login-form" onSubmit={handleCodeLogin}>
          <div onClick={() => hiddenCodeInputRef.current?.focus()} className="relative mt-2 cursor-text">
            <input ref={hiddenCodeInputRef} type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={event => handleCodeChange(event.target.value)} className="absolute inset-0 opacity-0" maxLength={6} />
            <div className="flex items-center justify-between gap-3">
              {Array.from({
              length: 6
            }).map((_, index) => {
              const char = code[index] ?? '';
              const isActive = index === code.length && code.length < 6;
              return <div key={index} className="flex w-9 flex-col items-center gap-2">
                    <span className={`min-h-10 text-[30px] font-medium leading-10 ${char ? 'text-white' : isActive ? 'text-[#a58dff]' : 'text-transparent'}`}>
                      {char || '|'}
                    </span>
                    <span className={`h-[2px] w-full rounded-full ${char || isActive ? 'bg-[#6c48f5]' : 'bg-white/14'}`} />
                  </div>;
            })}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-[15px]">
            <span className="text-white/50">{tx("没有收到？")}</span>
            <button type="button" onClick={sendCode} disabled={sendingCode || countdown > 0} className="font-semibold text-[#a58dff] disabled:text-white/25">
              {sendingCode ? tx("发送中...") : countdown > 0 ? tx('重新发送倒计时', { seconds: countdown }) : tx("重新发送")}
            </button>
          </div>

          {error && <div className="mt-4 rounded-[14px] border border-[#7f1d1d]/60 bg-[#2a1115] px-4 py-3 text-sm text-[#fca5a5]">
              {error}
            </div>}
        </form>
      </ScreenShell>;
  }

  return <ScreenShell title={tx("输入您的登录密码")} onBack={handleBack} footer={<button type="submit" form="password-login-form" disabled={!password.trim() || submitting} className="h-14 w-full rounded-[16px] bg-[linear-gradient(135deg,#6c48f5_0%,#8b5cf6_100%)] text-[18px] font-semibold text-white shadow-[0_14px_30px_rgba(108,72,245,0.36)] transition disabled:bg-[#26262d] disabled:shadow-none disabled:text-white/30">
          {primaryText}
        </button>}>
      <form id="password-login-form" onSubmit={handlePasswordLogin}>
        <div className="mt-5 rounded-[20px] border border-white/5 bg-[#14141c] px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder={tx("请输入登录密码")} className="w-full bg-transparent pr-10 text-[17px] font-medium text-white outline-none placeholder:text-white/25" />
            <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#a58dff]">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button type="button" onClick={handleUseCodeInstead} disabled={sendingCode} className="mt-5 inline-flex items-center justify-center rounded-full border border-[#2a263c] bg-[#161420] px-4 py-2.5 text-[14px] font-medium text-[#b9a8ff] shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition hover:border-[#3a3556] hover:bg-[#1b1828] hover:text-white disabled:cursor-not-allowed disabled:border-white/6 disabled:bg-white/[0.03] disabled:text-white/25">
          {sendingCode ? tx("验证码发送中...") : tx("去验证码登录")}
        </button>

        {error && <div className="mt-4 rounded-[14px] border border-[#7f1d1d]/60 bg-[#2a1115] px-4 py-3 text-sm text-[#fca5a5]">
            {error}
          </div>}
      </form>
    </ScreenShell>;
}
