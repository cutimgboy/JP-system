import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent typing spaces
  const handleSpacePrevention = (e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      toast.error('不可输入空格');
    }
  };

  const validate = () => {
    if (!oldPassword) {
      setError('请输入当前密码');
      return false;
    }
    if (!newPassword) {
      setError('请输入新密码');
      return false;
    }
    if (!confirmPassword) {
      setError('请再次输入新密码');
      return false;
    }
    if (newPassword.length < 8) {
      setError('密码长度至少为 8 个字符');
      return false;
    }

    // Check complexity: at least 2 of (letters, numbers, symbols)
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSymbol = /[^a-zA-Z0-9\s]/.test(newPassword); // Non-alphanumeric, non-space
    
    const complexityScore = (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSymbol ? 1 : 0);
    
    if (complexityScore < 2) {
      setError('密码需包含字母、数字或标点中的至少两种');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // Simulate network request
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 10% chance to simulate a network error for demonstration based on requirements
          if (Math.random() < 0.1) {
            reject(new Error('Network error'));
          } else {
            resolve(true);
          }
        }, 1000);
      });
      
      toast.success('密码修改成功，请重新登录');
      navigate(-1);
    } catch (e) {
      setError('网络异常，请检查网络后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ 
    label,
    placeholder, 
    value, 
    setValue, 
    show, 
    setShow 
  }: { 
    label: string,
    placeholder: string, 
    value: string, 
    setValue: (val: string) => void,
    show: boolean,
    setShow: (val: boolean) => void
  }) => (
    <div>
      <label className="block text-[15px] font-medium text-white mb-2">{label}</label>
      <div className="flex items-center justify-between border-b border-white/10 pb-3 focus-within:border-[#6c48f5]/50 transition-colors">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => {
            // Prevent space on paste/input
            setValue(e.target.value.replace(/\s/g, ''));
          }}
          onKeyDown={handleSpacePrevention}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] text-white placeholder:text-[#8a8a93] outline-none"
        />
        <button 
          type="button"
          onClick={() => setShow(!show)}
          className="text-[#8a8a93] hover:text-white transition-colors ml-2 shrink-0"
        >
          {show ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-[#09090b] flex flex-col text-white z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[60px] shrink-0 border-b border-white/5 relative z-10 bg-[#09090b]/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-medium text-white absolute left-1/2 -translate-x-1/2">
          修改登录密码
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[120px]">
        <div className="mb-8">
          <p className="text-[#8a8a93] text-[13px] leading-relaxed">
            为了您的账号安全，请定期更换密码。密码需包含字母、数字或标点中的至少两种，长度不小于8位。
          </p>
        </div>

        <div className="space-y-6">
          <InputField 
            label="当前密码"
            placeholder="请输入当前登录密码" 
            value={oldPassword} 
            setValue={setOldPassword} 
            show={showOld} 
            setShow={setShowOld} 
          />
          <InputField 
            label="新密码"
            placeholder="请输入新密码" 
            value={newPassword} 
            setValue={setNewPassword} 
            show={showNew} 
            setShow={setShowNew} 
          />
          <InputField 
            label="确认新密码"
            placeholder="请再次输入新密码" 
            value={confirmPassword} 
            setValue={setConfirmPassword} 
            show={showConfirm} 
            setShow={setShowConfirm} 
          />
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5 mt-2 text-[#ef4444] text-[13px]">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pt-10">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full h-[52px] rounded-[16px] font-medium text-[16px] transition-all flex items-center justify-center ${
            isSubmitting 
              ? 'bg-[#1a1a24] text-white/50 cursor-not-allowed'
              : 'bg-[#6c48f5] hover:bg-[#5a3be0] text-white shadow-[0_4px_16px_rgba(108,72,245,0.3)]'
          }`}
        >
          {isSubmitting ? '提交中...' : '确认修改'}
        </button>
      </div>
    </div>
  );
}
