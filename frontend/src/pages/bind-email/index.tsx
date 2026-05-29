import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, Mail, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient, extractData, extractMessage } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { tx } from "../../i18n/text";
import { goBackOrNavigate } from '../../utils/navigation';
interface UserInfo {
  phone: string | null;
  email: string | null;
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function BindEmail() {
  const navigate = useNavigate();
  const {
    refreshUser
  } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [currentEmailCode, setCurrentEmailCode] = useState('');
  const [currentPhoneCode, setCurrentPhoneCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmailCode, setNewEmailCode] = useState('');
  const [sendingTarget, setSendingTarget] = useState<'current' | 'new' | null>(null);
  const [verifyingCurrent, setVerifyingCurrent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);
  useEffect(() => {
    const fetchUserInfo = async () => {
      const response = await apiClient.get('/user/info');
      const data = extractData<UserInfo>(response);
      if (data) setUserInfo(data);
    };
    void fetchUserInfo();
  }, []);
  const hasEmail = Boolean(userInfo?.email);
  const title = hasEmail ? tx("更换绑定邮箱") : tx("绑定新邮箱");
  const currentVerifyLabel = hasEmail ? tx("当前绑定邮箱验证码") : tx("当前绑定手机号验证码");
  const currentVerifyValue = hasEmail ? userInfo?.email : userInfo?.phone;
  const currentCode = hasEmail ? currentEmailCode : currentPhoneCode;
  const canGoNext = currentCode.length === 6;
  const canSubmit = useMemo(() => emailRegex.test(newEmail) && newEmailCode.length === 6, [newEmail, newEmailCode]);
  const sendCurrentCode = async () => {
    if (!currentVerifyValue) {
      setMessage({
        type: 'error',
        text: hasEmail ? tx("当前账号未绑定邮箱") : tx("当前账号未绑定手机号")
      });
      return;
    }
    setSendingTarget('current');
    setMessage(null);
    try {
      if (hasEmail) {
        await apiClient.post('/auth/send-email', {
          email: currentVerifyValue
        });
      } else {
        await apiClient.post('/auth/send-sms', {
          phone: currentVerifyValue
        });
      }
      setMessage({
        type: 'success',
        text: tx("验证码已发送")
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: extractMessage(error.response?.data, tx("验证码发送失败"))
      });
    } finally {
      setSendingTarget(null);
    }
  };
  const sendNewEmailCode = async () => {
    if (!emailRegex.test(newEmail)) {
      setMessage({
        type: 'error',
        text: tx("请输入正确的邮箱地址")
      });
      return;
    }
    setSendingTarget('new');
    setMessage(null);
    try {
      await apiClient.post('/auth/send-email', {
        email: newEmail
      });
      setMessage({
        type: 'success',
        text: tx("新邮箱验证码已发送")
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: extractMessage(error.response?.data, tx("验证码发送失败"))
      });
    } finally {
      setSendingTarget(null);
    }
  };
  const verifyCurrentAndNext = async () => {
    if (!canGoNext) {
      setMessage({
        type: 'error',
        text: tx("请输入6位验证码")
      });
      return;
    }
    setVerifyingCurrent(true);
    setMessage(null);
    try {
      await apiClient.post('/user/email/verify-current', {
        currentEmailCode: hasEmail ? currentEmailCode : undefined,
        currentPhoneCode: hasEmail ? undefined : currentPhoneCode
      });
      setStep(2);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: extractMessage(error.response?.data, tx("验证码校验失败"))
      });
    } finally {
      setVerifyingCurrent(false);
    }
  };
  const handleSubmit = async () => {
    if (!canSubmit) {
      setMessage({
        type: 'error',
        text: tx("请填写新邮箱和验证码")
      });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await apiClient.post('/user/email/bind', {
        currentEmailCode: hasEmail ? currentEmailCode : undefined,
        currentPhoneCode: hasEmail ? undefined : currentPhoneCode,
        newEmail,
        newEmailCode
      });
      await refreshUser();
      setMessage({
        type: 'success',
        text: hasEmail ? tx("邮箱更换成功") : tx("邮箱绑定成功")
      });
      window.setTimeout(() => navigate('/personal-info', {
        replace: true
      }), 800);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: extractMessage(error.response?.data, tx("绑定失败"))
      });
    } finally {
      setSubmitting(false);
    }
  };
  return <BindShell title={title} onBack={() => step === 1 ? goBackOrNavigate(navigate, '/personal-info') : setStep(1)}>
      <div className="mb-8">
        <h2 className="text-[24px] font-bold tracking-tight">{step === 1 ? tx("验证当前账户") : tx("输入新邮箱")}</h2>
        <p className="mt-2 text-[13px] leading-6 text-[#8a8a93]">
          {step === 1 ? hasEmail ? tx("更换前需要先验证当前绑定邮箱。") : tx("绑定邮箱前需要先验证当前已绑定手机号。") : tx("新邮箱验证通过后，将立即完成绑定且无需重新登录。")}
        </p>
      </div>

      {step === 1 ? <div className="space-y-5">
          <ReadonlyTarget icon={hasEmail ? Mail : Smartphone} label={hasEmail ? tx("当前邮箱") : tx("当前手机号")} value={currentVerifyValue || tx("未绑定")} />
          <CodeInput label={currentVerifyLabel} value={currentCode} onChange={hasEmail ? setCurrentEmailCode : setCurrentPhoneCode} onSend={sendCurrentCode} sending={sendingTarget === 'current'} />
          <PrimaryButton disabled={!canGoNext || verifyingCurrent} onClick={verifyCurrentAndNext}>
            {verifyingCurrent ? tx("校验中...") : tx("下一步")}
          </PrimaryButton>
        </div> : <div className="space-y-5">
          <TextInput icon={Mail} label={tx("新邮箱地址")} value={newEmail} placeholder={tx("请输入需要绑定的邮箱地址")} onChange={setNewEmail} />
          <CodeInput label={tx("新邮箱验证码")} value={newEmailCode} onChange={setNewEmailCode} onSend={sendNewEmailCode} sending={sendingTarget === 'new'} />
          <PrimaryButton disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? tx("提交中...") : hasEmail ? tx("确认更换") : tx("确认绑定")}
          </PrimaryButton>
        </div>}

      {message ? <InlineMessage type={message.type}>{message.text}</InlineMessage> : null}
    </BindShell>;
}
function BindShell({
  title,
  children,
  onBack
}: {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
}) {
  return <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button onClick={onBack} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">{title}</h1>
        <div className="w-10" />
      </div>
      <div className="px-5 pb-12 pt-8">{children}</div>
    </div>;
}
function ReadonlyTarget({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return <div>
      <label className="mb-3 block text-[14px] font-medium text-white/90">{label}</label>
      <div className="flex h-[56px] items-center gap-3 rounded-[16px] border border-white/10 bg-[#14141c] px-4 text-white">
        <Icon size={18} className="text-[#8a8a93]" />
        <span className="min-w-0 truncate text-[15px] text-white/80">{value}</span>
      </div>
    </div>;
}
function TextInput({
  icon: Icon,
  label,
  value,
  placeholder,
  onChange
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return <div>
      <label className="mb-3 block text-[14px] font-medium text-white/90">{label}</label>
      <div className="flex h-[56px] items-center gap-3 rounded-[16px] border border-white/10 bg-[#14141c] px-4">
        <Icon size={18} className="text-[#8a8a93]" />
        <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#8a8a93]" />
      </div>
    </div>;
}
function CodeInput({
  label,
  value,
  sending,
  onChange,
  onSend
}: {
  label: string;
  value: string;
  sending: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  return <div>
      <label className="mb-3 block text-[14px] font-medium text-white/90">{label}</label>
      <div className="flex h-[56px] items-center rounded-[16px] border border-white/10 bg-[#14141c] px-4">
        <input value={value} maxLength={6} onChange={event => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder={tx("请输入验证码")} className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#8a8a93]" />
        <button type="button" onClick={onSend} disabled={sending} className="ml-3 h-8 shrink-0 rounded-full border border-[#6c48f5]/40 px-3 text-[13px] text-[#a58dff] disabled:opacity-50">
          {sending ? tx("发送中") : tx("获取验证码")}
        </button>
      </div>
    </div>;
}
function PrimaryButton({
  disabled,
  children,
  onClick
}: {
  disabled: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return <button onClick={onClick} disabled={disabled} className="mt-7 flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#6c48f5] text-[16px] font-medium text-white shadow-[0_4px_16px_rgba(108,72,245,0.3)] transition-colors hover:bg-[#5a3bd9] disabled:cursor-not-allowed disabled:bg-[#1a1a24] disabled:text-white/30 disabled:shadow-none">
      {!disabled ? <Check size={20} /> : null}
      {children}
    </button>;
}
function InlineMessage({
  type,
  children
}: {
  type: 'error' | 'success';
  children: React.ReactNode;
}) {
  return <div className={`mt-5 rounded-[14px] border px-4 py-3 text-sm ${type === 'success' ? 'border-[#14532d]/60 bg-[#0f2418] text-[#86efac]' : 'border-[#7f1d1d]/60 bg-[#2a1115] text-[#fca5a5]'}`}>
      {children}
    </div>;
}
