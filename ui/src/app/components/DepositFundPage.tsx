import { useNavigate } from 'react-router';
import { ChevronLeft, Landmark } from 'lucide-react';
import { motion } from 'motion/react';

export function DepositFundPage() {
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
          存入资金
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
          
          <h2 className="text-[16px] font-medium mb-3">扣款银行</h2>
          <div className="bg-[#14141c]/80 backdrop-blur-xl border border-white/10 rounded-[20px] p-5 mb-10 shadow-sm relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6c48f5]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#1a1a24] border border-white/10 flex items-center justify-center shrink-0">
                <Landmark size={20} className="text-white" />
              </div>
              <span className="text-[18px] font-semibold">招商银行</span>
            </div>
            <div className="flex gap-4 text-[14px] text-[#8a8a93] relative z-10 pl-[56px] items-center">
              <span>张三</span>
              <span className="font-mono">**** 8888</span>
            </div>
          </div>

          <h2 className="text-[22px] font-bold mb-6 flex items-center gap-2">
            转账至J.P.银行
          </h2>
          
          <div className="space-y-6 bg-[#14141c]/30 rounded-[24px] p-6 border border-white/5">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <p className="text-[13px] text-[#8a8a93] mb-1">收款银行</p>
                <p className="text-[16px] font-medium">JPMorgan Chase Bank</p>
              </div>
              <button className="h-[32px] px-4 rounded-full border border-white/20 text-[13px] hover:bg-white/10 transition-colors flex items-center justify-center">
                复制
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <p className="text-[13px] text-[#8a8a93] mb-1">收款账号</p>
                <p className="text-[16px] font-medium font-mono">8888 8888 8888</p>
              </div>
              <button className="h-[32px] px-4 rounded-full border border-white/20 text-[13px] hover:bg-white/10 transition-colors flex items-center justify-center">
                复制
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <p className="text-[13px] text-[#8a8a93] mb-1">收款人名称</p>
                <p className="text-[16px] font-medium">J.P. HOLDINGS LTD</p>
              </div>
              <button className="h-[32px] px-4 rounded-full border border-white/20 text-[13px] hover:bg-white/10 transition-colors flex items-center justify-center">
                复制
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-[13px] text-[#8a8a93] mb-1">SWIFT 代码</p>
                <p className="text-[16px] font-medium font-mono">CHASUS33</p>
              </div>
              <button className="h-[32px] px-4 rounded-full border border-white/20 text-[13px] hover:bg-white/10 transition-colors flex items-center justify-center">
                复制
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Button */}
      <div className="absolute bottom-0 w-full p-5 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pt-10">
        <button 
          onClick={() => navigate('/deposit/upload-voucher')}
          className="w-full h-[52px] bg-[#2a2a36] hover:bg-[#3a3a46] text-white rounded-[16px] font-medium text-[16px] transition-colors border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
        >
          我已转账，通知J.P.收款
        </button>
      </div>
    </div>
  );
}