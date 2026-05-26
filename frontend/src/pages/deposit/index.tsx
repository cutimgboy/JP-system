import { ChevronLeft, ChevronRight, Landmark, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient, extractData } from '../../utils/api';
import { Toast } from '../../components/Toast';
import { tx } from "../../i18n/text";
interface BankCard {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string | null;
}
export function Deposit() {
  const navigate = useNavigate();
  const [bankCards, setBankCards] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  useEffect(() => {
    fetchBankCards();
  }, []);
  const fetchBankCards = async () => {
    try {
      const response: any = await apiClient.get('/bank-card/list');
      console.log(tx("银行卡列表响应:"), response);
      let cards = extractData(response) || [];
      if (!Array.isArray(cards)) {
        console.warn(tx("银行卡列表不是数组,使用空数组"));
        cards = [];
      }
      setBankCards(cards);
    } catch (error) {
      console.error(tx("获取银行卡列表失败:"), error);
    } finally {
      setLoading(false);
    }
  };
  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 8) {
      return accountNumber;
    }
    const start = accountNumber.slice(0, 4);
    const end = accountNumber.slice(-4);
    return `${start} **** ${end}`;
  };
  const handleBankCardClick = (card: BankCard) => {
    navigate('/deposit/funds', {
      state: {
        userBankCard: card
      }
    });
  };
  return <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium text-white">{tx("入金")}</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-10 pt-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4,
        ease: 'easeOut'
      }}>
          <h2 className="mb-2 text-[28px] font-bold tracking-tight">{tx("选择入金银行卡")}</h2>
          <p className="mb-8 text-[14px] text-[#8a8a93]">{tx("当前为您账户银行卡：")}</p>

          <div className="flex flex-col gap-4">
            {loading ? <div className="rounded-[20px] border border-white/10 bg-[#14141c]/80 p-8 text-center text-[#8a8a93]">{tx("加载中...")}</div> : bankCards.length === 0 ? <div className="rounded-[20px] border border-dashed border-white/10 bg-[#14141c]/80 px-6 py-10 text-center text-[#8a8a93]">
                <Landmark size={48} className="mx-auto mb-4 text-white/20" />
                <p className="text-[15px] font-medium text-white">{tx("还没有添加银行卡")}</p>
                <p className="mt-2 text-[13px]">{tx("请先添加本人名下银行卡")}</p>
              </div> : bankCards.map((card, index) => <button key={card.id} type="button" onClick={() => handleBankCardClick(card)} className="group relative w-full overflow-hidden rounded-[20px] border border-white/10 bg-[#14141c]/80 p-5 text-left backdrop-blur-xl transition-all hover:bg-[#1a1a24]">
                  <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all ${index % 2 === 0 ? 'bg-[#6c48f5]/10 group-hover:bg-[#6c48f5]/20' : 'bg-[#10b981]/10 group-hover:bg-[#10b981]/20'}`} />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#1a1a24]">
                        <Landmark size={20} className={index % 2 === 0 ? 'text-white' : 'text-[#10b981]'} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="mb-2 truncate text-[18px] font-semibold text-white">{card.bankName}</h3>
                        <div className="space-y-1 text-[14px] text-[#8a8a93]">
                          <p>{tx("账户名称：")}{card.accountName}</p>
                          <p className="font-mono">{tx("账户号码：")}{maskAccountNumber(card.accountNumber)}</p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="shrink-0 text-[#8a8a93] transition-colors group-hover:text-white" />
                  </div>
                </button>)}

            <button type="button" onClick={() => navigate('/my-bank/add')} className="mt-2 flex items-center justify-center gap-2 rounded-[20px] border-[1.5px] border-dashed border-white/20 bg-transparent p-5 text-[#8a8a93] transition-all hover:border-white/40 hover:bg-white/5 hover:text-white">
              <PlusCircle size={20} />
              <span className="text-[16px] font-medium tracking-wide">{tx("添加银行卡")}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>;
}
