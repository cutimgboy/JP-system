import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function AddBankCardPage() {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 bg-[#09090b] flex flex-col overflow-hidden text-white z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[60px] shrink-0 border-b border-white/5 relative z-10 bg-[#09090b]/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-medium text-white absolute left-1/2 -translate-x-1/2">
          添加银行卡
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-[100px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-[24px] font-bold tracking-tight mb-2">填写您的银行账户信息</h2>
          <p className="text-[#8a8a93] text-[13px] mb-8">请您使用本人名下的银行账户</p>

          <div className="space-y-6">
            <div>
              <label className="block text-[14px] text-white/90 mb-3 font-medium">银行名称</label>
              <input 
                type="text" 
                placeholder="请输入银行名称" 
                className="w-full h-[56px] bg-[#14141c] border border-white/10 rounded-[16px] px-4 text-white placeholder:text-[#8a8a93] focus:outline-none focus:border-[#6c48f5]/50 transition-colors shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-[14px] text-white/90 mb-3 font-medium">银行账户姓名</label>
              <input 
                type="text" 
                placeholder="请输入账户姓名" 
                className="w-full h-[56px] bg-[#14141c] border border-white/10 rounded-[16px] px-4 text-white placeholder:text-[#8a8a93] focus:outline-none focus:border-[#6c48f5]/50 transition-colors shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-[14px] text-white/90 mb-3 font-medium">银行账户号码</label>
              <input 
                type="text" 
                placeholder="请输入银行账户号码" 
                className="w-full h-[56px] bg-[#14141c] border border-white/10 rounded-[16px] px-4 text-white placeholder:text-[#8a8a93] focus:outline-none focus:border-[#6c48f5]/50 transition-colors font-mono shadow-sm" 
              />
            </div>
          </div>

          <div className="mt-8 p-4 bg-[#6c48f5]/10 border border-[#6c48f5]/20 rounded-2xl">
            <h3 className="text-[#6c48f5] text-[13px] font-medium mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6c48f5]"></span>
              温馨提示：
            </h3>
            <p className="text-[#8a8a93] text-[12px] leading-relaxed">
              为了您的资金安全，请确保银行卡信息与实名认证信息保持一致，以避免入金失败，以及影响到到账速度
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Button */}
      <div className="absolute bottom-0 w-full p-5 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pt-10">
        <button 
          onClick={() => navigate(-1)}
          className="w-full h-[52px] bg-[#2a2a36] hover:bg-[#3a3a46] text-white rounded-[16px] font-medium text-[16px] transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-white/10"
        >
          确认添加
        </button>
      </div>
    </div>
  );
}