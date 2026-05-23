import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Clock, ArrowRight, Wallet, History, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Mock Data
const orders = [
  {
    id: 1,
    type: 'trading',
    asset: 'Bitcoin vs US Dollar',
    symbol: 'BTC',
    entryPrice: '104,911.55',
    currentPrice: '—',
    investment: '10000',
    currency: 'VND',
    direction: '看涨', // Call
    timeRemaining: '00:55',
    pnl: null,
  },
  {
    id: 2,
    type: 'trading',
    asset: 'Bitcoin vs US Dollar',
    symbol: 'BTC',
    entryPrice: '104,911.55',
    currentPrice: '—',
    investment: '10000',
    currency: 'VND',
    direction: '看涨',
    timeRemaining: '04:55',
    pnl: null,
  },
  {
    id: 3,
    type: 'history',
    asset: 'Bitcoin vs US Dollar',
    symbol: 'BTC',
    entryPrice: '104,911.55',
    currentPrice: '102,911.55',
    investment: '10000',
    currency: 'VND',
    direction: '看跌',
    timeRemaining: null,
    pnl: -10000,
  },
  {
    id: 4,
    type: 'history',
    asset: 'Bitcoin vs US Dollar',
    symbol: 'BTC',
    entryPrice: '104,911.55',
    currentPrice: '102,911.55',
    investment: '10000',
    currency: 'VND',
    direction: '看跌',
    timeRemaining: null,
    pnl: 88000,
  },
  {
    id: 5,
    type: 'history',
    asset: 'Ethereum vs US Dollar',
    symbol: 'ETH',
    entryPrice: '3,411.55',
    currentPrice: '3,450.00',
    investment: '50000',
    currency: 'VND',
    direction: '看涨',
    timeRemaining: null,
    pnl: 44000,
  }
];

