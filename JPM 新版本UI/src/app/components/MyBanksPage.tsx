import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Plus, Trash2, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function MyBanksPage() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState([
    { id: 1, name: '招商银行', accountName: '张三', last4: '8888', bgColor: 'from-[#ef4444]/20 to-transparent', borderColor: 'border-[#ef4444]/20' },
    { id: 2, name: '建设银行', accountName: '张三', last4: '6666', bgColor: 'from-[#3b82f6]/20 to-transparent', borderColor: 'border-[#3b82f6]/20' }
  ]);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = () => {
    if (deleteConfirmId) {
      setBanks(banks.filter(b => b.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
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
          我的银行
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[100px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-bold tracking-tight">已添加的银行卡</h2>
          <span className="text-[#8a8a93] text-[13px]">{banks.length}张</span>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {banks.map((bank) => (
              <motion.div
                key={bank.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
                className={`relative p-5 rounded-[20px] border ${bank.borderColor} bg-gradient-to-br ${bank.bgColor} bg-[#14141c] overflow-hidden`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                      <Landmark size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-[16px] font-bold text-white mb-0.5">{bank.name}</div>
                      <div className="text-[12px] text-white/60">持卡人：{bank.accountName}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDeleteConfirmId(bank.id)}
                    className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors text-white/70 hover:text-[#ef4444]"
                  >
                    <Trash2 size={16} />
                  </button>
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a24] w-full max-w-[320px] rounded-[24px] p-6 shadow-2xl border border-white/10"
            >
              <h3 className="text-[18px] font-bold mb-2 text-center">删除银行卡</h3>
              <p className="text-[#8a8a93] text-[14px] text-center mb-6 leading-relaxed">
                您确定要删除这张银行卡吗？删除后将无法用于资金提取。
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 h-[48px] rounded-[16px] bg-[#2a2a36] text-white font-medium hover:bg-[#3a3a46] transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 h-[48px] rounded-[16px] bg-[#ef4444] text-white font-medium hover:bg-[#ef4444]/90 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}