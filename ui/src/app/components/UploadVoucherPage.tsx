import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Landmark, Image as ImageIcon, Plus, X, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function UploadVoucherPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);

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
          上传转账凭证
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-[120px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
        >
          
          <h2 className="text-[18px] font-bold mb-3">汇款银行</h2>
          <div className="bg-[#14141c]/80 backdrop-blur-xl border border-white/10 rounded-[20px] p-5 mb-8 shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#1a1a24] border border-white/10 flex items-center justify-center shrink-0">
                <Landmark size={20} className="text-white" />
              </div>
              <span className="text-[18px] font-semibold">招商银行</span>
            </div>
            <div className="flex gap-4 text-[14px] text-[#8a8a93] pl-[56px]">
              <span>账户名称：张三</span>
              <span className="font-mono">账户号码：**** 8888</span>
            </div>
          </div>

          <h2 className="text-[18px] font-bold mb-3">存入资金</h2>
          <div className="relative mb-2">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-medium border-r border-white/20 pr-4">VND</div>
            <input 
              type="number" 
              placeholder="请输入存入金额" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-[60px] bg-[#14141c] border border-white/10 rounded-[16px] pl-[92px] pr-4 text-white text-[18px] font-mono placeholder:text-[#8a8a93] placeholder:font-sans focus:outline-none focus:border-[#6c48f5]/50 transition-colors shadow-sm" 
            />
          </div>
          <p className="text-[13px] text-[#8a8a93] mb-10 pl-1">因银行监管需求，最低存入金额为50USD=1,250,000VND</p>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[18px] font-bold">上传转账凭证</h2>
            <button className="text-[14px] text-[#6c48f5] hover:text-[#5a3bd9] transition-colors">查看示例</button>
          </div>
          
          <div className="flex gap-4 mb-10">
            {/* Example uploaded image placeholder */}
            <div className="w-[100px] h-[100px] bg-[#1a1a24] border border-white/10 rounded-[16px] relative flex items-center justify-center shadow-sm group">
              <ImageIcon size={32} className="text-[#8a8a93] opacity-50" />
              <button className="absolute -top-2 -right-2 w-6 h-6 bg-[#2a2a36] border border-white/20 rounded-full flex items-center justify-center hover:bg-[#3a3a46] shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={14} className="text-white" />
              </button>
            </div>
            
            {/* Add more button */}
            <div className="w-[100px] h-[100px] border-[1.5px] border-dashed border-white/20 rounded-[16px] flex items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/40 transition-all">
              <Plus size={32} className="text-[#8a8a93]" />
            </div>
          </div>

          <div className="bg-[#1a1a24]/50 rounded-[20px] p-5 text-[13px] text-[#8a8a93] leading-relaxed space-y-3 border border-white/5">
            <p className="font-semibold text-white/90 mb-2">温馨提示</p>
            <p className="flex items-start gap-2">
              <span className="text-white/60">1.</span>
              因银行监管需求，交易账户最低入金金额为500,000VND，若低于该金额转账，会影响资金到账
            </p>
            <p className="flex items-start gap-2">
              <span className="text-white/60">2.</span>
              若输入的金额与实际转账金额不一致，会影响资金到账速度
            </p>
            <p className="flex items-start gap-2">
              <span className="text-white/60">3.</span>
              在交易日20:00前存入的资金，将会当日存入交易账户，其他时间存入的资金，将会下个交易日存入账户
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Button */}
      <div className="absolute bottom-0 w-full p-5 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pt-10">
        <button 
          onClick={() => setShowModal(true)}
          className="w-full h-[52px] bg-[#2a2a36] hover:bg-[#3a3a46] text-white rounded-[16px] font-medium text-[16px] transition-colors border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
        >
          提交转账凭证
        </button>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-[340px] bg-[#14141c] border border-white/10 rounded-[28px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center text-center"
            >
              {/* Decorative top glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#6c48f5]/20 rounded-full blur-[30px] pointer-events-none"></div>

              <div className="w-[88px] h-[88px] bg-gradient-to-tr from-[#6c48f5] to-[#b084f5] rounded-full flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(108,72,245,0.4)] relative">
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-20"></div>
                <PartyPopper size={44} className="text-white ml-1" />
              </div>
              
              <h3 className="text-[22px] font-bold text-white mb-2 tracking-tight">转账凭证已提交</h3>
              <p className="text-[28px] font-bold text-[#10b981] font-mono mb-8 tracking-tight drop-shadow-[0_2px_10px_rgba(16,185,129,0.2)]">
                {amount ? `${parseFloat(amount).toLocaleString()} VND` : '20,000.00 VND'}
              </p>
              
              <div className="text-left text-[13px] text-[#8a8a93] space-y-3 mb-8 w-full bg-[#1a1a24]/80 p-5 rounded-[20px] border border-white/5">
                <p className="text-white/90 font-semibold mb-1">温馨提示</p>
                <p className="leading-relaxed">1. 预计今天可到账，到账后将通过消息通知您。</p>
                <p className="leading-relaxed">2. 跨银行转账，需要较长时间处理，到账速度取决于银行的处理速度，我们收到资金后将会第一时间去处理。</p>
              </div>
              
              <button 
                onClick={() => {
                  setShowModal(false);
                  navigate('/');
                }}
                className="w-full h-[52px] bg-[#2a2a36] hover:bg-[#3a3a46] text-white rounded-[16px] font-medium text-[16px] transition-colors border border-white/10"
              >
                知道了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}