export function PositionsPage({ onNavigateToTrade }: { onNavigateToTrade?: (asset: string) => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('全部');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const tabs = ['全部', '今日', '交易中', '盈利', '亏损'];

  const filteredOrders = orders.filter(order => {
    if (activeTab === '全部') return true;
    if (activeTab === '交易中') return order.type === 'trading';
    if (activeTab === '盈利') return order.pnl !== null && order.pnl > 0;
    if (activeTab === '亏损') return order.pnl !== null && order.pnl < 0;
    if (activeTab === '今日') return true; // mock all as today
    return true;
  });

  return (
    <div className="absolute inset-0 bg-[#09090b] flex flex-col overflow-hidden text-white z-0 rounded-[36px]">
      
      {/* Top Account Module - Fixed at top */}
      <div className="bg-[#14141c] rounded-b-[32px] p-5 pt-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-20 border-b border-white/5 flex-shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsAccountOpen(!isAccountOpen)}
          >
            <div className="bg-[#2a2a36] text-white text-[12px] px-2 py-0.5 rounded font-medium">模拟</div>
            <div className="text-[#8a8a93] text-[14px] flex items-center gap-1 font-medium">
              可用资金 
              <ChevronDown size={16} className={`transition-transform duration-300 ${isAccountOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
          <button className="bg-[#6c48f5] hover:bg-[#5a3bd9] transition-colors text-white text-[13px] px-4 py-1.5 rounded-full font-medium shadow-[0_4px_12px_rgba(108,72,245,0.3)]">
            存款/充值
          </button>
        </div>

        <AnimatePresence>
          {isAccountOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#1a1a24] rounded-2xl p-2 border border-white/10 flex flex-col gap-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2a2a36] flex items-center justify-center text-xs">模</div>
                    <div>
                      <div className="text-[13px] font-medium text-white">模拟账户</div>
                      <div className="text-[12px] text-[#8a8a93] font-mono">đ 100,000,000</div>
                    </div>
                  </div>
                  <CheckCircle2 size={18} className="text-[#10b981]" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2a2a36] flex items-center justify-center text-xs">真</div>
                    <div>
                      <div className="text-[13px] font-medium text-white">真实账户</div>
                      <div className="text-[12px] text-[#8a8a93] font-mono">đ 0.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-[32px] font-bold font-mono tracking-tight mb-8 leading-none">
          đ 100,000,000
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="text-[#8a8a93] text-[12px] mb-1.5 font-medium">今日盈亏</div>
            <div className="text-[#ef4444] text-[16px] font-bold font-mono">+0.00</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-[#8a8a93] text-[12px] mb-1.5 font-medium">今日交易笔数</div>
            <div className="text-white text-[16px] font-bold font-mono">10<span className="text-[12px] font-sans font-normal ml-0.5">笔</span></div>
          </div>
          <div className="flex-1 text-right">
            <div className="text-[#8a8a93] text-[12px] mb-1.5 font-medium">今日交易胜率</div>
            <div className="text-white text-[16px] font-bold font-mono">50%</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Fixed below account module */}
      <div className="pt-4 pb-2 px-4 bg-[#09090b] z-10 flex-shrink-0">
        <div className="flex gap-2.5 overflow-x-auto hide-scroll">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-[20px] text-[13px] whitespace-nowrap transition-all duration-300 font-medium shrink-0 ${
                activeTab === tab 
                  ? 'bg-[#6c48f5] text-white shadow-[0_4px_10px_rgba(108,72,245,0.3)]' 
                  : 'bg-[#1a1a24] text-[#8a8a93] hover:text-white hover:bg-[#2a2a36]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Orders List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3 pb-[100px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        
        <AnimatePresence mode="popLayout">
            {filteredOrders.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  if (order.type === 'trading') {
                    if (onNavigateToTrade) onNavigateToTrade(order.asset);
                  } else {
                    navigate(`/order-detail/${order.id}`);
                  }
                }}
                className="bg-[#14141c] rounded-[20px] p-4 flex flex-col gap-4 border-[0.5px] border-white/5 shadow-sm hover:border-white/10 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 shadow-[0_4px_8px_rgba(0,0,0,0.2)] ${
                      order.symbol === 'BTC' ? 'bg-gradient-to-b from-[#f7931a] to-[#fcd34d]' : 'bg-gradient-to-b from-[#8c6bff] to-[#6c48f5]'
                    }`}>
                      {order.symbol === 'BTC' ? (
                        <span className="font-['Inter:Bold'] font-bold text-[11px] text-white">B</span>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.944 17.97L4.58 13.62L11.944 24L19.32 13.62L11.944 17.97Z" fill="white"/>
                          <path d="M11.944 0L4.58 12.22L11.944 16.56L19.32 12.22L11.944 0Z" fill="white"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-[15px] font-semibold text-white/90 tracking-tight">{order.asset}</span>
                  </div>
                  
                  {/* Right side status/PNL */}
                  {order.type === 'trading' ? (
                    <div className="flex items-center gap-1.5 text-[#f59e0b] font-mono text-[15px] font-bold">
                      <Clock size={14} className="animate-pulse" /> {order.timeRemaining}
                    </div>
                  ) : (
                    <div className={`font-mono text-[16px] font-bold ${order.pnl && order.pnl > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {order.pnl && order.pnl > 0 ? '+' : ''}{order.pnl} <span className="text-[12px] font-sans font-normal ml-0.5">{order.currency}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end mt-1">
                  <div className="text-[#8a8a93] text-[13px] font-mono flex items-center">
                    @{order.entryPrice} 
                    <ArrowRight size={14} className="mx-2 text-white/20"/> 
                    <span className={order.type === 'trading' ? 'text-white/20' : 'text-white/70'}>{order.currentPrice}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/90 font-mono text-[14px] font-medium">{order.investment}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-[6px] font-bold tracking-wider whitespace-nowrap shrink-0 ${
                      order.direction === '看涨' 
                        ? 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/20' 
                        : 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20'
                    }`}>
                      {order.direction}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-[#8a8a93]">
              <History size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-[14px]">暂无相关订单记录</p>
            </div>
          )}
        </div>
    </div>
  );
}
