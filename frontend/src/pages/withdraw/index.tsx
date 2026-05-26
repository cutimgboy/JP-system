import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Landmark, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import apiClient, { extractData } from '../../utils/api';
import { tx } from "../../i18n/text";
interface BankCard {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string | null;
}
export function Withdraw() {
  const navigate = useNavigate();
  const [bankCards, setBankCards] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
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
    void fetchBankCards();
  }, []);
  const handleSelectBank = (bank: BankCard) => {
    navigate('/withdraw/amount', {
      state: {
        bank
      }
    });
  };
  const getLast4 = (accountNumber: string) => accountNumber.slice(-4).padStart(4, '0');
  return <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button onClick={() => navigate('/profile')} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">{tx("选择出金银行卡")}</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-[120px] pt-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight">{tx("请选择要出金的银行卡")}</h2>
        </div>

        {loading ? <div className="py-16 text-center text-[#8a8a93]">{tx("加载中...")}</div> : bankCards.length === 0 ? <div className="flex flex-col items-center justify-center py-12 text-[#8a8a93]">
            <Landmark size={48} className="mb-4 opacity-20" />
            <p className="text-[14px]">{tx("暂无银行卡")}</p>
          </div> : <div className="space-y-4">
            <AnimatePresence>
              {bankCards.map((bank, index) => {
            const accent = index % 3 === 0 ? 'from-[#ef4444]/20 border-[#ef4444]/20' : index % 3 === 1 ? 'from-[#3b82f6]/20 border-[#3b82f6]/20' : 'from-[#10b981]/20 border-[#10b981]/20';
            return <motion.button key={bank.id} type="button" initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -8
            }} whileTap={{
              scale: 0.98
            }} onClick={() => handleSelectBank(bank)} className={`relative w-full overflow-hidden rounded-[20px] border bg-[#14141c] bg-gradient-to-br ${accent} to-transparent p-5 text-left transition-transform`}>
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                          <Landmark size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="mb-0.5 text-[16px] font-bold text-white">{bank.bankName}</div>
                          <div className="text-[12px] text-white/60">{tx("持卡人：")}{bank.accountName}</div>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-white/40" />
                    </div>

                    <div className="font-mono text-[20px] font-medium tracking-[0.2em] text-white/90">
                      **** **** **** {getLast4(bank.accountNumber)}
                    </div>
                  </motion.button>;
          })}
            </AnimatePresence>
          </div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent p-5 pt-10">
        <button onClick={() => navigate('/my-bank/add')} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#6c48f5] to-[#8c6bff] text-[16px] font-medium text-white shadow-[0_4px_16px_rgba(108,72,245,0.3)] transition-all hover:opacity-90">
          <Plus size={20} />{tx("添加银行卡")}</button>
      </div>
    </div>;
}
