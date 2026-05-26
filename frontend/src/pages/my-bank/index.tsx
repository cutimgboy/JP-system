import { useEffect, useState } from 'react';
import { ChevronLeft, Landmark, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toast } from '../../components/Toast';
import { apiClient, extractData } from '../../utils/api';
import { tx } from "../../i18n/text";
interface BankCard {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string | null;
  status: number;
}
export function MyBank() {
  const navigate = useNavigate();
  const [bankCards, setBankCards] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const fetchBankCards = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/bank-card/list');
      const cards = extractData<BankCard[]>(response);
      setBankCards(Array.isArray(cards) ? cards : []);
    } catch (error) {
      console.error(tx("获取银行卡列表失败:"), error);
      setBankCards([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void fetchBankCards();
  }, []);
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await apiClient.delete(`/bank-card/${deleteConfirm}`);
      setToast({
        message: tx("删除成功"),
        type: 'success'
      });
      setDeleteConfirm(null);
      void fetchBankCards();
    } catch (error) {
      console.error(tx("删除银行卡失败:"), error);
      setToast({
        message: tx("删除失败，请重试"),
        type: 'error'
      });
    }
  };
  const getLast4 = (accountNumber: string) => accountNumber.slice(-4).padStart(4, '0');
  return <div className="min-h-screen bg-[#09090b] text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">{tx("我的银行")}</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-[120px] pt-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight">{tx("已添加的银行卡")}</h2>
          <span className="text-[13px] text-[#8a8a93]">{bankCards.length}{tx("张")}</span>
        </div>

        {loading ? <div className="py-16 text-center text-[#8a8a93]">{tx("加载中...")}</div> : bankCards.length === 0 ? <div className="flex flex-col items-center justify-center py-12 text-[#8a8a93]">
            <Landmark size={48} className="mb-4 opacity-20" />
            <p className="text-[14px]">{tx("暂无银行卡")}</p>
          </div> : <div className="space-y-4">
            <AnimatePresence>
              {bankCards.map((bank, index) => {
            const accent = index % 3 === 0 ? 'from-[#ef4444]/20 border-[#ef4444]/20' : index % 3 === 1 ? 'from-[#3b82f6]/20 border-[#3b82f6]/20' : 'from-[#10b981]/20 border-[#10b981]/20';
            return <motion.div key={bank.id} layout initial={{
              opacity: 0,
              scale: 0.96
            }} animate={{
              opacity: 1,
              scale: 1
            }} exit={{
              opacity: 0,
              height: 0,
              marginTop: 0,
              marginBottom: 0,
              overflow: 'hidden'
            }} className={`relative overflow-hidden rounded-[20px] border bg-[#14141c] bg-gradient-to-br ${accent} to-transparent p-5`}>
                    <div className="mb-6 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                          <Landmark size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="mb-0.5 text-[16px] font-bold text-white">{bank.bankName}</div>
                          <div className="text-[12px] text-white/60">{tx("持卡人：")}{bank.accountName}</div>
                        </div>
                      </div>
                      <button onClick={() => setDeleteConfirm(bank.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/70 transition-colors hover:bg-black/40 hover:text-[#ef4444]">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="font-mono text-[20px] font-medium tracking-[0.2em] text-white/90">
                      **** **** **** {getLast4(bank.accountNumber)}
                    </div>
                  </motion.div>;
          })}
            </AnimatePresence>
          </div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent p-5 pt-10">
        <button onClick={() => navigate('/my-bank/add')} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#6c48f5] to-[#8c6bff] text-[16px] font-medium text-white shadow-[0_4px_16px_rgba(108,72,245,0.3)] transition-all hover:opacity-90">
          <Plus size={20} />{tx("添加银行卡")}</button>
      </div>

      <AnimatePresence>
        {deleteConfirm && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <motion.div initial={{
          scale: 0.92,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} exit={{
          scale: 0.92,
          opacity: 0
        }} className="w-full max-w-[320px] rounded-[24px] border border-white/10 bg-[#1a1a24] p-6 shadow-2xl">
              <h3 className="mb-2 text-center text-[18px] font-bold">{tx("删除银行卡")}</h3>
              <p className="mb-6 text-center text-[14px] leading-relaxed text-[#8a8a93]">{tx("您确定要删除这张银行卡吗？删除后将无法用于资金提取。")}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="h-[48px] flex-1 rounded-[16px] bg-[#2a2a36] font-medium text-white transition-colors hover:bg-[#3a3a46]">{tx("取消")}</button>
                <button onClick={handleDelete} className="h-[48px] flex-1 rounded-[16px] bg-[#ef4444] font-medium text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] transition-colors hover:bg-[#dc2626]">{tx("确认删除")}</button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
