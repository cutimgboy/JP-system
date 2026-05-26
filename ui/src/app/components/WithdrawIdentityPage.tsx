import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Camera, CheckCircle2, User, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function WithdrawIdentityPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    idNumber: ''
  });
  
  const [images, setImages] = useState({
    idFront: false,
    idBack: false,
    selfie: false
  });
  
  const [currentUploadType, setCurrentUploadType] = useState<keyof typeof images | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleUploadClick = (type: keyof typeof images) => {
    setCurrentUploadType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentUploadType) {
      // Simulate successful upload
      setImages(prev => ({ ...prev, [currentUploadType]: true }));
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isFormValid = formData.name.trim() !== '' && 
                      formData.idNumber.trim() !== '' && 
                      images.idFront && 
                      images.idBack && 
                      images.selfie;

  const handleSubmit = () => {
    if (isFormValid) {
      setShowSuccessModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  const UploadBox = ({ type, label, icon: Icon }: { type: keyof typeof images, label: string, icon: any }) => (
    <div 
      onClick={() => handleUploadClick(type)}
      className={`relative w-full h-[120px] rounded-[16px] border border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
        images[type] 
          ? 'bg-[#6c48f5]/10 border-[#6c48f5]' 
          : 'bg-[#14141c] border-white/20 hover:bg-[#1a1a24] hover:border-white/30'
      }`}
    >
      {images[type] ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#6c48f5]/20 to-transparent" />
          <CheckCircle2 size={32} className="text-[#6c48f5] mb-2 relative z-10" />
          <span className="text-[13px] font-medium text-[#6c48f5] relative z-10">上传成功</span>
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
            <Icon size={20} className="text-[#8a8a93]" />
          </div>
          <span className="text-[13px] text-[#8a8a93]">{label}</span>
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1a1a24] flex items-center justify-center">
            <Camera size={12} className="text-[#8a8a93]" />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="absolute inset-0 bg-[#09090b] flex flex-col text-white z-50">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[60px] shrink-0 border-b border-white/5 relative z-10 bg-[#09090b]/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-medium text-white absolute left-1/2 -translate-x-1/2">
          补充身份信息
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[120px]">
        <div className="mb-6">
          <p className="text-[#8a8a93] text-[14px] leading-relaxed">
            为了保障您的资金安全并符合监管要求，首次大额出金需完成身份信息补充。信息仅用于身份核实。
          </p>
        </div>

        {/* Personal Info */}
        <div className="space-y-4 mb-8">
          <h2 className="text-[16px] font-bold text-white">个人信息</h2>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a93]">
                <User size={18} />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入真实姓名"
                className="w-full h-[52px] bg-[#14141c] border border-white/10 rounded-[14px] pl-12 pr-4 text-[15px] text-white placeholder:text-white/20 outline-none focus:border-[#6c48f5]/50 transition-colors"
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a93]">
                <FileText size={18} />
              </div>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                placeholder="请输入身份证号"
                className="w-full h-[52px] bg-[#14141c] border border-white/10 rounded-[14px] pl-12 pr-4 text-[15px] text-white placeholder:text-white/20 outline-none focus:border-[#6c48f5]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Uploads */}
        <div className="space-y-4">
          <h2 className="text-[16px] font-bold text-white">上传证件照片</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <UploadBox type="idFront" label="身份证正面" icon={FileText} />
            <UploadBox type="idBack" label="身份证反面" icon={FileText} />
          </div>
          
          <div className="mt-4">
            <UploadBox type="selfie" label="手持身份证自拍照" icon={User} />
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pt-10">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`w-full h-[52px] rounded-[16px] font-medium text-[16px] transition-all flex items-center justify-center ${
            isFormValid 
              ? 'bg-[#6c48f5] hover:bg-[#5a3be0] text-white shadow-[0_4px_16px_rgba(108,72,245,0.3)]' 
              : 'bg-[#1a1a24] text-white/30 cursor-not-allowed'
          }`}
        >
          下一步
        </button>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#14141c] w-full max-w-[320px] rounded-[24px] p-8 shadow-2xl border border-white/10 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#6c48f5] to-[#8c6bff]" />
              
              <div className="w-16 h-16 rounded-full bg-[#6c48f5]/20 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-[#6c48f5] opacity-20 blur-xl rounded-full animate-pulse" />
                <Check size={32} className="text-[#6c48f5]" />
              </div>
              
              <h3 className="text-[20px] font-bold text-white mb-2">审核中</h3>
              <p className="text-[#8a8a93] text-[14px] leading-relaxed mb-8">
                您的出金申请及身份信息已提交成功，我们将在1-3个工作日内完成审核并处理您的出金。
              </p>
              
              <button 
                onClick={handleCloseModal}
                className="w-full h-[48px] rounded-[16px] bg-[#6c48f5] text-white font-medium hover:bg-[#5a3be0] transition-colors"
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
