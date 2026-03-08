import { ArrowLeft, Battery, Wifi, Signal, TrendingUp, TrendingDown } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../utils/api';

interface FundRecord {
  id: number;
  type: 'deposit' | 'withdraw' | 'profit' | 'loss';
  amount: number;
  status: number; // 0-待审核, 1-已完成, 2-已拒绝
  time: string;
  description: string;
}

export function FundRecords() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'deposit' | 'withdraw' | 'trade'>('all');
  const [records, setRecords] = useState<FundRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const allRecords: FundRecord[] = [];

      // 获取入金记录
      const depositResponse: any = await apiClient.get('/deposit/list');
      let deposits = extractData(depositResponse) || [];
      if (Array.isArray(deposits)) {
        const depositRecords = deposits.map((d: any) => ({
          id: d.id,
          type: 'deposit' as const,
          amount: d.amount,
          status: d.status,
          time: d.createTime,
          description: '银行卡充值',
        }));
        allRecords.push(...depositRecords);
      }

      // 获取交易记录（已平仓的订单）
      try {
        const tradeResponse: any = await apiClient.get('/trade/orders', {
          params: { status: 'closed', limit: 100 }
        });
        let trades = extractData(tradeResponse) || [];
        if (Array.isArray(trades)) {
          const tradeRecords = trades
            .filter((t: any) => t.status === 'closed')
            .map((t: any) => ({
              id: t.id,
              type: t.profitLoss >= 0 ? 'profit' as const : 'loss' as const,
              amount: Math.abs(t.profitLoss),
              status: 1, // 交易记录都是已完成
              time: t.closeTime || t.createdAt,
              description: `${t.stockName || t.stockCode} ${t.tradeType === 'bull' ? '看涨' : '看跌'}`,
            }));
          allRecords.push(...tradeRecords);
        }
      } catch (error) {
        console.error('获取交易记录失败:', error);
      }

      // 按时间倒序排序
      allRecords.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecords(allRecords);
    } catch (error) {
      console.error('获取资金记录失败:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };
  const filteredRecords = records.filter(record => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deposit') return record.type === 'deposit';
    if (activeTab === 'withdraw') return record.type === 'withdraw';
    if (activeTab === 'trade') return record.type === 'profit' || record.type === 'loss';
    return true;
  });

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'text-green-400'; // 已完成
      case 0: return 'text-yellow-400'; // 待审核
      case 2: return 'text-red-400'; // 已拒绝
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return '已完成';
      case 0: return '审核中';
      case 2: return '已拒绝';
      default: return '未知';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\//g, '-');
  };

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'deposit' || type === 'profit' ? '+' : '-';
    return `${sign}${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] pb-16">
      {/* Status Bar */}
      <div className="bg-[#141820] px-4 pt-3 pb-2">
        <div className="flex items-center justify-between text-xs">
          <div className="text-white">12:00</div>
          <div className="flex items-center gap-1 text-white">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="bg-[#141820] px-4 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-center relative">
          <button
            onClick={() => navigate('/profile')}
            className="absolute left-0 w-9 h-9 flex items-center justify-center hover:bg-gray-700/30 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-white text-base font-medium">资金记录</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1a1f2e] px-4 py-4 sticky top-0 z-10">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-4 text-sm whitespace-nowrap transition-all rounded-full ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`py-2 px-4 text-sm whitespace-nowrap transition-all rounded-full ${
              activeTab === 'deposit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            充值
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`py-2 px-4 text-sm whitespace-nowrap transition-all rounded-full ${
              activeTab === 'withdraw'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            提现
          </button>
          <button
            onClick={() => setActiveTab('trade')}
            className={`py-2 px-4 text-sm whitespace-nowrap transition-all rounded-full ${
              activeTab === 'trade'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            交易
          </button>
        </div>
      </div>

      {/* Records List */}
      <div className="px-4 pb-24 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">暂无记录</div>
        ) : (
          filteredRecords.map((record) => (
            <div
              key={`${record.type}-${record.id}`}
              className="bg-[#1f2633] rounded-xl border border-gray-700/50 p-4 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    record.type === 'deposit' ? 'bg-blue-500/10' :
                    record.type === 'withdraw' ? 'bg-teal-500/10' :
                    record.type === 'profit' ? 'bg-green-500/10' :
                    'bg-red-500/10'
                  }`}>
                    {(record.type === 'profit' || record.type === 'deposit') && (
                      <TrendingUp className={`w-5 h-5 ${
                        record.type === 'profit' ? 'text-green-400' : 'text-blue-400'
                      }`} />
                    )}
                    {(record.type === 'loss' || record.type === 'withdraw') && (
                      <TrendingDown className={`w-5 h-5 ${
                        record.type === 'loss' ? 'text-red-400' : 'text-teal-400'
                      }`} />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">{record.description}</div>
                    <div className="text-gray-400 text-xs">{formatDate(record.time)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium mb-1 ${
                    record.type === 'deposit' || record.type === 'profit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatAmount(record.amount, record.type)} VND
                  </div>
                  <div className={`text-xs ${getStatusColor(record.status)}`}>
                    {getStatusText(record.status)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
