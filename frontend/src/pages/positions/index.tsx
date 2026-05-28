import { Clock, ArrowRight, History, ChevronDown, CheckCircle2 } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { Toast } from '../../components/Toast';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
import { useTradeColors } from '../../contexts/TradeColorContext';
import apiClient, { extractData, extractMessage, isSuccessResponse } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { tx } from "../../i18n/text";
import { getFallbackProductInfo, getLocalizedProductName } from '../trading/productInfo';
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
  openTime?: string;
  closeTime: string;
}
interface BalanceSummary {
  balance: number;
  frozenBalance: number;
  availableBalance: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
}
interface DashboardSummary {
  stats: {
    totalOrders: number;
    openOrders: number;
    closedOrders: number;
    winOrders: number;
    lossOrders: number;
    winRate: number;
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
    todayProfitLoss: number;
  };
  balances: {
    current: BalanceSummary;
    demo: BalanceSummary;
    real: BalanceSummary;
  };
  reward: {
    rewardAmount: number;
    isActive: number;
  };
  openOrders: Position[];
  historyOrders: HistoryRecord[];
  serverTime: string;
}

type PositionTab = 'all' | 'today' | 'trading' | 'profit' | 'loss';
type OrderListItem = (Position & {
  type: 'trading';
}) | (HistoryRecord & {
  type: 'history';
});

const positionTabs: Array<{ key: PositionTab; labelKey: string }> = [
  { key: 'all', labelKey: '全部' },
  { key: 'today', labelKey: '今日' },
  { key: 'trading', labelKey: '交易中' },
  { key: 'profit', labelKey: '盈利' },
  { key: 'loss', labelKey: '亏损' },
];

