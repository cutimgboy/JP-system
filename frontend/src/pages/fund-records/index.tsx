import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, History, TrendingDown, TrendingUp, Upload, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { apiClient, extractData } from '../../utils/api';
import { getLocale, tx } from "../../i18n/text";
import { formatVndAmount } from '../../utils/currency';
import { goBackOrNavigate } from '../../utils/navigation';
interface FundRecord {
  id: number;
  type: 'deposit' | 'withdraw' | 'profit' | 'loss';
  amount: number;
  status: number;
  time: string;
  description: string;
  tradeType?: 'bull' | 'bear';
  profitLoss?: number;
  targetPath?: string;
  targetState?: Record<string, unknown>;
}
type TabKey = 'all' | 'deposit' | 'withdraw' | 'trade';
const tabs: Array<{
  key: TabKey;
  labelKey: string;
}> = [{
  key: 'all',
  labelKey: "全部"
}, {
  key: 'deposit',
  labelKey: "入金"
}, {
  key: 'withdraw',
  labelKey: "提现"
}, {
  key: 'trade',
  labelKey: "交易"
}];
export function FundRecords() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [records, setRecords] = useState<FundRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const allRecords: FundRecord[] = [];
        const depositResponse = await apiClient.get('/deposit/list');
        const deposits = extractData<any[]>(depositResponse);
        if (Array.isArray(deposits)) {
          allRecords.push(...deposits.map(deposit => ({
            id: deposit.id,
            type: 'deposit' as const,
            amount: Number(deposit.amount || 0),
            status: Number(deposit.status ?? 0),
            time: deposit.createTime || deposit.createdAt,
            description: tx("银行卡入金"),
            targetPath: '/deposit/detail',
            targetState: {
              depositId: deposit.id
            }
          })));
        }
        try {
          const tradeResponse = await apiClient.get('/trade/orders', {
            params: {
              status: 'closed',
              limit: 100
            }
          });
          const trades = extractData<any[]>(tradeResponse);
          if (Array.isArray(trades)) {
            allRecords.push(...trades.filter(trade => trade.status === 'closed').map(trade => ({
              id: trade.id,
              type: Number(trade.profitLoss || 0) >= 0 ? 'profit' as const : 'loss' as const,
              amount: Math.abs(Number(trade.investmentAmount || trade.amount || 0)),
              profitLoss: Number(trade.profitLoss || 0),
              status: 1,
              time: trade.closeTime || trade.updatedAt || trade.createdAt,
              description: trade.stockName || trade.stockCode,
              tradeType: trade.tradeType,
              targetPath: `/positions/order/${trade.id}`
            })));
          }
        } catch (error) {
          console.error(tx("获取交易记录失败:"), error);
        }
        allRecords.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setRecords(allRecords);
      } catch (error) {
        console.error(tx("获取资金记录失败:"), error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchRecords();
  }, []);
  const filteredRecords = records.filter(record => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deposit') return record.type === 'deposit';
    if (activeTab === 'withdraw') return record.type === 'withdraw';
    return record.type === 'profit' || record.type === 'loss';
  });
  const getStatusDisplay = (record: FundRecord) => {
    if (record.type === 'profit' || record.type === 'loss') {
      return <span className="flex items-center gap-1 text-[#8a8a93]"><CheckCircle2 size={12} />{tx("已结算")}</span>;
    }
    if (record.status === 1) {
      return <span className="flex items-center gap-1 text-[#10b981]"><CheckCircle2 size={12} />{tx("成功")}</span>;
    }
    if (record.status === 0) {
      return <span className="flex items-center gap-1 text-[#f59e0b]"><Clock size={12} />{tx("处理中")}</span>;
    }
    if (record.status === 2) {
      return <span className="flex items-center gap-1 text-[#ef4444]"><XCircle size={12} />{tx("失败")}</span>;
    }
    return <span className="flex items-center gap-1 text-[#8a8a93]"><Clock size={12} />{tx("未知")}</span>;
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString(getLocale(), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  };
  const handleRecordClick = (record: FundRecord) => {
    if (record.targetPath) {
      navigate(record.targetPath, {
        state: record.targetState
      });
    }
  };
  return <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button onClick={() => goBackOrNavigate(navigate, '/profile')} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">{tx("资金记录")}</h1>
        <div className="w-10" />
      </div>

      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-white/5 px-4 py-3">
          {tabs.map(tab => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`h-[32px] shrink-0 rounded-full px-4 text-[13px] font-medium transition-all ${activeTab === tab.key ? 'bg-[#6c48f5] text-white shadow-[0_2px_8px_rgba(108,72,245,0.3)]' : 'border border-white/5 bg-[#14141c] text-[#8a8a93] hover:bg-white/5 hover:text-white'}`}>
              {tx(tab.labelKey)}
            </button>)}
      </div>

      <div className="space-y-3 px-4 py-4">
        <AnimatePresence mode="popLayout">
          {loading ? <div className="py-16 text-center text-[#8a8a93]">{tx("加载中...")}</div> : filteredRecords.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-[#8a8a93]">
              <History size={48} className="mb-4 opacity-20" />
              <p className="text-[14px]">{tx("暂无相关记录")}</p>
            </div> : filteredRecords.map(record => {
          const isTrade = record.type === 'profit' || record.type === 'loss';
          const isPositive = record.type === 'deposit' || record.type === 'profit';
          const Icon = record.type === 'deposit' ? Download : record.type === 'withdraw' ? Upload : isPositive ? TrendingUp : TrendingDown;
          const iconClass = record.type === 'deposit' ? 'bg-[#10b981]/10 text-[#10b981]' : record.type === 'withdraw' ? 'bg-[#ef4444]/10 text-[#ef4444]' : isPositive ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]';
          const amountText = isTrade
            ? formatVndAmount(record.profitLoss || 0, { signed: true })
            : formatVndAmount(isPositive ? record.amount : -record.amount, { signed: true });
          const amountClass = isTrade ? Number(record.profitLoss || 0) >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]' : isPositive ? 'text-[#10b981]' : 'text-white';
          return <motion.button key={`${record.type}-${record.id}`} type="button" layout initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            scale: 0.95
          }} transition={{
            duration: 0.2
          }} onClick={() => handleRecordClick(record)} className="group flex w-full items-center gap-3 overflow-hidden rounded-[16px] border border-white/5 bg-[#14141c] p-4 text-left transition-colors hover:bg-[#1a1a24]">
                  <div className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${iconClass}`}>
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-1.5 truncate text-[15px] font-medium text-white/90">
                        <span className="truncate">{record.description}</span>
                        {isTrade && <span className={`shrink-0 rounded-[4px] px-1.5 py-0.5 text-[10px] font-medium ${record.tradeType === 'bull' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>{tx("买")}{record.tradeType === 'bull' ? tx("涨") : tx("跌")}
                          </span>}
                      </span>
                      <span className={`shrink-0 font-mono text-[15px] font-bold ${amountClass}`}>
                        {amountText}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[12px] text-[#8a8a93]">{formatDate(record.time)}</span>
                      <div className="flex items-center gap-2 text-[12px]">
                        {getStatusDisplay(record)}
                        <ChevronRight size={14} className="text-[#8a8a93] opacity-50 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  </div>
                </motion.button>;
        })}
        </AnimatePresence>
      </div>
    </div>;
}
