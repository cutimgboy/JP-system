import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Flag, Bitcoin, Coins, Droplets, LineChart, BarChart3, Check } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

const MAX_POINTS = 70;
const FIXED_INDEX = 42;

// 生成图表数据 - 初始从左侧仅展示几个数据点
const generateChartData = () => {
  let basePrice = 10500;
  const data = [];
  for (let i = 0; i < MAX_POINTS; i++) {
    if (i <= 5) { // 初始状态在最左侧
      basePrice += (Math.random() - 0.52) * 120;
      data.push({
        id: `point-${i}`,
        time: `00:0${i}`,
        price: basePrice,
        index: i
      });
    } else {
      data.push({
        id: `point-${i}`,
        time: `00:${String(i).padStart(2, '0')}`,
        price: null,
        index: i
      });
    }
  }
  return data;
};

export function TradePage() {
  const [activeAsset, setActiveAsset] = useState('黄金');
  const [chartData, setChartData] = useState(generateChartData());
  const [tradeType, setTradeType] = useState<'bull' | 'bear' | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [showResult, setShowResult] = useState(false);
  const [profit, setProfit] = useState(0);
  const [tradeStartPrice, setTradeStartPrice] = useState(0);
  const [tradeStartPointId, setTradeStartPointId] = useState<string | null>(null);
  const [guideStep, setGuideStep] = useState(() => {
    return sessionStorage.getItem('tradeGuideStarted') === 'true' ? 1 : -1;
  }); // -1: none, 1: highlight time, 2: time select, 3: done
  const intervalRef = useRef<number | null>(null);

  const [isHeaderInfoVisible, setIsHeaderInfoVisible] = useState(true);
  const headerInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerInfoRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsHeaderInfoVisible(entry.isIntersecting);
    }, { threshold: 0, rootMargin: "-80px 0px 0px 0px" });
    observer.observe(headerInfoRef.current);
    return () => observer.disconnect();
  }, [activeAsset]); // re-observe if DOM might change, though ref is stable

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const dx = touchStartX.current - touchEndX;
    const dy = touchStartY.current - touchEndY;
    
    // Check if it's mostly horizontal swipe
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      const currentIndex = assets.findIndex(a => a.id === activeAsset);
      if (dx > 0) { // Swiped left
        if (currentIndex < assets.length - 1) setActiveAsset(assets[currentIndex + 1].id);
      } else { // Swiped right
        if (currentIndex > 0) setActiveAsset(assets[currentIndex - 1].id);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handlePrevAsset = () => {
    const currentIndex = assets.findIndex(a => a.id === activeAsset);
    if (currentIndex > 0) setActiveAsset(assets[currentIndex - 1].id);
  };

  const handleNextAsset = () => {
    const currentIndex = assets.findIndex(a => a.id === activeAsset);
    if (currentIndex < assets.length - 1) setActiveAsset(assets[currentIndex + 1].id);
  };

  useEffect(() => {
    const handleStartGuide = () => {
      setGuideStep(1);
    };
    window.addEventListener('start-trade-guide', handleStartGuide);
    return () => window.removeEventListener('start-trade-guide', handleStartGuide);
  }, []);

  // 计算当前的有效数据末尾索引
  const currentDataIndex = chartData.findLastIndex(d => d.price !== null);
  const validIndex = currentDataIndex >= 0 ? currentDataIndex : 0;
  const currentPrice = chartData[validIndex]?.price || 10000;

  // 使用 ref 来始终获取倒计时结束时的最新价格
  const latestPriceRef = useRef(currentPrice);
  useEffect(() => {
    latestPriceRef.current = currentPrice;
  }, [currentPrice]);

  const assets = [
    { id: '黄金', label: '黄金', fullName: '黄金 (XAU/USD)', color: '#f59e0b', bg: '#fef3c7' },
    { id: '比特币', label: '比特币', fullName: '比特币 (BTC/USD)', color: '#f7931a', bg: '#fef3c7' },
    { id: '原油', label: '原油', fullName: '原油 (WTI)', color: '#0ea5e9', bg: '#e0f2fe' },
    { id: '纳指', label: '纳指', fullName: '纳指 (NDX)', color: '#8b5cf6', bg: '#ede9fe' },
    { id: '标普', label: '标普', fullName: '标普 (SPX)', color: '#ef4444', bg: '#fee2e2' },
    { id: '以太坊', label: '以太坊', fullName: '以太坊 (ETH/USD)', color: '#8c6bff', bg: '#ede9fe' },
    { id: 'Chainlink', label: 'Chainlink', fullName: 'Chainlink (LINK/USD)', color: '#155dfc', bg: '#dbeafe' },
  ];

  const getAssetLogoStyle = (id: string) => {
    switch (id) {
      case '黄金': return 'bg-gradient-to-b from-[#f59e0b] to-[#fbbf24]';
      case '比特币': return 'bg-gradient-to-b from-[#f7931a] to-[#fcd34d]';
      case '以太坊': return 'bg-gradient-to-b from-[#8c6bff] to-[#6c48f5]';
      case '原油': return 'bg-gradient-to-b from-[#0ea5e9] to-[#38bdf8]';
      case 'Chainlink': return 'bg-[#155dfc]';
      case '纳指': return 'bg-[#10b981]';
      case '标普': return 'bg-[#ef4444]';
      default: return 'bg-[#6c48f5]';
    }
  };

  const currentAsset = assets.find(a => a.id === activeAsset) || assets[0];

  // 动态更新图表数据 - 从左向右累加，到达中间后开始向左滚动
  useEffect(() => {
    const updateChart = () => {
      setChartData(prevData => {
        const newData = [...prevData];
        const latestIndex = newData.findLastIndex(d => d.price !== null);

        if (latestIndex < FIXED_INDEX) {
          // K线未到达中间，继续向右延伸
          const nextIndex = latestIndex + 1;
          const lastPrice = newData[latestIndex].price as number;
          newData[nextIndex] = {
            ...newData[nextIndex],
            id: `point-${Date.now()}-${nextIndex}`,
            price: lastPrice + (Math.random() - 0.5) * 80
          };
        } else {
          // K线已到达中间，旧数据向左移动
          for (let i = 0; i < FIXED_INDEX; i++) {
            newData[i] = {
              ...newData[i + 1],
              index: i
            };
          }
          const lastPrice = newData[FIXED_INDEX - 1].price as number;
          newData[FIXED_INDEX] = {
            id: `point-${Date.now()}-${FIXED_INDEX}`,
            time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            price: lastPrice + (Math.random() - 0.5) * 80,
            index: FIXED_INDEX
          };
          // 确保后半部分仍然是空位
          for (let i = FIXED_INDEX + 1; i < MAX_POINTS; i++) {
            newData[i] = { ...newData[i], price: null };
          }
        }
        return newData;
      });
    };

    intervalRef.current = window.setInterval(updateChart, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 倒计时与结算管理
  useEffect(() => {
    let timeoutId: number;
    if (tradeType && countdown > 0) {
      timeoutId = window.setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
    } else if (tradeType && countdown === 0 && !showResult) {
      // 倒计时结束，展示结果
      const finalPrice = latestPriceRef.current;
      const priceDiff = finalPrice - tradeStartPrice;
      const isProfit = (tradeType === 'bull' && priceDiff > 0) || (tradeType === 'bear' && priceDiff < 0);
      const calculatedProfit = isProfit ? 10000 : -5000;
      setProfit(calculatedProfit);
      setShowResult(true);
      
      // 3秒后隐藏结果并重置状态
      setTimeout(() => {
        setShowResult(false);
        setTradeType(null);
        setCountdown(10);
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [tradeType, countdown, showResult, tradeStartPrice]);

  const handleTrade = (type: 'bull' | 'bear') => {
    if (!tradeType) {
      setTradeType(type);
      setCountdown(10);
      setShowResult(false);
      setTradeStartPrice(currentPrice);
      setTradeStartPointId(chartData[validIndex]?.id || null);
    }
  };

  // 动态计算开仓点的位置
  const getTradeStartPosition = () => {
    if (!tradeType || showResult || !tradeStartPointId) return null;
    
    const pointIndex = chartData.findIndex(d => d.id === tradeStartPointId);
    if (pointIndex < 0) return null; // Scrolled out of view
    
    const xPercent = (pointIndex / (MAX_POINTS - 1)) * 100;
    
    const prices = chartData.filter(d => d.price !== null).map(d => d.price as number);
    const minPrice = prices.length ? Math.min(...prices) : tradeStartPrice;
    const maxPrice = prices.length ? Math.max(...prices) : tradeStartPrice;
    const priceRange = maxPrice - minPrice || 1;
    const padding = priceRange * 0.15;
    
    const yPercent = ((maxPrice + padding - tradeStartPrice) / (priceRange + padding * 2)) * 80 + 10;
    
    return { x: xPercent, y: yPercent, price: tradeStartPrice };
  };

  // 动态计��UI标记点的当前百分比位置，实现平滑跟随效果
  const getCurrentPricePosition = () => {
    const xPercent = (validIndex / (MAX_POINTS - 1)) * 100;
    
    const prices = chartData.filter(d => d.price !== null).map(d => d.price as number);
    const minPrice = prices.length ? Math.min(...prices) : currentPrice;
    const maxPrice = prices.length ? Math.max(...prices) : currentPrice;
    const priceRange = maxPrice - minPrice || 1;
    const padding = priceRange * 0.15;
    
    const yPercent = ((maxPrice + padding - currentPrice) / (priceRange + padding * 2)) * 80 + 10;
    
    return { x: xPercent, y: yPercent, price: currentPrice };
  };

  const getYAxisDomain = () => {
    const prices = chartData.filter(d => d.price !== null).map(d => d.price as number);
    const minPrice = prices.length ? Math.min(...prices) : currentPrice;
    const maxPrice = prices.length ? Math.max(...prices) : currentPrice;
    const priceRange = maxPrice - minPrice || 1;
    const padding = priceRange * 0.15;
    return [minPrice - padding, maxPrice + padding];
  };

  const currentPosition = getCurrentPricePosition();
  const yAxisDomain = getYAxisDomain();

  return (
    <div className="absolute inset-0 bg-[#09090b] flex flex-col overflow-hidden text-white z-0 rounded-[36px]">
      
      {/* Scrollable Content Area */}
      <div 
        className="flex-1 overflow-y-auto pb-[200px]" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        
        {/* Module 1: Top Product Switcher (Sticky) */}
        <div className="sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur-md px-4 pt-[24px] pb-2 transition-all">
          {isHeaderInfoVisible ? (
            <div className="flex items-center justify-between gap-4">
              <button onClick={handlePrevAsset} className="w-8 h-8 rounded-full bg-[#1a1a24] flex items-center justify-center text-[#8a8a93] shrink-0 hover:bg-[#2a2a36] transition-colors shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <div className="flex-1 overflow-x-auto hide-scroll py-2">
                <div className="flex justify-center gap-4">
                  {assets.map(asset => {
                    const isActive = activeAsset === asset.id;
                    const logoStyle = getAssetLogoStyle(asset.id);
                    return (
                      <div 
                        key={asset.id}
                        onClick={() => setActiveAsset(asset.id)}
                        className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 shrink-0`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-white/20 blur-[10px] rounded-full" />
                        )}
                        <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 shadow-[0px_4px_10px_rgba(0,0,0,0.2)] border-2 transition-all duration-300 ${
                          isActive ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                        } ${logoStyle}`}>
                          {asset.id === '比特币' ? (
                            <p className="font-['Inter:Bold',sans-serif] font-bold leading-[15px] text-[14px] text-white tracking-[0.1px]">B</p>
                          ) : asset.id === '以太坊' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11.944 17.97L4.58 13.62L11.944 24L19.32 13.62L11.944 17.97Z" fill="white"/>
                              <path d="M11.944 0L4.58 12.22L11.944 16.56L19.32 12.22L11.944 0Z" fill="white"/>
                            </svg>
                          ) : (
                             <div className="w-[16px] h-[16px] bg-white rounded-sm" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleNextAsset} className="w-8 h-8 rounded-full bg-[#1a1a24] flex items-center justify-center text-[#8a8a93] shrink-0 hover:bg-[#2a2a36] transition-colors shadow-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2 transition-all duration-300">
              <h2 className="text-[18px] font-bold tracking-tight">{currentAsset.label}</h2>
              <div className="text-right flex items-center gap-3">
                <div className="text-[18px] font-bold text-[#ef4444] font-mono leading-none tracking-tight">
                  {currentPrice.toFixed(2)}
                </div>
                <div className="text-[#ef4444] text-[12px] font-medium">+423.00 <span className="ml-1">+3.00%</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Module 2: Chart Area */}
        <div className="px-4 mt-2">
          {/* Header Info */}
          <div ref={headerInfoRef} className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-[20px] font-bold tracking-tight">{currentAsset.fullName}</h2>
              <div className="text-[#8a8a93] text-[12px] mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                交易中 05-29 10:47:37
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-[24px] font-bold text-[#ef4444] font-mono leading-none tracking-tight">
                {currentPrice.toFixed(2)}
              </div>
              <div className="text-[#ef4444] text-[13px] font-medium mt-1">+423.00 +3.00%</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[220px] w-full relative mt-2 border-b border-white/5 pb-2">
            {/* Y-axis label - 显示当前价格 */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#1a1a24]/80 px-2 py-0.5 rounded text-[10px] text-[#8a8a93] border border-white/10 backdrop-blur-sm">
              {currentPosition.price.toFixed(2)}
            </div>
            
            {/* End point flag - 动态跟随 */}
            <div 
              className="absolute z-10 flex flex-col items-center pointer-events-none transition-all duration-[800ms] ease-linear"
              style={{ 
                left: `${currentPosition.x}%`, 
                top: '4px',
                transform: 'translateX(-50%)'
              }}
            >
              <Flag size={14} className="text-white" />
              <div className="w-[1px] h-[180px] bg-white/20 border-l border-dashed border-white/40 mt-1"></div>
              
              {/* 圆圈标记在旗帜线底部 */}
              {/* 移除了圆圈 */}
            </div>

            {/* 最新价呼吸小圆点 */}
            <div 
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-[800ms] ease-linear"
              style={{ 
                left: `${currentPosition.x}%`, 
                top: `${currentPosition.y}%` 
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* 呼吸外圈 */}
                <div className="absolute w-3.5 h-3.5 bg-[#ef4444] rounded-full opacity-60 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                {/* 实心圆点 */}
                <div className="relative w-2 h-2 bg-[#ef4444] rounded-full shadow-[0_0_6px_rgba(239,68,68,0.8)]"></div>
              </div>
            </div>

            {/* ��计时显示在旗帜下方 */}
            {tradeType && !showResult && (
              <div 
                className="absolute z-20 -translate-x-1/2 transition-all duration-[800ms] ease-linear"
                style={{ 
                  left: `${currentPosition.x}%`, 
                  top: '195px'
                }}
              >
                <div className="bg-[#1a1a24]/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 shadow-lg">
                  <div className="text-white font-bold text-sm font-mono">{countdown}s</div>
                </div>
              </div>
            )}

            {/* 开仓点标记 (水平线 + Y轴价格 + 交易方向Icon) */}
            {(() => {
              const startPos = getTradeStartPosition();
              if (!startPos) return null;
              
              const isBull = tradeType === 'bull';
              const color = isBull ? '#ef4444' : '#10b981';
              
              return (
                <>
                  {/* 水平实线 (仅显示右侧) */}
                  <div 
                    className="absolute h-[1px] z-10 pointer-events-none transition-all duration-[800ms] ease-linear"
                    style={{ 
                      top: `${startPos.y}%`,
                      left: `${startPos.x}%`,
                      right: 0,
                      backgroundColor: color,
                      boxShadow: `0 0 4px ${color}`
                    }}
                  />
                  
                  {/* Y轴对应的价格标签 */}
                  <div 
                    className="absolute right-0 z-20 px-2 py-0.5 rounded text-[10px] text-white font-mono font-medium translate-x-0 -translate-y-1/2 transition-all duration-[800ms] ease-linear"
                    style={{ 
                      top: `${startPos.y}%`,
                      backgroundColor: color
                    }}
                  >
                    {startPos.price.toFixed(2)}
                  </div>
                  
                  {/* 交易方向 Icon (带圆圈，无外圈呼吸边框) */}
                  <div 
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-[800ms] ease-linear"
                    style={{ 
                      left: `${startPos.x}%`, 
                      top: `${startPos.y}%` 
                    }}
                  >
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <div className={`absolute inset-0 rounded-full blur-sm ${isBull ? 'bg-[#ef4444]/80' : 'bg-[#10b981]/80'}`} />
                      <div className={`relative w-5 h-5 rounded-full flex items-center justify-center z-10 text-white shadow-[0_0_8px_rgba(0,0,0,0.5)] ${isBull ? 'bg-[#ef4444]' : 'bg-[#10b981]'}`}>
                        {isBull ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* 投资收益悬浮窗 - 显示在K线当前价格坐标点 */}
            {showResult && (
              <div 
                className="absolute z-30 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-700 transition-all ease-linear"
                style={{ 
                  left: `${currentPosition.x}%`, 
                  top: `${currentPosition.y}%` 
                }}
              >
                {/* 外层发光效果 */}
                <div className={`absolute inset-0 blur-2xl rounded-3xl ${
                  profit > 0 
                    ? 'bg-[#10b981]/50 shadow-[0_0_60px_rgba(16,185,129,0.6)]' 
                    : 'bg-[#ef4444]/50 shadow-[0_0_60px_rgba(239,68,68,0.6)]'
                }`}></div>
                
                {/* 悬浮窗主体 */}
                <div className={`relative px-4 py-2.5 rounded-xl backdrop-blur-2xl border-2 shadow-xl ${
                  profit > 0 
                    ? 'bg-[#10b981]/25 border-[#10b981] shadow-[0_0_30px_rgba(16,185,129,0.5)]' 
                    : 'bg-[#ef4444]/25 border-[#ef4444] shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                }`}>
                  <div className="text-center whitespace-nowrap">
                    <div className="text-white text-[11px] font-medium mb-0.5">{profit > 0 ? '盈利' : '亏损'}</div>
                    <div className={`text-lg font-bold font-mono tracking-tight ${
                      profit > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
                    } drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`}>
                      {profit > 0 ? '+' : '-'}{Math.abs(profit).toLocaleString()}
                    </div>
                  </div>
                  
                  {/* 装饰性三角箭头 */}
                  <div className={`absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent ${
                    profit > 0 ? 'border-t-[6px] border-t-[#10b981]' : 'border-t-[6px] border-t-[#ef4444]'
                  }`}></div>
                </div>
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.filter(d => d.price !== null)} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs key="defs">
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis key="xaxis" dataKey="index" type="number" domain={[0, MAX_POINTS - 1]} hide />
                <YAxis key="yaxis" domain={yAxisDomain} hide />
                <Area 
                  key="area"
                  type="monotone" 
                  dataKey="price"
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  isAnimationActive={false}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* X-axis labels mock */}
            <div className="flex justify-between text-[10px] text-[#8a8a93] px-2 absolute bottom-[-16px] w-full left-0">
              <span>04:40</span>
              <span>05:40</span>
              <span>06:40</span>
              <span>07:40</span>
              <span>08:40</span>
              <span>09:40</span>
              <span>10:40</span>
            </div>
          </div>

          {/* Bull/Bear Progress Bar */}
          <div className="mt-8 mb-6">
            <div className="flex justify-between text-[12px] font-medium mb-2 px-1">
              <span className="text-[#ef4444]">看涨 32.56%</span>
              <span className="text-[#10b981]">67.34% 看跌</span>
            </div>
            <div className="h-[6px] w-full bg-[#1a1a24] rounded-full overflow-hidden flex">
              <div className="bg-[#ef4444] h-full transition-all duration-500" style={{ width: '32.56%' }}></div>
              <div className="bg-[#10b981] h-full transition-all duration-500" style={{ width: '67.44%' }}></div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

        {/* Module 4: Coin Overview */}
        <div className="px-5 py-4">
          <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-[#6c48f5] rounded-full"></div>
            标的概况
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { label: '市值排名', value: 'NO.1' },
              { label: '市值', value: '2.09兆' },
              { label: '完全稀释市值', value: '2.2兆' },
              { label: '流通数量', value: '1,987.8万 XAU' },
              { label: '最大供给量', value: '2,100.0万 XAU' },
              { label: '总量', value: '1,987.8万 XAU' },
              { label: '发行日期', value: '2008-11-01' },
              { label: '历史最高价', value: '111,970.1681' },
              { label: '历史最低价', value: '0.04864654' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center text-[13px]">
                <span className="text-[#8a8a93]">{item.label}</span>
                <span className="font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

        {/* Module 5: Coin Intro */}
        <div className="px-5 py-4">
          <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-[#10b981] rounded-full"></div>
            标的简介
          </h3>
          <p className="text-[13px] text-[#8a8a93] leading-relaxed text-justify">
            黄金(XAU)是一种广受欢迎的避险资产和全球性交易标的。旨在充当独立于任何中央机构的一种价值储藏手段。黄金可以安全、可验证和不变的方式进行交易。
            <br/><br/>
            作为传统的贵金属，它是通过全球市场的现货和期货交易系统中传播的，为全球投资者提供了一种解决通货膨胀和经济波动的解决方案。该概念最初由古代贸易形成...
            <span className="text-[#6c48f5] ml-1 cursor-pointer">展开</span>
          </p>
        </div>

        {/* Separator */}
        <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

        {/* Module 6: Trading Time */}
        <div className="px-5 py-4 pb-12">
          <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-[#f7931a] rounded-full"></div>
            交易时间
          </h3>
          <div className="flex flex-col gap-3 border border-white/5 rounded-2xl p-4 bg-[#14141c]">
            {[
              { day: '星期一', time: '00:00 - 22:00 ; 22:05 - 00:00' },
              { day: '星期二', time: '00:00 - 22:00 ; 22:05 - 00:00' },
              { day: '星期三', time: '00:00 - 22:00 ; 22:05 - 00:00' },
              { day: '星期四', time: '00:00 - 22:00 ; 22:05 - 00:00' },
              { day: '星期五', time: '00:00 - 22:00 ; 22:05 - 00:00' },
              { day: '星期六', time: '休市' },
              { day: '星期日', time: '休市' },
            ].map((item, i) => (
              <div key={i} className={`flex justify-between text-[13px] ${item.time === '休市' ? 'text-[#8a8a93] opacity-60' : ''}`}>
                <span className={item.time === '休市' ? '' : 'text-white'}>{item.day}</span>
                <span className={item.time === '休市' ? '' : 'text-[#8a8a93] font-mono'}>{item.time}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#8a8a93] mt-3 opacity-60">
            以上交易时间并未考虑节假日或市场特殊情况调整的影响。
          </p>
        </div>
      </div>

      {/* Guide Step 1/3/5: Dark Overlay */}
      <AnimatePresence>
        {[1, 3, 5].includes(guideStep) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          />
        )}
      </AnimatePresence>

      {/* Module 3: Floating Trade Controls */}
      <div className="absolute bottom-[92px] w-full px-4 z-[90]">
        <div className="bg-[#14141c]/95 backdrop-blur-xl rounded-[24px] p-4 border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {/* Inputs */}
          <div className="flex gap-3 mb-3 relative">
            
            {/* Tooltip for Guide Step 1 */}
            <AnimatePresence>
              {guideStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-[calc(100%+16px)] left-0 w-[45%] flex justify-center z-[100]"
                >
                  <div 
                    className="flex flex-row items-center gap-3 bg-[#1c1c24]/90 px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-[#23232c]/90 transition-colors w-max translate-x-4"
                    onClick={() => setGuideStep(2)}
                  >
                    {/* Animated Hand Gesture */}
                    <div className="flex-shrink-0 -rotate-12">
                      <motion.div
                        animate={{ scale: [1, 0.9, 1], y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <motion.div 
                            className="absolute inset-0 rounded-full bg-white/30"
                            animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                          />
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg relative z-10">
                            <path d="M12.9234 8.7844C12.3951 8.52876 11.7766 8.76106 11.536 9.30058L10.021 12.6976C9.91428 12.9372 9.61734 13.0441 9.37525 12.9348L9.04944 12.7876L8.85243 12.6987C8.25752 12.4299 7.55132 12.6841 7.27514 13.2662C6.99896 13.8483 7.25708 14.5385 7.85199 14.8073L8.53761 15.1169C9.74233 15.6611 10.4284 16.9208 10.222 18.2045C10.1558 18.6158 10.4357 19 10.8521 19H14.195C15.084 19 15.9385 18.6534 16.5746 18.033L17.7551 16.8817C18.3614 16.2905 18.7303 15.4925 18.7909 14.646L18.9135 12.935C18.9959 11.785 18.1751 10.7712 17.0279 10.6062L13.7828 10.1396C13.4332 10.0894 13.2087 9.75333 13.284 9.40871C13.3323 9.18731 13.1837 8.91039 12.9234 8.7844Z" fill="white" stroke="black" strokeWidth="1.5"/>
                            <path d="M9.89745 8.9221L9.1983 6.94589C8.80213 5.8263 9.40243 4.60461 10.5393 4.21609V4.21609C11.6761 3.82756 12.9189 4.42084 13.315 5.54044L14.0041 7.48805" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </motion.div>
                    </div>

                    <div className="text-white text-[14px] font-bold leading-relaxed drop-shadow-md text-left whitespace-nowrap">
                      点击可设置到期时间<br/>
                      <span className="text-white/60 font-normal text-[12px]">到期时间决定：多久之后来判断输赢</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tooltip for Guide Step 3 */}
            <AnimatePresence>
              {guideStep === 3 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-[calc(100%+16px)] right-0 w-[55%] flex justify-center z-[100]"
                >
                  <div 
                    className="flex flex-row items-center gap-3 bg-[#1c1c24]/90 px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-[#23232c]/90 transition-colors w-max"
                    onClick={() => setGuideStep(4)}
                  >
                    {/* Animated Hand Gesture */}
                    <div className="flex-shrink-0 -rotate-12">
                      <motion.div
                        animate={{ scale: [1, 0.9, 1], y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <motion.div 
                            className="absolute inset-0 rounded-full bg-white/30"
                            animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                          />
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg relative z-10">
                            <path d="M12.9234 8.7844C12.3951 8.52876 11.7766 8.76106 11.536 9.30058L10.021 12.6976C9.91428 12.9372 9.61734 13.0441 9.37525 12.9348L9.04944 12.7876L8.85243 12.6987C8.25752 12.4299 7.55132 12.6841 7.27514 13.2662C6.99896 13.8483 7.25708 14.5385 7.85199 14.8073L8.53761 15.1169C9.74233 15.6611 10.4284 16.9208 10.222 18.2045C10.1558 18.6158 10.4357 19 10.8521 19H14.195C15.084 19 15.9385 18.6534 16.5746 18.033L17.7551 16.8817C18.3614 16.2905 18.7303 15.4925 18.7909 14.646L18.9135 12.935C18.9959 11.785 18.1751 10.7712 17.0279 10.6062L13.7828 10.1396C13.4332 10.0894 13.2087 9.75333 13.284 9.40871C13.3323 9.18731 13.1837 8.91039 12.9234 8.7844Z" fill="white" stroke="black" strokeWidth="1.5"/>
                            <path d="M9.89745 8.9221L9.1983 6.94589C8.80213 5.8263 9.40243 4.60461 10.5393 4.21609V4.21609C11.6761 3.82756 12.9189 4.42084 13.315 5.54044L14.0041 7.48805" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </motion.div>
                    </div>

                    <div className="text-white text-[14px] font-bold leading-relaxed drop-shadow-md text-left whitespace-nowrap">
                      点击可设置投资金额<br/>
                      <span className="text-white/60 font-normal text-[12px]">投资金额决定：这一单你可以盈利多少</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div 
              className={`flex-1 rounded-[16px] h-[48px] flex items-center justify-between px-4 transition-all relative cursor-pointer ${
                guideStep === 1 
                  ? 'bg-white z-[100] shadow-[0_0_20px_rgba(255,255,255,0.4),0_0_0_2px_white]' 
                  : [3, 5].includes(guideStep) 
                    ? 'bg-[#1a1a24]/50 border border-white/5 opacity-50 pointer-events-none' 
                    : 'bg-[#1a1a24] border border-white/5 hover:bg-[#23232c]'
              }`}
              onClick={() => {
                if (guideStep === 1) {
                  setGuideStep(2);
                } else {
                  // 如果不是引导阶段，也可以通过设置为2来复用这个时间选择弹窗
                  setGuideStep(2); 
                }
              }}
            >
              <span className={`text-[13px] ${guideStep === 1 ? 'text-black/60 font-medium' : 'text-[#8a8a93]'}`}>时间</span>
              <span className={`font-bold text-[16px] ${guideStep === 1 ? 'text-black' : 'text-white'}`}>30s</span>
            </div>
            <div 
              className={`flex-[1.2] rounded-[16px] h-[48px] flex items-center justify-between px-4 transition-all relative ${
                guideStep === 3 
                  ? 'bg-white z-[100] shadow-[0_0_20px_rgba(255,255,255,0.4),0_0_0_2px_white] cursor-pointer' 
                  : [1, 5].includes(guideStep)
                    ? 'bg-[#1a1a24]/50 border border-white/5 opacity-50 pointer-events-none'
                    : 'bg-[#1a1a24] border border-white/5 focus-within:border-[#6c48f5]/50'
              }`}
              onClick={() => {
                if (guideStep === 3) setGuideStep(4);
              }}
            >
              <span className={`text-[13px] ${guideStep === 3 ? 'text-black/60 font-medium' : 'text-[#8a8a93]'}`}>投资</span>
              <input 
                type="text" 
                defaultValue="100000" 
                readOnly={guideStep === 3}
                className={`bg-transparent text-right font-bold text-[16px] w-[80px] outline-none font-mono ${
                  guideStep === 3 ? 'text-black pointer-events-none' : 'text-white'
                }`}
              />
            </div>
          </div>
          
          {/* Buttons */}
          <div className="relative">
            {/* Tooltip for Guide Step 5 */}
            <AnimatePresence>
              {guideStep === 5 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-[calc(100%+16px)] left-0 w-full flex justify-center z-[100]"
                >
                  <div className="flex flex-row items-center gap-3 bg-[#1c1c24]/90 px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-default w-max">
                    {/* Animated Hand Gesture */}
                    <div className="flex-shrink-0 -rotate-12">
                      <motion.div
                        animate={{ scale: [1, 0.9, 1], y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <motion.div 
                            className="absolute inset-0 rounded-full bg-white/30"
                            animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                          />
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg relative z-10">
                            <path d="M12.9234 8.7844C12.3951 8.52876 11.7766 8.76106 11.536 9.30058L10.021 12.6976C9.91428 12.9372 9.61734 13.0441 9.37525 12.9348L9.04944 12.7876L8.85243 12.6987C8.25752 12.4299 7.55132 12.6841 7.27514 13.2662C6.99896 13.8483 7.25708 14.5385 7.85199 14.8073L8.53761 15.1169C9.74233 15.6611 10.4284 16.9208 10.222 18.2045C10.1558 18.6158 10.4357 19 10.8521 19H14.195C15.084 19 15.9385 18.6534 16.5746 18.033L17.7551 16.8817C18.3614 16.2905 18.7303 15.4925 18.7909 14.646L18.9135 12.935C18.9959 11.785 18.1751 10.7712 17.0279 10.6062L13.7828 10.1396C13.4332 10.0894 13.2087 9.75333 13.284 9.40871C13.3323 9.18731 13.1837 8.91039 12.9234 8.7844Z" fill="white" stroke="black" strokeWidth="1.5"/>
                            <path d="M9.89745 8.9221L9.1983 6.94589C8.80213 5.8263 9.40243 4.60461 10.5393 4.21609V4.21609C11.6761 3.82756 12.9189 4.42084 13.315 5.54044L14.0041 7.48805" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </motion.div>
                    </div>

                    <div className="text-white text-[14px] font-bold leading-relaxed drop-shadow-md text-left whitespace-nowrap">
                      选择看涨看跌方向<br/>
                      <span className="text-white/60 font-normal text-[12px]">方向决定：到期时价格往哪边算你赢</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div 
              className={`flex gap-3 mb-3 transition-all duration-300 relative ${
                guideStep === 5 
                  ? 'z-[100]' 
                  : [1, 3].includes(guideStep) ? 'opacity-30 pointer-events-none' : ''
              }`}
            >
              <button 
                onClick={() => {
                  handleTrade('bull');
                  if (guideStep === 5) setGuideStep(6);
                }}
                disabled={!!tradeType && guideStep !== 5}
                className={`flex-1 bg-[#ef4444] hover:bg-[#dc2626] transition-colors rounded-[16px] h-[52px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(239,68,68,0.2)] ${
                  tradeType && guideStep !== 5 ? 'opacity-50 cursor-not-allowed' : ''
                } ${guideStep === 5 ? 'shadow-[0_0_20px_rgba(239,68,68,0.6),0_0_0_2px_white]' : ''}`}
              >
                <TrendingUp size={20} className="text-white" />
                <span className="text-white font-bold text-[16px] tracking-widest">看涨</span>
              </button>
              <button 
                onClick={() => {
                  handleTrade('bear');
                  if (guideStep === 5) setGuideStep(6);
                }}
                disabled={!!tradeType && guideStep !== 5}
                className={`flex-1 bg-[#10b981] hover:bg-[#059669] transition-colors rounded-[16px] h-[52px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.2)] ${
                  tradeType && guideStep !== 5 ? 'opacity-50 cursor-not-allowed' : ''
                } ${guideStep === 5 ? 'shadow-[0_0_20px_rgba(16,185,129,0.6),0_0_0_2px_white]' : ''}`}
              >
                <span className="text-white font-bold text-[16px] tracking-widest">看跌</span>
                <TrendingDown size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className={`flex justify-between items-center px-1 transition-opacity duration-300 ${[1, 3, 5].includes(guideStep) ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className="text-[12px]">
              <span className="text-[#8a8a93]">投资收益 </span>
              <span className="text-[#10b981] font-bold font-mono">+88% +18800</span>
            </div>
            <div className="text-[12px] flex items-center gap-1.5">
              <div className="w-[14px] h-[14px] rounded-full border border-[#10b981] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
              </div>
              <span className="text-[#8a8a93]">账户资金: </span>
              <span className="text-[#f7931a] font-bold font-mono">500,000.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Step 2: Time Selection Bottom Sheet */}
      <AnimatePresence>
        {guideStep === 2 && (
          <div className="absolute inset-0 z-[100] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setGuideStep(3);
              }}
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full bg-[#1c1c24] rounded-t-[24px] pb-[calc(2rem+80px)] pt-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
            >
              <h3 className="text-[18px] font-bold text-white px-6 mb-4 flex items-center justify-between">
                <span>请选择到期时间</span>
                <span className="text-[14px] font-normal text-[#8a8a93]">当前选择: <span className="text-[#6c48f5] font-medium">30S</span></span>
              </h3>
              <div className="flex flex-col mb-6 px-4 gap-2">
                {['30S', '1min(60s)', '3min(180s)', '5min(300s)'].map((time, idx) => (
                  <div 
                    key={time} 
                    className={`py-4 px-6 rounded-xl text-center text-[16px] transition-all cursor-pointer border ${
                      idx === 0 
                        ? 'bg-[#6c48f5]/10 text-[#6c48f5] font-medium border-[#6c48f5]/50 shadow-[0_0_15px_rgba(108,72,245,0.15)]' 
                        : 'bg-[#23232c] text-white/80 border-transparent hover:bg-[#2a2a35]'
                    }`}
                  >
                    {time}
                  </div>
                ))}
              </div>
              <div className="px-6 pb-2">
                <button 
                  onClick={() => {
                    setGuideStep(3);
                  }}
                  className="w-full h-[52px] bg-[#6c48f5] hover:bg-[#5a3cd1] text-white rounded-[26px] font-bold text-[18px] transition-colors shadow-[0_4px_12px_rgba(108,72,245,0.4)]"
                >
                  确认
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guide Step 4: Custom Numeric Keyboard */}
      <AnimatePresence>
        {guideStep === 4 && (
          <div className="absolute inset-0 z-[100] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setGuideStep(5);
              }}
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full bg-[#1a1a24] rounded-t-[24px] pb-[calc(2rem+80px)] pt-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
            >
              <div className="flex justify-between items-center px-6 mb-4">
                <h3 className="text-[16px] font-medium text-white/80">修改投资金额</h3>
                <span className="text-[#10b981] font-bold text-[20px]">100,000</span>
              </div>
              <div className="grid grid-cols-3 gap-[1px] bg-black/50 p-[1px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'DEL'].map((key) => (
                  <div 
                    key={key} 
                    className="bg-[#23232c] h-[56px] flex items-center justify-center text-white text-[20px] font-medium active:bg-[#32323e] cursor-pointer"
                  >
                    {key === 'DEL' ? <span className="text-[16px]">删除</span> : key}
                  </div>
                ))}
              </div>
              <div className="px-6 pt-4 pb-2">
                <button 
                  onClick={() => {
                    setGuideStep(5);
                  }}
                  className="w-full h-[52px] bg-[#6c48f5] hover:bg-[#5a3cd1] text-white rounded-[26px] font-bold text-[18px] transition-colors shadow-[0_4px_12px_rgba(108,72,245,0.4)]"
                >
                  确认金额
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guide Step 6: Success Modal */}
      <AnimatePresence>
        {guideStep === 6 && (
          <div className="absolute inset-0 z-[120] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full bg-[#1c1c24] rounded-[24px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#10b981]/20 flex items-center justify-center mb-5">
                <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-white text-[20px] font-bold mb-3">下单成功</h3>
              <p className="text-white/70 text-[15px] leading-relaxed mb-8">
                恭喜你，完成了第一笔交易。<br/>
                现在只需等时间到期，看最终结果，中途涨跌不用管。
              </p>
              <button 
                onClick={() => {
                  setGuideStep(0);
                  sessionStorage.removeItem('tradeGuideStarted');
                }}
                className="w-full h-[52px] bg-white text-black rounded-full font-bold text-[16px] transition-colors hover:bg-gray-200 shadow-[0_4px_15px_rgba(255,255,255,0.2)]"
              >
                知道了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}