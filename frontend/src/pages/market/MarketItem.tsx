import { TrendingUp, TrendingDown } from 'lucide-react';
import { MiniKLine } from './MiniKLine';

interface MarketItemProps {
  icon: string;
  symbol: string;
  name: string;
  price: string;
  change: number;
  changePercent: string;
  onClick?: () => void;
}

export function MarketItem({ icon, symbol, name, price, change, changePercent, onClick }: MarketItemProps) {
  const isPositive = change >= 0;

  return (
    <button
      className="w-full bg-[#14141c] rounded-[24px] p-[16px] flex items-center justify-between hover:bg-[#1a1a24] transition-colors text-left border border-white/5 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)]"
      onClick={onClick}
    >
      {/* 左侧：图标和名称 */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden shadow-[0px_10px_15px_0px_rgba(108,72,245,0.2),0px_4px_6px_0px_rgba(108,72,245,0.2)]">
          <img src={icon} alt={symbol} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col justify-center min-w-0">
          <h4 className="text-white text-[15px] font-semibold leading-[22.5px] tracking-[-0.23px] truncate">
            {symbol}
          </h4>
          <p className="text-[#6a7282] text-[11px] leading-[16.5px] tracking-[0.06px] truncate">
            {name}
          </p>
        </div>
      </div>

      {/* 中间：迷你图表 */}
      <div className="flex-1 min-w-[80px] max-w-[120px] mx-4">
        <MiniKLine isPositive={isPositive} />
      </div>

      {/* 右侧：价格和涨跌幅 */}
      <div className="flex flex-col items-end gap-0.5 min-w-[70px]">
        <p className="text-white text-[15px] font-semibold leading-[22.5px] tracking-[-0.23px]">
          $ {price}
        </p>
        <div className={`flex items-center gap-1 text-[10px] leading-[15px] tracking-[0.12px] ${
          isPositive ? 'text-[#ef4444]' : 'text-[#10b981]'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-2.5 h-2.5" strokeWidth={2} />
          ) : (
            <TrendingDown className="w-2.5 h-2.5" strokeWidth={2} />
          )}
          <span>{changePercent}</span>
        </div>
      </div>
    </button>
  );
}
