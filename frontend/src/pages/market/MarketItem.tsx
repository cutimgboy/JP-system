import { ArrowUp, ArrowDown } from 'lucide-react';
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
      className="w-full bg-[#1f2633] rounded-lg p-4 flex items-center gap-3 hover:bg-[#252d3d] transition-colors text-left border border-gray-700/30"
      onClick={onClick}
    >
      <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src={icon} alt={symbol} className="w-6 h-6 object-contain" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-white">{symbol}</div>
        <div className="text-xs text-gray-400 truncate">{name}</div>
      </div>

      <MiniKLine isPositive={isPositive} />

      <div className="text-right min-w-[90px] flex-shrink-0">
        <div className="text-white">{price}</div>
        <div className={`text-xs flex items-center justify-end gap-1 ${isPositive ? 'text-red-400' : 'text-teal-400'}`}>
          {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {changePercent}
        </div>
      </div>
    </button>
  );
}
