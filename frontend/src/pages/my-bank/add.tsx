import { useMemo, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiClient, extractData } from '../../utils/api';
import { Toast } from '../../components/Toast';
import { tx } from "../../i18n/text";
import { goBackOrNavigate } from '../../utils/navigation';
export function AddBankCard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: ''
  });
  const isFormValid = useMemo(() => Boolean(formData.bankName.trim() && formData.accountName.trim() && formData.accountNumber.trim()), [formData.accountName, formData.accountNumber, formData.bankName]);
  const handleSubmit = async () => {
    if (!isFormValid) {
      setToast({
        message: tx("请填写完整的银行卡信息"),
        type: 'warning'
      });
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post('/bank-card', formData);
      const result = extractData(response);
      if (result) {
        setToast({
          message: tx("添加成功"),
          type: 'success'
        });
        setTimeout(() => {
          navigate('/my-bank');
        }, 800);
      } else {
        setToast({
          message: tx("添加失败"),
          type: 'error'
        });
      }
    } catch (error) {
      console.error(tx("添加银行卡失败:"), error);
      setToast({
        message: tx("添加失败，请重试"),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  return <div className="min-h-screen bg-[#09090b] text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button onClick={() => goBackOrNavigate(navigate, '/my-bank')} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium text-white">{tx("添加银行卡")}</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-[120px] pt-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4
      }}>
          <h2 className="mb-2 text-[24px] font-bold tracking-tight">{tx("填写您的银行账户信息")}</h2>
          <p className="mb-8 text-[13px] text-[#8a8a93]">{tx("请您使用本人名下的银行账户")}</p>

          <div className="space-y-6">
            <BankInput label={tx("银行名称")} value={formData.bankName} placeholder={tx("请输入银行名称")} onChange={value => updateField('bankName', value)} />
            <BankInput label={tx("银行账户姓名")} value={formData.accountName} placeholder={tx("请输入账户姓名")} onChange={value => updateField('accountName', value)} />
            <BankInput label={tx("银行账户号码")} value={formData.accountNumber} placeholder={tx("请输入银行账户号码")} mono onChange={value => updateField('accountNumber', value)} />
          </div>

          <div className="mt-8 rounded-2xl border border-[#6c48f5]/20 bg-[#6c48f5]/10 p-4">
            <h3 className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[#8c6bff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6c48f5]" />{tx("温馨提示：")}</h3>
            <p className="text-[12px] leading-relaxed text-[#8a8a93]">{tx("为了您的资金安全，请确保银行卡信息与实名认证信息保持一致，以避免入金失败，以及影响到到账速度")}</p>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent p-5 pt-10">
        <button onClick={handleSubmit} disabled={loading || !isFormValid} className={`h-[52px] w-full rounded-[16px] border text-[16px] font-medium transition-colors ${isFormValid ? 'border-white/10 bg-[#2a2a36] text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:bg-[#3a3a46]' : 'cursor-not-allowed border-white/10 bg-[#1a1a24] text-white/30'}`}>
          {loading ? tx("提交中...") : tx("确认添加")}
        </button>
      </div>
    </div>;
}
function BankInput({
  label,
  value,
  placeholder,
  mono = false,
  onChange
}: {
  label: string;
  value: string;
  placeholder: string;
  mono?: boolean;
  onChange: (value: string) => void;
}) {
  return <div>
      <label className="mb-3 block text-[14px] font-medium text-white/90">{label}</label>
      <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className={`h-[56px] w-full rounded-[16px] border border-white/10 bg-[#14141c] px-4 text-white shadow-sm outline-none transition-colors placeholder:text-[#8a8a93] focus:border-[#6c48f5]/50 ${mono ? 'font-mono' : ''}`} />
    </div>;
}
