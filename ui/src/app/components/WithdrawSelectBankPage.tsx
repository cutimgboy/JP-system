import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Plus, Landmark, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function WithdrawSelectBankPage() {
  const navigate = useNavigate();
  // Mock banks, same as MyBanksPage but no delete button, and clicking one goes to next step
  const [banks] = useState([
    { id: 1, name: '招商银行', accountName: '张三', last4: '8888', bgColor: 'from-[#ef4444]/20 to-transparent', borderColor: 'border-[#ef4444]/20' },
    { id: 2, name: '建设银行', accountName: '张三', last4: '6666', bgColor: 'from-[#3b82f6]/20 to-transparent', borderColor: 'border-[#3b82f6]/20' }
  ]);

  const handleSelectBank = (bank: any) => {
    navigate('/withdraw/amount', { state: { bank } });
  };

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
          选择出金银行卡
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[100px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-bold tracking-tight">请选择要出金的银行卡</h2>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {banks.map((bank) => (
              <motion.div
                key={bank.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleSelectBank(bank)}
                className={`relative p-5 rounded-[20px] border ${bank.borderColor} bg-gradient-to-br ${bank.bgColor} bg-[#14141c] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform`}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                      <Landmark size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-[16px] font-bold text-white mb-0.5">{bank.name}</div>
                      <div className="text-[12px] text-white/60">持卡人：{bank.accountName}</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-white/40" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-[20px] font-mono font-medium tracking-[0.2em] text-white/90">
                    **** **** **** {bank.last4}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {banks.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-[#8a8a93]">
            <Landmark size={48} className="opacity-20 mb-4" />
            <p className="text-[14px]">暂无银行卡</p>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="absolute bottom-0 w-full p-5 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pt-10">
        <button 
          onClick={() => navigate('/deposit/add-card')}
          className="w-full h-[52px] bg-gradient-to-r from-[#6c48f5] to-[#8c6bff] hover:opacity-90 text-white rounded-[16px] font-medium text-[16px] transition-all shadow-[0_4px_16px_rgba(108,72,245,0.3)] flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          添加银行卡
        </button>
      </div>
    </div>
  );
}
