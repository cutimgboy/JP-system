interface TradingControlsProps {
  selectedTime: string;
  investmentAmount: string;
  tradeStatus: 'idle' | 'bull' | 'bear' | 'completed';
  countdown: number;
  balance: number;
  expectedProfit: number;
  profitRate: number;
  actualProfitLoss: number;
  onTimeClick: () => void;
  onInvestmentChange: (value: string) => void;
  onBullTrade: () => void;
  onBearTrade: () => void;
  onResetTrade: () => void;
}

export function TradingControls({
  selectedTime,
  investmentAmount,
  tradeStatus,
  countdown,
  balance,
  expectedProfit,
  profitRate,
  actualProfitLoss,
  onTimeClick,
  onInvestmentChange,
  onBullTrade,
  onBearTrade,
  onResetTrade,
}: TradingControlsProps) {
  // 格式化数字显示
  const formatNumber = (num: number) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    return Math.floor(num).toLocaleString('en-US');
  };

  return (
    <div className="fixed bottom-[50px] left-0 right-0 z-20 bg-[#1a1f2e] pt-4">
      <div className="px-4 pb-4">
        <div className="bg-[#1f2633] rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            {/* Time and Investment - Single Row */}
          <div className="border border-gray-700/50 rounded-lg bg-[#141820] mb-3 flex items-center">
            <button 
              className={`flex items-center justify-between px-4 py-3 flex-1 rounded-l-lg transition-colors ${
                tradeStatus !== 'idle' 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-700/30 cursor-pointer'
              }`}
              onClick={onTimeClick}
              disabled={tradeStatus !== 'idle'}
            >
              <span className="text-sm text-gray-400">时间</span>
              <span className="text-sm text-white font-medium">{selectedTime}</span>
            </button>
            <div className="w-px h-6 bg-gray-700/50"></div>
            <label className={`flex items-center justify-between px-4 py-3 flex-1 rounded-r-lg transition-colors ${
              tradeStatus !== 'idle' 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-text hover:bg-gray-700/30'
            }`}>
              <span className="text-sm text-gray-400 whitespace-nowrap">投资</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={investmentAmount}
                onChange={(e) => {
                  if (tradeStatus === 'idle') {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    onInvestmentChange(value);
                  }
                }}
                disabled={tradeStatus !== 'idle'}
                className="text-sm text-white font-medium bg-transparent border-none outline-none text-right ml-2 whitespace-nowrap disabled:cursor-not-allowed"
                placeholder="100000"
                style={{ width: `${Math.max(investmentAmount.length || 6, 6)}ch` }}
              />
            </label>
          </div>

          {tradeStatus === 'idle' ? (
            // Buy/Sell Buttons - Default State
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button 
                className="bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm" 
                onClick={onBullTrade}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                <span>看涨</span>
              </button>
              <button 
                className="bg-teal-500 hover:bg-teal-600 text-white py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm" 
                onClick={onBearTrade}
              >
                <span>看跌</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                  <polyline points="17 18 23 18 23 12"></polyline>
                </svg>
              </button>
            </div>
          ) : tradeStatus === 'completed' ? (
            // Completed State - Reset Trade Button
            <button 
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm mb-3"
              onClick={onResetTrade}
            >
              <span className="font-medium">重新交易</span>
            </button>
          ) : (
            // Active Trade Status Bar - Countdown in progress
            <div className={`rounded-lg mb-3 shadow-sm ${
              tradeStatus === 'bull' 
                ? 'bg-gradient-to-r from-red-600 to-red-500' 
                : 'bg-gradient-to-r from-teal-600 to-teal-500'
            }`}>
              <div className="px-4 py-3.5 flex items-center justify-between">
                {/* Left side - Trade type with icon */}
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    {tradeStatus === 'bull' ? (
                      <>
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                      </>
                    ) : (
                      <>
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                        <polyline points="17 18 23 18 23 12"></polyline>
                      </>
                    )}
                  </svg>
                  <span className="text-white font-medium">
                    {tradeStatus === 'bull' ? '看涨' : '看跌'}
                  </span>
                </div>

                {/* Right side - Countdown */}
                <div className="text-white font-medium">
                  倒计时 {countdown}S
                </div>
              </div>
            </div>
          )}

          {/* Expected Return Info */}
          <div className="flex items-center justify-between text-xs">
            <div className={expectedProfit >= 0 ? "text-green-400" : "text-red-400"}>
              投资收益
              {tradeStatus === 'idle' ? (
                // 未投资时显示上一次的收益
                <span className="font-medium ml-1">
                  {expectedProfit === 0 ? '0' : (expectedProfit > 0 ? `+${formatNumber(expectedProfit)}` : formatNumber(expectedProfit))}
                </span>
              ) : tradeStatus === 'completed' ? (
                // 已完成显示实际收益
                <span className="font-medium ml-1">
                  {expectedProfit > 0 ? `+${formatNumber(expectedProfit)}` : formatNumber(expectedProfit)}
                </span>
              ) : (
                // 交易中显示预期收益
                <>
                  <span className="font-medium ml-1">+{profitRate}%</span>
                  <span className="font-medium ml-1">+{formatNumber(expectedProfit)}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
              <span className="whitespace-nowrap">账户余额: <span className="text-white">{formatNumber(balance)}</span></span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