export default function PositionsPage() {
  const navigate = useNavigate();
  const {
    accountType,
    setAccountType
  } = useAccount();
  const {
    getProfitTone,
    getTradeTone,
    getToneTextClass
  } = useTradeColors();
  const [activeTab, setActiveTab] = useState<PositionTab>('all');
  const [positions, setPositions] = useState<Position[]>([]);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayProfitLoss, setTodayProfitLoss] = useState(0);
  const [todayTradeCount, setTodayTradeCount] = useState(0);
  const [todayWinRate, setTodayWinRate] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [demoBalance, setDemoBalance] = useState(0);
  const [realBalance, setRealBalance] = useState(0);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [rewardActive, setRewardActive] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isToday = (dateString?: string, referenceDate = new Date()) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return false;
    return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth() && date.getDate() === referenceDate.getDate();
  };
  const isTodayOrder = (order: OrderListItem, referenceDate = new Date()) => {
    if (order.type === 'trading') {
      return isToday(order.openTime, referenceDate);
    }
    return isToday(order.closeTime, referenceDate) || isToday(order.openTime, referenceDate);
  };
  const getTodayStats = (dashboardData: DashboardSummary) => {
    const serverDate = dashboardData.serverTime ? new Date(dashboardData.serverTime) : new Date();
    const openOrders = Array.isArray(dashboardData.openOrders) ? dashboardData.openOrders : [];
    const historyOrders = Array.isArray(dashboardData.historyOrders) ? dashboardData.historyOrders : [];
    const todayOpenOrders = openOrders.filter(order => isToday(order.openTime, serverDate));
    const todayHistoryOrders = historyOrders.filter(order => isToday(order.closeTime, serverDate) || isToday(order.openTime, serverDate));
    const todayClosedOrders = todayHistoryOrders.filter(order => order.result === 'win' || order.result === 'loss' || order.result === 'draw');
    const todayWins = todayClosedOrders.filter(order => order.result === 'win' || Number(order.profitLoss) > 0).length;
    const todayTradeCount = todayOpenOrders.length + todayHistoryOrders.length;
    const todayWinRate = todayClosedOrders.length > 0 ? todayWins / todayClosedOrders.length * 100 : 0;
    return {
      todayTradeCount,
      todayWinRate
    };
  };
  const applyDashboardData = (dashboardData: DashboardSummary) => {
    const todayStats = getTodayStats(dashboardData);
    setPositions(Array.isArray(dashboardData.openOrders) ? dashboardData.openOrders : []);
    setHistoryRecords(Array.isArray(dashboardData.historyOrders) ? dashboardData.historyOrders : []);
    setTodayProfitLoss(Number(dashboardData.stats?.todayProfitLoss || 0));
    setTodayTradeCount(todayStats.todayTradeCount);
    setTodayWinRate(todayStats.todayWinRate);
    setAvailableBalance(Number(dashboardData.balances?.current?.availableBalance || 0));
    setDemoBalance(Number(dashboardData.balances?.demo?.availableBalance || 0));
    setRealBalance(Number(dashboardData.balances?.real?.availableBalance || 0));
    setRewardAmount(Number(dashboardData.reward?.rewardAmount || 0));
    setRewardActive(Number(dashboardData.reward?.isActive || 0));
  };
  const fetchDashboard = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await apiClient.get('/trade/dashboard', {
        params: {
          accountType
        }
      });
      const dashboardData = extractData(response) as DashboardSummary | null;
      if (!dashboardData) {
        setPositions([]);
        setHistoryRecords([]);
        return;
      }
      applyDashboardData(dashboardData);
    } catch (error) {
      console.error(tx("获取持仓摘要失败:"), error);
      setPositions([]);
      setHistoryRecords([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  const handleClaimReward = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const response = await apiClient.post('/reward/claim', {
        accountType
      });
      if (isSuccessResponse(response)) {
        setToast({
          message: tx("领取成功！奖励已发放到您的账户"),
          type: 'success'
        });
        setTimeout(() => {
          void fetchDashboard(false);
        }, 3500);
      } else {
        setToast({
          message: extractMessage(response, tx("领取失败")),
          type: 'error'
        });
      }
    } catch (error: any) {
      console.error(tx("领取奖励失败:"), error);
      const errorMsg = extractMessage(error.response?.data, tx("领取失败，请稍后重试"));
      setToast({
        message: errorMsg,
        type: 'error'
      });
    } finally {
      setClaiming(false);
    }
  };
  useEffect(() => {
    void fetchDashboard();
    const interval = window.setInterval(() => {
      if (!document.hidden) {
        void fetchDashboard(false);
      }
    }, 8000);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void fetchDashboard(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [accountType]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 计算剩余时间
  const calculateCountdown = (expectedCloseTime: string) => {
    const now = new Date().getTime();
    const closeTime = new Date(expectedCloseTime).getTime();
    const diff = Math.max(0, closeTime - now);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor(diff % 60000 / 1000);
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

  // 合并所有订单
  const allOrders = [...positions.map(p => ({
    ...p,
    type: 'trading' as const
  })), ...historyRecords.map(h => ({
    ...h,
    type: 'history' as const
  }))];
  const isDrawOrder = (order: HistoryRecord) => {
    const openPrice = Number(order.openPrice);
    const closePrice = Number(order.closePrice);
    return Number.isFinite(openPrice) && Number.isFinite(closePrice) && openPrice === closePrice;
  };
  const isProfitOrder = (order: HistoryRecord) => {
    return Number(order.profitLoss) > 0 || isDrawOrder(order);
  };

  // 过滤订单
  const filteredOrders = allOrders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'trading') return order.type === 'trading';
    if (activeTab === 'profit') return order.type === 'history' && isProfitOrder(order as HistoryRecord);
    if (activeTab === 'loss') return order.type === 'history' && (order as HistoryRecord).profitLoss < 0;
    if (activeTab === 'today') return isTodayOrder(order);
    return true;
  });
  return <div className="relative flex h-screen min-h-screen flex-col overflow-hidden bg-[#09090b]">
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Top Account Module */}
      <div className="relative z-20 flex-shrink-0 rounded-b-[32px] border-b border-white/5 bg-[#14141c] p-5 pt-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-6" ref={dropdownRef}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsAccountOpen(!isAccountOpen)}>
              <div className="bg-[#2a2a36] text-white text-[12px] px-2 py-0.5 rounded font-medium">
                {accountType === 'demo' ? tx("模拟") : tx("真实")}
              </div>
              <div className="text-[#8a8a93] text-[14px] flex items-center gap-1 font-medium">{tx("可用资金")}<ChevronDown size={16} className={`transition-transform duration-300 ${isAccountOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
            <button onClick={() => navigate('/deposit')} className="bg-[#6c48f5] hover:bg-[#5a3bd9] transition-colors text-white text-[13px] px-4 py-1.5 rounded-full font-medium shadow-[0_4px_12px_rgba(108,72,245,0.3)]">{tx("存款/充值")}</button>
          </div>

          <AnimatePresence>
            {isAccountOpen && <motion.div initial={{
          opacity: 0,
          height: 0,
          marginBottom: 0
        }} animate={{
          opacity: 1,
          height: 'auto',
          marginBottom: 24
        }} exit={{
          opacity: 0,
          height: 0,
          marginBottom: 0
        }} className="overflow-hidden">
                <div className="bg-[#1a1a24] rounded-2xl p-2 border border-white/10 flex flex-col gap-1">
                  <div className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${accountType === 'demo' ? 'bg-white/5' : 'hover:bg-white/5'}`} onClick={() => {
              setAccountType('demo');
              setIsAccountOpen(false);
            }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2a2a36] flex items-center justify-center text-xs">{tx("模")}</div>
                      <div>
                        <div className="text-[13px] font-medium text-white">{tx("模拟账户")}</div>
                        <div className="text-[12px] text-[#8a8a93] font-mono">đ {demoBalance.toLocaleString()}</div>
                      </div>
                    </div>
                    {accountType === 'demo' && <CheckCircle2 size={18} className="text-[#10b981]" />}
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${accountType === 'real' ? 'bg-white/5' : 'hover:bg-white/5'}`} onClick={() => {
              setAccountType('real');
              setIsAccountOpen(false);
            }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2a2a36] flex items-center justify-center text-xs">{tx("真")}</div>
                      <div>
                        <div className="text-[13px] font-medium text-white">{tx("真实账户")}</div>
                        <div className="text-[12px] text-[#8a8a93] font-mono">đ {realBalance.toLocaleString()}</div>
                      </div>
                    </div>
                    {accountType === 'real' && <CheckCircle2 size={18} className="text-[#10b981]" />}
                  </div>
                </div>
              </motion.div>}
          </AnimatePresence>

          <div className="text-[32px] font-bold font-mono tracking-tight mb-8 leading-none text-white">
            đ {availableBalance.toLocaleString()}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="text-[#8a8a93] text-[12px] mb-1.5 font-medium">{tx("今日盈亏")}</div>
              <div className={`text-[16px] font-bold font-mono ${getToneTextClass(getProfitTone(todayProfitLoss))}`}>
                {todayProfitLoss >= 0 ? '+' : ''}{Math.floor(todayProfitLoss).toLocaleString()}
              </div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[#8a8a93] text-[12px] mb-1.5 font-medium">{tx("今日交易笔数")}</div>
              <div className="text-white text-[16px] font-bold font-mono">
                {todayTradeCount}
                <span className="text-[12px] font-sans font-normal ml-0.5">{tx("笔")}</span>
              </div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-[#8a8a93] text-[12px] mb-1.5 font-medium">{tx("今日交易胜率")}</div>
              <div className="text-white text-[16px] font-bold font-mono">{todayWinRate.toFixed(0)}%</div>
            </div>
          </div>
        </div>

      {/* Filter Tabs */}
      <div className="z-10 flex-shrink-0 bg-[#09090b] px-6 pb-2 pt-4">
        <div className="hide-scroll flex gap-2.5 overflow-x-auto">
          {positionTabs.map(tab => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-1.5 rounded-[20px] text-[13px] whitespace-nowrap transition-all duration-300 font-medium shrink-0 ${activeTab === tab.key ? 'bg-[#6c48f5] text-white shadow-[0_4px_10px_rgba(108,72,245,0.3)]' : 'bg-[#1a1a24] text-[#8a8a93] hover:text-white hover:bg-[#2a2a36]'}`}>
              {tx(tab.labelKey)}
            </button>)}
        </div>
      </div>

      {/* Orders List */}
      <div className="hide-scroll flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-2 pb-[132px]" style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
          <AnimatePresence mode="popLayout">
            {loading ? <div className="text-center py-12 text-[#8a8a93]">{tx("加载中...")}</div> : filteredOrders.length === 0 ? <div className="py-20 flex flex-col items-center justify-center text-[#8a8a93]">
                <History size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-[14px]">{tx("暂无相关订单记录")}</p>
              </div> : filteredOrders.map(order => {
          const isTrading = order.type === 'trading';
          const position = isTrading ? order as Position : null;
          const history = !isTrading ? order as HistoryRecord : null;
          const tradeTone = getTradeTone(order.tradeType);
          return <motion.div key={order.id} layout initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            scale: 0.95
          }} transition={{
            duration: 0.2
          }} className="bg-[#14141c] rounded-[20px] p-4 flex flex-col gap-4 border-[0.5px] border-white/5 shadow-sm hover:border-white/10 transition-colors cursor-pointer" onClick={() => isTrading ? navigate(`/trading?stock=${order.stockCode}&orderId=${order.id}`) : navigate(`/positions/order/${order.id}`)}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 shadow-[0_4px_8px_rgba(0,0,0,0.2)] overflow-hidden bg-white">
                          <img src={`/logo/${order.stockCode}.svg`} alt={order.stockCode} className="w-full h-full object-cover" onError={e => {
                    // 如果图片加载失败，显示文字
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.classList.add('bg-gradient-to-b', 'from-[#8c6bff]', 'to-[#6c48f5]');
                      parent.classList.remove('bg-white');
                      const span = document.createElement('span');
                      span.className = 'text-[11px] text-white font-bold';
                      span.textContent = order.stockCode.charAt(0);
                      parent.appendChild(span);
                    }
                  }} />
                        </div>
                        <span className="text-[15px] font-semibold text-white/90 tracking-tight">
                            {getLocalizedProductName(getFallbackProductInfo(order.stockCode), order.stockCode)}
                        </span>
                      </div>

                      {/* Right side status/PNL */}
                      {isTrading && position ? <div className="flex items-center gap-1.5 text-[#f59e0b] font-mono text-[15px] font-bold">
                          <Clock size={14} className="animate-pulse" />{' '}
                          {calculateCountdown(position.expectedCloseTime)}
                        </div> : history ? <div className={`font-mono text-[16px] font-bold ${getToneTextClass(getProfitTone(history.profitLoss))}`}>
                          {history.profitLoss > 0 ? '+' : ''}
                          {Number(history.profitLoss || 0).toLocaleString()}{' '}
                          <span className="text-[12px] font-sans font-normal ml-0.5">VND</span>
                        </div> : null}
                    </div>

                    <div className="flex justify-between items-end mt-1">
                      <div className="text-[#8a8a93] text-[13px] font-mono flex items-center">
                        @{isTrading ? Number(position?.openPrice || 0).toFixed(2) : Number(history?.openPrice || 0).toFixed(2)}
                        <ArrowRight size={14} className="mx-2 text-white/20" />
                        <span className={isTrading ? 'text-white/20' : 'text-white/70'}>
                          {isTrading ? '—' : Number(history?.closePrice || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white/90 font-mono text-[14px] font-medium">
                          {Number(order.investmentAmount || 0).toLocaleString()}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-[6px] font-bold tracking-wider whitespace-nowrap shrink-0 ${tradeTone === 'red' ? 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/20' : 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20'}`}>
                          {order.tradeType === 'bull' ? tx("看涨") : tx("看跌")}
                        </span>
                      </div>
                    </div>
                  </motion.div>;
        })}
          </AnimatePresence>
      </div>

      <BottomNav />

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>;
}
