import { useTradeColors } from '../../../contexts/TradeColorContext';

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
  guideStep?: number;
  onGuideStepChange?: (step: number) => void;
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
  guideStep = -1,
  onGuideStepChange,
}: TradingControlsProps) {
  const {
    getProfitTone,
    getTradeTone,
    getToneBgClass,
    getToneTextClass,
  } = useTradeColors();
  const bullTone = getTradeTone('bull');
  const bearTone = getTradeTone('bear');
  const expectedProfitTone = getProfitTone(expectedProfit);
  const activeTradeTone =
    tradeStatus === 'bull' || tradeStatus === 'bear'
      ? getTradeTone(tradeStatus)
      : 'red';

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
    <div className={`fixed bottom-[92px] w-full px-4 ${[1, 2, 3].includes(guideStep) ? 'z-[60]' : 'z-40'}`}>
      <div className="bg-[#14141c]/95 backdrop-blur-xl rounded-[24px] p-4 border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {/* Inputs */}
        <div className="flex gap-3 mb-3 relative">
          {guideStep === 1 && (
            <GuideBubble className="left-0 w-[52%]" onClick={() => onGuideStepChange?.(1)}>
              点击可设置到期时间
              <span className="block text-[12px] font-normal text-white/60">到期时间决定：多久之后来判断输赢</span>
            </GuideBubble>
          )}
          {guideStep === 2 && (
            <GuideBubble className="right-0 w-[55%]" onClick={() => onGuideStepChange?.(3)}>
              点击可设置投资金额
              <span className="block text-[12px] font-normal text-white/60">投资金额决定：这一单你可以盈利多少</span>
            </GuideBubble>
          )}
          <div
            onClick={() => {
              if (guideStep === 1) {
                onTimeClick();
                return;
              }
              if (guideStep < 0) {
                onTimeClick();
              }
            }}
            className={`flex-1 bg-[#1a1a24] rounded-[16px] h-[48px] flex items-center justify-between px-4 border border-white/5 transition-colors ${
              tradeStatus !== 'idle'
                ? 'opacity-50 cursor-not-allowed'
                : guideStep === 1
                  ? 'relative z-[65] cursor-pointer border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.55),0_0_0_2px_white]'
                  : guideStep > 0
                    ? 'opacity-40 pointer-events-none'
                    : 'cursor-pointer focus-within:border-[#6c48f5]/50'
            }`}
          >
            <span className={`text-[13px] ${guideStep === 1 ? 'text-black/60' : 'text-[#8a8a93]'}`}>时间</span>
            <span className={`font-bold text-[16px] ${guideStep === 1 ? 'text-black' : 'text-white'}`}>{formatTimeDisplay(selectedTime)}</span>
          </div>
          <div className={`flex-[1.2] bg-[#1a1a24] rounded-[16px] h-[48px] flex items-center justify-between px-4 border border-white/5 transition-colors ${
            tradeStatus !== 'idle'
              ? 'opacity-50 cursor-not-allowed'
              : guideStep === 2
                ? 'relative z-[65] border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.55),0_0_0_2px_white]'
                : guideStep > 0
                  ? 'opacity-40 pointer-events-none'
                  : 'focus-within:border-[#6c48f5]/50'
          }`}>
            <span className={`text-[13px] ${guideStep === 2 ? 'text-black/60' : 'text-[#8a8a93]'}`}>投资</span>
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
              onFocus={() => {
                if (guideStep === 2) {
                  onGuideStepChange?.(2);
                }
              }}
              onBlur={() => {
                if (guideStep === 2 && investmentAmount) {
                  onGuideStepChange?.(3);
                }
              }}
              disabled={tradeStatus !== 'idle'}
              className={`bg-transparent text-right font-bold text-[16px] w-[80px] outline-none font-mono disabled:cursor-not-allowed ${
                guideStep === 2 ? 'text-black' : 'text-white'
              }`}
              placeholder="100000"
            />
          </div>
        </div>

        {tradeStatus === 'idle' ? (
          // Buy/Sell Buttons - Default State
          <div className={`flex gap-3 mb-3 relative ${guideStep === 3 ? 'z-[65]' : guideStep > 0 ? 'opacity-40 pointer-events-none' : ''}`}>
            {guideStep === 3 && (
              <GuideBubble className="left-1/2 w-[80%] -translate-x-1/2" onClick={() => undefined}>
                选择看涨看跌方向
                <span className="block text-[12px] font-normal text-white/60">方向决定：到期时价格往哪边算你赢</span>
              </GuideBubble>
            )}
            <button
              className={`flex-1 ${getToneBgClass(bullTone)} transition-colors rounded-[16px] h-[52px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.18)] ${
                guideStep === 3 ? 'relative z-[66] shadow-[0_0_24px_rgba(239,68,68,0.72),0_0_0_2px_white]' : ''
              }`}
              onClick={onBullTrade}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span className="text-white font-bold text-[16px] tracking-widest">看涨</span>
            </button>
            <button
              className={`flex-1 ${getToneBgClass(bearTone)} transition-colors rounded-[16px] h-[52px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.18)] ${
                guideStep === 3 ? 'relative z-[66] shadow-[0_0_24px_rgba(16,185,129,0.72),0_0_0_2px_white]' : ''
              }`}
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
            className="w-full bg-[#6c48f5] text-white py-3.5 rounded-[16px] transition-colors flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(108,72,245,0.26)] mb-3"
            onClick={onResetTrade}
          >
            <span className="font-medium">重新交易</span>
          </button>
        ) : (
          // Active Trade Status Bar - Countdown in progress
          <div className={`rounded-[16px] mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.2)] ${getToneBgClass(activeTradeTone)}`}>
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
        <div className={`flex justify-between items-center px-1 ${guideStep > 0 ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="text-[12px]">
            <span className="text-[#8a8a93]">投资收益 </span>
            <span className={`font-bold font-mono ${getToneTextClass(expectedProfitTone)}`}>
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

function GuideBubble({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute bottom-[calc(100%+16px)] z-[80] rounded-2xl border border-white/15 bg-[#24242e]/98 px-4 py-3 text-left text-[14px] font-bold leading-relaxed text-white shadow-[0_14px_36px_rgba(0,0,0,0.62)] backdrop-blur-md ${className || ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          <span className="absolute h-full w-full animate-ping rounded-full bg-[#10b981]/30" />
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">⌁</span>
        </span>
        <span>{children}</span>
      </div>
    </button>
  );
}
