import { Clock } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { AccountHeader } from '../../components/AccountHeader';
import { Toast } from '../../components/Toast';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
import apiClient from '../../utils/api';

interface Position {
  id: number;
  stockCode: string;
  stockName: string;
  tradeType: 'bull' | 'bear';
  investmentAmount: number;
  openPrice: number;
  openTime: string;
  expectedCloseTime: string;
  profitRate: number;
  status: string;
}

interface HistoryRecord {
  id: number;
  stockCode: string;
  stockName: string;
  tradeType: 'bull' | 'bear';
  investmentAmount: number;
  openPrice: number;
  closePrice: number;
  profitLoss: number;
  result: 'win' | 'loss' | 'draw';
  closeTime: string;
}

export default function PositionsPage() {
  const navigate = useNavigate();
  const { accountType, setAccountType } = useAccount();
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  const [positions, setPositions] = useState<Position[]>([]);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayProfitLoss, setTodayProfitLoss] = useState(0);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [rewardActive, setRewardActive] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [claiming, setClaiming] = useState(false);

  // 获取持仓订单
  const fetchPositions = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await apiClient.get('/trade/orders/open', {
        params: { accountType }
      });
      const ordersData = response.data.data || response.data || [];
      setPositions(ordersData);
    } catch (error) {
      console.error('获取持仓失败:', error);
      setPositions([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 获取历史订单
  const fetchHistory = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await apiClient.get('/trade/orders', {
        params: {
          status: 'closed',
          limit: 50,
          accountType
        }
      });
      const ordersData = response.data.data || response.data || [];
      setHistoryRecords(ordersData);
    } catch (error) {
      console.error('获取历史记录失败:', error);
      setHistoryRecords([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 获取交易统计
  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/trade/stats', {
        params: { accountType }
      });
      const statsData = response.data.data || response.data;
      setTodayProfitLoss(statsData.todayProfitLoss || 0);
    } catch (error) {
      console.error('获取统计失败:', error);
    }
  };

  // 获取奖励金额
  const fetchReward = async () => {
    try {
      const response = await apiClient.get('/reward/amount', {
        params: { accountType }
      });
      const rewardData = response.data.data || response.data;
      setRewardAmount(rewardData.rewardAmount || 0);
      setRewardActive(rewardData.isActive || 0);
    } catch (error) {
      console.error('获取奖励失败:', error);
    }
  };

  // 领取奖励
  const handleClaimReward = async () => {
    if (claiming) return;

    setClaiming(true);
    try {
      const response = await apiClient.post('/reward/claim', {
        accountType
      });

      const actualData = response.data.data || response.data;
      if (actualData.code === 0 || response.data.code === 0) {
        setToast({ message: '领取成功！奖励已发放到您的账户', type: 'success' });
        // 延迟刷新数据，避免影响Toast显示
        setTimeout(() => {
          fetchReward();
          fetchStats();
        }, 3500);
      } else {
        setToast({ message: actualData.msg || response.data.msg || '领取失败', type: 'error' });
      }
    } catch (error: any) {
      console.error('领取奖励失败:', error);
      const errorMsg = error.response?.data?.msg || '领取失败，请稍后重试';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setClaiming(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchStats();
    fetchReward();
    fetchPositions();
    fetchHistory();

    // 每5秒刷新一次数据
    const interval = setInterval(() => {
      fetchStats();
      fetchReward();
      // 根据当前 tab 刷新对应数据，不显示 loading
      if (activeTab === 'positions') {
        fetchPositions(false);
      } else {
        fetchHistory(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab, accountType]); // 添加 accountType 依赖

  // 切换 tab 时刷新数据
  useEffect(() => {
    if (activeTab === 'positions') {
      fetchPositions();
    } else {
      fetchHistory();
    }
  }, [activeTab]);

  // 计算剩余时间
  const calculateCountdown = (expectedCloseTime: string) => {
    const now = new Date().getTime();
    const closeTime = new Date(expectedCloseTime).getTime();
    const diff = Math.max(0, closeTime - now);

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // 实时更新倒计时
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1f2e] pb-16">
      {/* Header */}
      <AccountHeader
        accountType={accountType}
        onAccountSwitch={setAccountType}
      />

      {/* Banner */}
      <div className="px-4 pt-3 pb-2">
        <div className="bg-[#1f2633] rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1.5">今日盈亏</div>
              <div className={`text-lg font-medium ${todayProfitLoss >= 0 ? 'text-teal-400' : 'text-red-500'}`}>
                {todayProfitLoss >= 0 ? '+' : ''}{todayProfitLoss.toLocaleString()} VND
              </div>
            </div>
            {rewardActive === 1 && rewardAmount > 0 && (
              <div>
                <div className="text-sm text-gray-400 mb-1.5">赠送奖励</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-white font-medium">{rewardAmount.toLocaleString()} VND</span>
                  <button
                    onClick={handleClaimReward}
                    disabled={claiming}
                    className="!text-blue-400 text-sm hover:!text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {claiming ? '领取中...' : '立即领取'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1a1f2e] px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveTab('positions')}
            className={`py-3 text-sm whitespace-nowrap transition-all rounded-full ${
              activeTab === 'positions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            持仓({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 text-sm whitespace-nowrap transition-all rounded-full ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            历史
          </button>
        </div>
      </div>

      {/* Positions List */}
      {activeTab === 'positions' && (
        <div className="px-4 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400">加载中...</div>
          ) : positions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">暂无持仓</div>
          ) : (
            positions.map((position) => (
              <div
                key={position.id}
                className="bg-[#1f2633] rounded-xl p-4 shadow-sm border border-gray-700/50 cursor-pointer hover:bg-[#252b3a] transition-colors active:scale-[0.98]"
                onClick={() => navigate(`/trading?stock=${position.stockCode}&orderId=${position.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-700/50 rounded-full flex items-center justify-center text-[10px] text-gray-400">
                      {position.stockCode.charAt(0)}
                    </div>
                    <span className="text-sm text-white">{position.stockCode}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-orange-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{calculateCountdown(position.expectedCloseTime)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white">@{Number(position.openPrice).toFixed(2)}</span>
                    {position.tradeType === 'bull' ? (
                      <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    )}
                    <span className="text-gray-500">—</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-white">{Number(position.investmentAmount).toLocaleString()} VND</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      position.tradeType === 'bull'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {position.tradeType === 'bull' ? '看涨' : '看跌'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* History Records List */}
      {activeTab === 'history' && (
        <div className="px-4 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400">加载中...</div>
          ) : historyRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-400">暂无历史记录</div>
          ) : (
            historyRecords.map((record) => (
              <div
                key={record.id}
                className="bg-[#1f2633] rounded-xl p-4 shadow-sm border border-gray-700/50 cursor-pointer hover:bg-[#252b3a] transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-700/50 rounded-full flex items-center justify-center text-[10px] text-gray-400">
                      {record.stockCode.charAt(0)}
                    </div>
                    <span className="text-sm text-white">{record.stockCode}</span>
                  </div>

                  <span className={`text-sm font-medium ${
                    record.profitLoss >= 0 ? 'text-teal-400' : 'text-red-400'
                  }`}>
                    {record.profitLoss >= 0 ? '+' : ''}{record.profitLoss.toLocaleString()} VND
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <span>@{Number(record.openPrice).toFixed(2)}</span>
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="5 12 19 12"></polyline>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                    <span>{Number(record.closePrice).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm">{Number(record.investmentAmount).toLocaleString()} VND</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      record.tradeType === 'bull'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {record.tradeType === 'bull' ? '看涨' : '看跌'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <BottomNav />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
