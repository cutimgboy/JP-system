import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Landmark, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function DepositPage() {
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
          入金
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h2 className="text-[28px] font-bold tracking-tight mb-2">选择入金银行卡</h2>
          <p className="text-[#8a8a93] text-[14px] mb-8">当前为您账户银行卡：</p>

          <div className="flex flex-col gap-4">
            {/* Bank Card Item */}
            <div 
              onClick={() => navigate('/deposit/fund')}
              className="bg-[#14141c]/80 backdrop-blur-xl border border-white/10 rounded-[20px] p-5 cursor-pointer hover:bg-[#1a1a24] transition-all group relative overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6c48f5]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#6c48f5]/20 transition-all"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a24] border border-white/10 flex items-center justify-center shrink-0">
                    <Landmark size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-semibold text-white mb-2">招商银行</h3>
                    <div className="text-[14px] text-[#8a8a93] space-y-1">
                      <p>账户名称：张三</p>
                      <p className="font-mono">账户号码：**** **** **** 8888</p>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#8a8a93] group-hover:text-white transition-colors" />
              </div>
            </div>

            {/* Bank Card Item 2 */}
            <div 
              onClick={() => navigate('/deposit/fund')}
              className="bg-[#14141c]/80 backdrop-blur-xl border border-white/10 rounded-[20px] p-5 cursor-pointer hover:bg-[#1a1a24] transition-all group relative overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#10b981]/20 transition-all"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a24] border border-white/10 flex items-center justify-center shrink-0">
                    <Landmark size={20} className="text-[#10b981]" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-semibold text-white mb-2">工商银行</h3>
                    <div className="text-[14px] text-[#8a8a93] space-y-1">
                      <p>账户名称：张三</p>
                      <p className="font-mono">账户号码：**** **** **** 1234</p>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#8a8a93] group-hover:text-white transition-colors" />
              </div>
            </div>

            {/* Add New Card Button */}
            <div 
              onClick={() => navigate('/deposit/add-card')}
              className="mt-2 bg-transparent border-[1.5px] border-dashed border-white/20 rounded-[20px] p-5 cursor-pointer hover:bg-white/5 hover:border-white/40 transition-all flex items-center justify-center gap-2 text-[#8a8a93] hover:text-white"
            >
              <PlusCircle size={20} />
              <span className="text-[16px] font-medium tracking-wide">添加银行卡</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
