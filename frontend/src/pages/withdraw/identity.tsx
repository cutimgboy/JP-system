import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Check, CheckCircle2, ChevronLeft, FileText, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { apiClient } from '../../utils/api';
import { Toast } from '../../components/Toast';

type UploadType = 'idFront' | 'idBack' | 'selfie';

export function WithdrawIdentity() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadType, setCurrentUploadType] = useState<UploadType | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
  });
  const [images, setImages] = useState<Record<UploadType, string | null>>({
    idFront: null,
    idBack: null,
    selfie: null,
  });

  const bank = location.state?.bank;
  const amount = location.state?.amount;

  const handleUploadClick = (type: UploadType) => {
    setCurrentUploadType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0] && currentUploadType) {
      const file = event.target.files[0];
      const targetType = currentUploadType;
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => ({ ...prev, [targetType]: String(reader.result || '') }));
      };
      reader.onerror = () => {
        setToast({ message: '图片读取失败，请重新上传', type: 'error' });
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };

  const isFormValid =
    formData.name.trim() !== '' &&
    formData.idNumber.trim() !== '' &&
    images.idFront &&
    images.idBack &&
    images.selfie;

  const handleSubmit = async () => {
    if (!isFormValid) {
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/user/identity', {
        name: formData.name,
        idNumber: formData.idNumber,
        idFrontImage: images.idFront,
        idBackImage: images.idBack,
        selfieImage: images.selfie,
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('提交身份信息失败:', error);
      setToast({ message: '提交失败，请重试', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const UploadBox = ({
    type,
    label,
    icon: Icon,
  }: {
    type: UploadType;
    label: string;
    icon: typeof FileText;
  }) => (
    <button
      type="button"
      onClick={() => handleUploadClick(type)}
      className={`relative flex h-[120px] w-full flex-col items-center justify-center overflow-hidden rounded-[16px] border border-dashed transition-all ${
        images[type]
          ? 'border-[#6c48f5] bg-[#6c48f5]/10'
          : 'border-white/20 bg-[#14141c] hover:border-white/30 hover:bg-[#1a1a24]'
      }`}
    >
      {images[type] ? (
        <>
          <img src={images[type] || ''} alt={label} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#6c48f5] shadow-lg">
            <CheckCircle2 size={16} className="text-white" />
          </div>
          <span className="absolute bottom-2 rounded-full bg-black/60 px-2 py-1 text-[12px] font-medium text-white">
            重新上传
          </span>
        </>
      ) : (
        <>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
            <Icon size={20} className="text-[#8a8a93]" />
          </div>
          <span className="text-[13px] text-[#8a8a93]">{label}</span>
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a24]">
            <Camera size={12} className="text-[#8a8a93]" />
          </div>
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">补充身份信息</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-32 pt-6">
        <div className="mb-6">
          <p className="text-[14px] leading-relaxed text-[#8a8a93]">
            为了保障您的资金安全并符合监管要求，首次大额出金需完成身份信息补充。信息仅用于身份核实。
          </p>
          {bank && amount ? (
            <p className="mt-3 rounded-[16px] border border-[#6c48f5]/10 bg-[#6c48f5]/5 p-3 text-[12px] text-white/60">
              {bank.bankName} 尾号 {String(bank.accountNumber || '').slice(-4)}，金额 {Number(amount).toLocaleString()} VND
            </p>
          ) : null}
        </div>

        <div className="mb-8 space-y-4">
          <h2 className="text-[16px] font-bold text-white">个人信息</h2>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a93]" />
            <input
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="请输入真实姓名"
              className="h-[52px] w-full rounded-[14px] border border-white/10 bg-[#14141c] pl-12 pr-4 text-[15px] text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#6c48f5]/50"
            />
          </div>
          <div className="relative">
            <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a93]" />
            <input
              value={formData.idNumber}
              onChange={(event) => setFormData((prev) => ({ ...prev, idNumber: event.target.value }))}
              placeholder="请输入证件号码"
              className="h-[52px] w-full rounded-[14px] border border-white/10 bg-[#14141c] pl-12 pr-4 text-[15px] text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#6c48f5]/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[16px] font-bold text-white">上传证件照片</h2>
          <div className="grid grid-cols-2 gap-4">
            <UploadBox type="idFront" label="证件正面" icon={FileText} />
            <UploadBox type="idBack" label="证件反面" icon={FileText} />
          </div>
          <UploadBox type="selfie" label="手持证件自拍照" icon={User} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent p-5 pt-10">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || submitting}
          className={`flex h-[52px] w-full items-center justify-center rounded-[16px] text-[16px] font-medium transition-all ${
            isFormValid
              ? 'bg-[#6c48f5] text-white shadow-[0_4px_16px_rgba(108,72,245,0.3)] hover:bg-[#5a3be0]'
              : 'cursor-not-allowed bg-[#1a1a24] text-white/30'
          }`}
        >
          {submitting ? '提交中...' : '提交审核'}
        </button>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative flex w-full max-w-[320px] flex-col items-center overflow-hidden rounded-[24px] border border-white/10 bg-[#14141c] p-8 text-center shadow-2xl"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6c48f5] to-[#8c6bff]" />
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#6c48f5]/20">
                <div className="absolute inset-0 animate-pulse rounded-full bg-[#6c48f5] opacity-20 blur-xl" />
                <Check size={32} className="text-[#6c48f5]" />
              </div>
              <h3 className="mb-2 text-[20px] font-bold text-white">审核中</h3>
              <p className="mb-8 text-[14px] leading-relaxed text-[#8a8a93]">
                您的提取资金申请已提交。我们将在 1-3 个工作日内完成审核并处理。
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/profile');
                }}
                className="h-[48px] w-full rounded-[16px] bg-[#6c48f5] font-medium text-white transition-colors hover:bg-[#5a3be0]"
              >
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
