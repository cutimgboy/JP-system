import { useState } from 'react';
import { AlertCircle, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { apiClient, extractMessage } from '../../utils/api';
import { Toast } from '../../components/Toast';
import { tx } from "../../i18n/text";
import { goBackOrNavigate } from '../../utils/navigation';
function hasPasswordComplexity(password: string) {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z\d]/.test(password);
  return Number(hasLetter) + Number(hasNumber) + Number(hasSymbol) >= 2;
}
export function ChangePassword() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const handleSpacePrevention = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === ' ') {
      event.preventDefault();
      setToast({
        message: tx("不可输入空格"),
        type: 'warning'
      });
    }
  };
  const validate = () => {
    if (!oldPassword) {
      setError(tx("请输入当前密码"));
      return false;
    }
    if (!newPassword) {
      setError(tx("请输入新密码"));
      return false;
    }
    if (!confirmPassword) {
      setError(tx("请再次输入新密码"));
      return false;
    }
    if (newPassword.length < 8) {
      setError(tx("密码长度至少为 8 个字符"));
      return false;
    }
    if (newPassword.length > 20) {
      setError(tx("密码长度不能超过 20 个字符"));
      return false;
    }
    if (!hasPasswordComplexity(newPassword)) {
      setError(tx("密码需包含字母、数字或标点中的至少两种"));
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError(tx("两次输入的密码不一致"));
      return false;
    }
    if (oldPassword === newPassword) {
      setError(tx("新密码不能与当前密码相同"));
      return false;
    }
    setError(null);
    return true;
  };
  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await apiClient.put('/user/password/change', {
        currentPassword: oldPassword,
        newPassword
      });
      setToast({
        message: tx("密码修改成功，请重新登录"),
        type: 'success'
      });
      window.setTimeout(() => navigate('/profile'), 900);
    } catch (err: any) {
      setError(extractMessage(err.response?.data, tx("网络异常，请检查网络后重试")));
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-[#09090b] text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button onClick={() => goBackOrNavigate(navigate, '/profile')} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium text-white">{tx("修改登录密码")}</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-[120px] pt-6">
        <div className="mb-8">
          <p className="text-[13px] leading-relaxed text-[#8a8a93]">{tx("为了您的账号安全，请定期更换密码。密码需包含字母、数字或标点中的至少两种，长度不小于8位。")}</p>
        </div>

        <div className="space-y-6">
          <InputField label={tx("当前密码")} placeholder={tx("请输入当前登录密码")} value={oldPassword} setValue={setOldPassword} show={showOld} setShow={setShowOld} onKeyDown={handleSpacePrevention} />
          <InputField label={tx("新密码")} placeholder={tx("请输入新密码")} value={newPassword} setValue={setNewPassword} show={showNew} setShow={setShowNew} onKeyDown={handleSpacePrevention} />
          <InputField label={tx("确认新密码")} placeholder={tx("请再次输入新密码")} value={confirmPassword} setValue={setConfirmPassword} show={showConfirm} setShow={setShowConfirm} onKeyDown={handleSpacePrevention} />

          <AnimatePresence>
            {error && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} className="overflow-hidden">
                <div className="mt-2 flex items-center gap-1.5 text-[13px] text-[#ef4444]">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent p-5 pt-10">
        <button onClick={handleSubmit} disabled={isSubmitting} className={`flex h-[52px] w-full items-center justify-center rounded-[16px] text-[16px] font-medium transition-all ${isSubmitting ? 'cursor-not-allowed bg-[#1a1a24] text-white/50' : 'bg-[#6c48f5] text-white shadow-[0_4px_16px_rgba(108,72,245,0.3)] hover:bg-[#5a3be0]'}`}>
          {isSubmitting ? tx("提交中...") : tx("确认修改")}
        </button>
      </div>
    </div>;
}
function InputField({
  label,
  placeholder,
  value,
  setValue,
  show,
  setShow,
  onKeyDown
}: {
  label: string;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  show: boolean;
  setShow: (value: boolean) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return <div>
      <label className="mb-2 block text-[15px] font-medium text-white">{label}</label>
      <div className="flex items-center justify-between border-b border-white/10 pb-3 transition-colors focus-within:border-[#6c48f5]/50">
        <input type={show ? 'text' : 'password'} value={value} onChange={event => setValue(event.target.value.replace(/\s/g, ''))} onKeyDown={onKeyDown} placeholder={placeholder} className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-[#8a8a93]" />
        <button type="button" onClick={() => setShow(!show)} className="ml-2 shrink-0 text-[#8a8a93] transition-colors hover:text-white">
          {show ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
    </div>;
}
