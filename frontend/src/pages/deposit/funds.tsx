import { ChevronLeft, Landmark } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient, extractData } from '../../utils/api';
import { tx } from "../../i18n/text";
interface BankCard {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string | null;
}
export function DepositFunds() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [systemBankCard, setSystemBankCard] = useState<BankCard | null>(null);
  const [loading, setLoading] = useState(true);

  // 从路由状态获取用户选择的银行卡
  const userBankCard = location.state?.userBankCard as BankCard | undefined;
  useEffect(() => {
    // 如果没有用户银行卡信息，返回上一页
    if (!userBankCard) {
      navigate('/deposit');
      return;
    }
    fetchSystemBankCard();
  }, [userBankCard, navigate]);
  const fetchSystemBankCard = async () => {
    try {
      const response: any = await apiClient.get('/system-bank-card/active');
      console.log(tx("系统银行卡响应:"), response);
      const card = extractData(response);
      if (card) {
        setSystemBankCard(card);
      }
    } catch (error) {
      console.error(tx("获取系统银行卡失败:"), error);
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = (text: string, field: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          setCopiedField(field);
          setTimeout(() => setCopiedField(null), 2000);
        }).catch(() => {
          setCopiedField(field);
          setTimeout(() => setCopiedField(null), 2000);
        });
      } else {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      }
    } catch (error) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
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
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="text-[#8a8a93]">{tx("加载中...")}</div>
      </div>;
  }
  if (!systemBankCard) {
    return <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 text-white">
        <div className="text-center">
          <div className="mb-4 text-[#8a8a93]">{tx("暂无可用的收款银行卡")}</div>
          <button onClick={() => navigate(-1)} className="rounded-[16px] border border-white/10 bg-[#2a2a36] px-6 py-3 text-white transition-colors hover:bg-[#3a3a46]">{tx("返回")}</button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium text-white">{tx("存入资金")}</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-[120px] pt-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4
      }}>
          <h2 className="mb-3 text-[16px] font-medium">{tx("扣款银行")}</h2>
          <div className="relative mb-10 overflow-hidden rounded-[20px] border border-white/10 bg-[#14141c]/80 p-5 shadow-sm backdrop-blur-xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#6c48f5]/10 blur-3xl" />
            <div className="relative z-10 mb-3 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#1a1a24]">
                <Landmark size={20} className="text-white" />
              </div>
              <span className="text-[18px] font-semibold">{userBankCard?.bankName}</span>
            </div>
            <div className="relative z-10 flex items-center gap-4 pl-[56px] text-[14px] text-[#8a8a93]">
              <span>{userBankCard?.accountName}</span>
              <span className="font-mono">{userBankCard && maskAccountNumber(userBankCard.accountNumber)}</span>
            </div>
          </div>

          <h2 className="mb-6 flex items-center gap-2 text-[22px] font-bold">{tx("转账至J.P.银行")}</h2>

          <div className="space-y-6 rounded-[24px] border border-white/5 bg-[#14141c]/30 p-6">
            <TransferField label={tx("收款银行")} value={systemBankCard.bankName} copied={copiedField === 'bank'} onCopy={() => copyToClipboard(systemBankCard.bankName, 'bank')} />
            <TransferField label={tx("收款账号")} value={systemBankCard.accountNumber} copied={copiedField === 'account'} mono onCopy={() => copyToClipboard(systemBankCard.accountNumber, 'account')} />
            <TransferField label={tx("收款人名称")} value={systemBankCard.accountName} copied={copiedField === 'name'} onCopy={() => copyToClipboard(systemBankCard.accountName, 'name')} />
            {systemBankCard.swiftCode && <TransferField label={tx("SWIFT 代码")} value={systemBankCard.swiftCode} copied={copiedField === 'swift'} mono noBorder onCopy={() => copyToClipboard(systemBankCard.swiftCode!, 'swift')} />}
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent p-5 pt-10">
        <button onClick={() => navigate('/deposit/upload', {
        state: {
          userBankCard,
          systemBankCard
        }
      })} className="h-[52px] w-full rounded-[16px] border border-white/10 bg-[#2a2a36] text-[16px] font-medium text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-colors hover:bg-[#3a3a46]">{tx("我已转账，通知J.P.收款")}</button>
      </div>
    </div>;
}
function TransferField({
  label,
  value,
  copied,
  mono = false,
  noBorder = false,
  onCopy
}: {
  label: string;
  value: string;
  copied: boolean;
  mono?: boolean;
  noBorder?: boolean;
  onCopy: () => void;
}) {
  return <div className={`flex items-center justify-between gap-4 ${noBorder ? '' : 'border-b border-white/5 pb-4'}`}>
      <div className="min-w-0">
        <p className="mb-1 text-[13px] text-[#8a8a93]">{label}</p>
        <p className={`truncate text-[16px] font-medium text-white ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
      <button type="button" onClick={onCopy} className="flex h-[32px] shrink-0 items-center justify-center rounded-full border border-white/20 px-4 text-[13px] text-white transition-colors hover:bg-white/10">
        {copied ? tx("已复制") : tx("复制")}
      </button>
    </div>;
}
