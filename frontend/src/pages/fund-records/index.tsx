import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, History, TrendingDown, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { apiClient, extractData } from '../../utils/api';

interface FundRecord {
  id: number;
  type: 'deposit' | 'withdraw' | 'profit' | 'loss';
  amount: number;
  status: number;
  time: string;
  description: string;
  targetPath?: string;
  targetState?: Record<string, unknown>;
}

type TabKey = 'all' | 'deposit' | 'withdraw' | 'trade';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'deposit', label: '入金' },
  { key: 'withdraw', label: '提现' },
  { key: 'trade', label: '交易' },
];

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
          allRecords.push(
            ...deposits.map((deposit) => ({
              id: deposit.id,
              type: 'deposit' as const,
              amount: Number(deposit.amount || 0),
              status: Number(deposit.status ?? 0),
              time: deposit.createTime || deposit.createdAt,
              description: '银行卡入金',
              targetPath: '/deposit/detail',
              targetState: { depositId: deposit.id },
            })),
          );
        }

        try {
          const tradeResponse = await apiClient.get('/trade/orders', {
            params: { status: 'closed', limit: 100 },
          });
          const trades = extractData<any[]>(tradeResponse);
          if (Array.isArray(trades)) {
            allRecords.push(
              ...trades
                .filter((trade) => trade.status === 'closed')
                .map((trade) => ({
                  id: trade.id,
                  type: Number(trade.profitLoss || 0) >= 0 ? ('profit' as const) : ('loss' as const),
                  amount: Math.abs(Number(trade.profitLoss || 0)),
                  status: 1,
                  time: trade.closeTime || trade.updatedAt || trade.createdAt,
                  description: `${trade.stockName || trade.stockCode} ${trade.tradeType === 'bull' ? '看涨' : '看跌'}`,
                  targetPath: `/positions/order/${trade.id}`,
                })),
            );
          }
        } catch (error) {
          console.error('获取交易记录失败:', error);
        }

        allRecords.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setRecords(allRecords);
      } catch (error) {
        console.error('获取资金记录失败:', error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchRecords();
  }, []);

  const filteredRecords = records.filter((record) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deposit') return record.type === 'deposit';
    if (activeTab === 'withdraw') return record.type === 'withdraw';
    return record.type === 'profit' || record.type === 'loss';
  });

  const getStatusText = (status: number) => {
    if (status === 1) return '已完成';
    if (status === 0) return '审核中';
    if (status === 2) return '已拒绝';
    return '未知';
  };

  const getStatusColor = (status: number) => {
    if (status === 1) return 'text-[#10b981]';
    if (status === 0) return 'text-[#f59e0b]';
    if (status === 2) return 'text-[#ef4444]';
    return 'text-[#8a8a93]';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString)
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(/\//g, '-');
  };

  const handleRecordClick = (record: FundRecord) => {
    if (record.targetPath) {
      navigate(record.targetPath, { state: record.targetState });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md">
        <div className="relative flex h-[60px] items-center justify-center px-4">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[18px] font-medium">资金记录</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-[20px] px-4 py-1.5 text-[13px] font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#6c48f5] text-white shadow-[0_4px_10px_rgba(108,72,245,0.3)]'
                  : 'bg-[#1a1a24] text-[#8a8a93] hover:bg-[#2a2a36] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="py-16 text-center text-[#8a8a93]">加载中...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#8a8a93]">
              <History size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-[14px]">暂无资金记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => {
                const isPositive = record.type === 'deposit' || record.type === 'profit';
                const Icon = isPositive ? TrendingUp : TrendingDown;
                const color = isPositive ? '#10b981' : '#ef4444';

                return (
                  <motion.button
                    key={`${record.type}-${record.id}`}
                    type="button"
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    onClick={() => handleRecordClick(record)}
                    className="w-full rounded-[20px] border border-white/5 bg-[#14141c] p-4 text-left shadow-sm transition-colors hover:border-white/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]" style={{ backgroundColor: `${color}18` }}>
                          <Icon size={20} color={color} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-medium text-white">{record.description}</div>
                          <div className="mt-1 text-[12px] text-[#8a8a93]">{formatDate(record.time)}</div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`font-mono text-[16px] font-bold ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                          {isPositive ? '+' : '-'}{record.amount.toLocaleString()}
                        </div>
                        <div className={`mt-1 text-[12px] ${getStatusColor(record.status)}`}>{getStatusText(record.status)}</div>
                      </div>
                    </div>
                    {record.targetPath ? (
                      <div className="mt-4 flex items-center justify-end gap-1 text-[12px] text-[#8a8a93]">
                        查看详情 <ArrowRight size={13} />
                      </div>
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
