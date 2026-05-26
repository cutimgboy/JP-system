import { Crown, Calendar, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { AccountSelector, DepositButton } from '../../imports/RedesignTradingAppStyles';

const mockRankings = [
  { rank: 1, name: "Jans**", profit: "+đ 1800000", trades: 120, winRate: "58.00%" },
  { rank: 2, name: "Jans**", profit: "+đ 1800000", trades: 120, winRate: "58.00%" },
  { rank: 3, name: "Jans**", profit: "+đ 1800000", trades: 120, winRate: "58.00%" },
  { rank: 4, name: "Jans**", profit: "+đ 1800000", trades: 120, winRate: "58.00%" },
  { rank: 5, name: "Jans**", profit: "+đ 1800000", trades: 120, winRate: "58.00%" },
  { rank: 6, name: "Jans**", profit: "+đ 1800000", trades: 120, winRate: "58.00%" },
  { rank: 7, name: "Jans**", profit: "+đ 1800000", trades: 120, winRate: "58.00%" },
  { rank: 8, name: "Jans**", profit: "+đ 1800000", trades: 120, winRate: "58.00%" },
  { rank: 9, name: "Jans**", profit: "+đ 1800000", trades: 120, winRate: "58.00%" },
];

export function RankingPage() {
  const top1 = mockRankings[0];
  const top2 = mockRankings[1];
  const top3 = mockRankings[2];
  const rest = mockRankings.slice(3);

  return (
    <div className="absolute inset-0 bg-[#09090b] flex flex-col overflow-hidden text-white z-0 rounded-[36px]">
      <div className="flex-1 overflow-y-auto hide-scroll pb-[200px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        
        {/* Top Header Module */}
        <div className="pt-[24px] px-6 pb-2 flex justify-between items-center bg-[#09090b] sticky top-0 z-30">
          <AccountSelector />
          <DepositButton />
        </div>

        {/* Header Section */}
        <div className="pt-[16px] px-6">
          <h1 className="text-[32px] font-bold tracking-tight mb-2">24小时交易</h1>
          <p className="text-[#8a8a93] text-[14px] mb-4">
            对近24小时交易的客户，进行投资收益排行
          </p>
          <div className="flex items-center gap-4 text-[#8a8a93] text-[13px]">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>2025-12-22</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} />
              <span>213,290</span>
            </div>
          </div>
        </div>

        {/* Podium Section */}
        <div className="flex items-end justify-center gap-2 mt-8 mb-6 px-4">
          {/* Top 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center flex-1 pb-4"
          >
            <Crown size={24} className="text-[#94a3b8] mb-2 drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]" fill="currentColor" />
            <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-b from-[#94a3b8]/20 to-transparent border border-[#94a3b8]/40 flex items-center justify-center text-[18px] font-bold text-[#94a3b8] mb-3">
              2
            </div>
            <span className="font-semibold text-[14px] mb-1">{top2.name}</span>
            <span className="text-[#10b981] font-bold text-[13px] mb-1">{top2.profit}</span>
            <span className="text-[#8a8a93] text-[12px]">{top2.trades} &nbsp; {top2.winRate}</span>
          </motion.div>

          {/* Top 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center flex-1 relative z-10"
          >
            <Crown size={32} className="text-[#f59e0b] mb-2 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" fill="currentColor" />
            <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-b from-[#f59e0b]/20 to-[#f59e0b]/5 border-2 border-[#f59e0b]/50 flex items-center justify-center text-[24px] font-bold text-[#f59e0b] mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              1
            </div>
            <span className="font-semibold text-[15px] mb-1">{top1.name}</span>
            <span className="text-[#10b981] font-bold text-[14px] mb-1">{top1.profit}</span>
            <span className="text-[#8a8a93] text-[12px]">{top1.trades} &nbsp; {top1.winRate}</span>
          </motion.div>

          {/* Top 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center flex-1 pb-4"
          >
            <Crown size={24} className="text-[#b45309] mb-2 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" fill="currentColor" />
            <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-b from-[#b45309]/20 to-transparent border border-[#b45309]/40 flex items-center justify-center text-[18px] font-bold text-[#b45309] mb-3">
              3
            </div>
            <span className="font-semibold text-[14px] mb-1">{top3.name}</span>
            <span className="text-[#10b981] font-bold text-[13px] mb-1">{top3.profit}</span>
            <span className="text-[#8a8a93] text-[12px]">{top3.trades} &nbsp; {top3.winRate}</span>
          </motion.div>
        </div>

        {/* List Section */}
        <div className="px-4">
          {/* Table Header */}
          <div className="flex items-center bg-[#1a1a24] rounded-t-[16px] px-4 py-3 text-[12px] text-[#8a8a93] font-medium border-b border-white/5">
            <div className="w-[40px]">#</div>
            <div className="flex-1">用户</div>
            <div className="w-[60px] text-center">笔数</div>
            <div className="w-[70px] text-center">胜率</div>
            <div className="w-[90px] text-right">盈利</div>
          </div>

          {/* Table Body */}
          <div className="bg-[#14141c] rounded-b-[16px] border border-white/5 overflow-hidden flex flex-col">
            {rest.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                key={item.rank} 
                className="flex items-center px-4 py-4 border-b border-white/5 last:border-none hover:bg-white/5 transition-colors"
              >
                <div className="w-[40px] font-bold text-[#8a8a93]">{item.rank}</div>
                <div className="flex-1 font-semibold text-[14px]">{item.name}</div>
                <div className="w-[60px] text-center text-[13px] text-[#8a8a93]">{item.trades}</div>
                <div className="w-[70px] text-center text-[13px] text-[#8a8a93]">{item.winRate}</div>
                <div className="w-[90px] text-right font-bold text-[13px] text-[#10b981]">{item.profit}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
