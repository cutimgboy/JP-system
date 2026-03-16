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

  // 格式化时间显示为秒数
  const formatTimeDisplay = (time: string) => {
    const [minutes, seconds] = time.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;
    return `${totalSeconds}s`;
  };

  return (
    <div className="fixed bottom-[92px] w-full px-4 z-40">
      <div className="bg-[#14141c]/95 backdrop-blur-xl rounded-[24px] p-4 border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {/* Inputs */}
        <div className="flex gap-3 mb-3">
          <div
            onClick={onTimeClick}
            className={`flex-1 bg-[#1a1a24] rounded-[16px] h-[48px] flex items-center justify-between px-4 border border-white/5 transition-colors ${
              tradeStatus !== 'idle'
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer focus-within:border-[#6c48f5]/50'
            }`}
          >
            <span className="text-[#8a8a93] text-[13px]">时间</span>
            <span className="text-white font-bold text-[16px]">{formatTimeDisplay(selectedTime)}</span>
          </div>
          <div className={`flex-[1.2] bg-[#1a1a24] rounded-[16px] h-[48px] flex items-center justify-between px-4 border border-white/5 transition-colors ${
            tradeStatus !== 'idle'
              ? 'opacity-50 cursor-not-allowed'
              : 'focus-within:border-[#6c48f5]/50'
          }`}>
            <span className="text-[#8a8a93] text-[13px]">投资</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={investmentAmount ? parseInt(investmentAmount).toLocaleString('en-US') : ''}
              onChange={(e) => {
                if (tradeStatus === 'idle') {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  onInvestmentChange(value);
                }
              }}
              disabled={tradeStatus !== 'idle'}
              className="bg-transparent text-right text-white font-bold text-[16px] w-[80px] outline-none font-mono disabled:cursor-not-allowed"
              placeholder="100000"
            />
          </div>
        </div>

        {tradeStatus === 'idle' ? (
          // Buy/Sell Buttons - Default State
          <div className="flex gap-3 mb-3">
            <button
              className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] transition-colors rounded-[16px] h-[52px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
              onClick={onBullTrade}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span className="text-white font-bold text-[16px] tracking-widest">看涨</span>
            </button>
            <button
              className="flex-1 bg-[#10b981] hover:bg-[#059669] transition-colors rounded-[16px] h-[52px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
              onClick={onBearTrade}
            >
              <span className="text-white font-bold text-[16px] tracking-widest">看跌</span>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </svg>
            </button>
          </div>
        ) : tradeStatus === 'completed' ? (
          // Completed State - Reset Trade Button
          <button
            className="w-full bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c] text-white py-3.5 rounded-[16px] transition-colors flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(239,68,68,0.2)] mb-3"
            onClick={onResetTrade}
          >
            <span className="font-medium">重新交易</span>
          </button>
        ) : (
          // Active Trade Status Bar - Countdown in progress
          <div className={`rounded-[16px] mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.2)] ${
            tradeStatus === 'bull'
              ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626]'
              : 'bg-gradient-to-r from-[#10b981] to-[#059669]'
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

        {/* Footer Info */}
        <div className="flex justify-between items-center px-1">
          <div className="text-[12px]">
            <span className="text-[#8a8a93]">投资收益 </span>
            <span className={`font-bold font-mono ${expectedProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {tradeStatus === 'idle' ? (
                expectedProfit === 0 ? '0' : (expectedProfit > 0 ? `+${formatNumber(expectedProfit)}` : formatNumber(expectedProfit))
              ) : tradeStatus === 'completed' ? (
                expectedProfit > 0 ? `+${formatNumber(expectedProfit)}` : formatNumber(expectedProfit)
              ) : (
                `+${profitRate}% +${formatNumber(expectedProfit)}`
              )}
            </span>
          </div>
          <div className="text-[12px] flex items-center gap-1.5">
            <div className="w-[14px] h-[14px] rounded-full border border-[#10b981] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
            </div>
            <span className="text-[#8a8a93]">账户资金: </span>
            <span className="text-[#f7931a] font-bold font-mono">{formatNumber(balance)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
