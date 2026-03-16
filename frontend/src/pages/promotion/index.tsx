import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Gift, ShieldCheck, Zap, Globe, TrendingUp, CircleDollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function Promotion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between px-6 shrink-0 z-20 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center -ml-3 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h1 className="font-medium text-[16px] tracking-wide">活动详情</h1>
        <div className="w-10" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[100px] pt-[60px]">

        {/* Hero Banner */}
        <div className="relative pt-6 pb-10 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6c48f5]/20 to-transparent pointer-events-none" />
          <div className="absolute right-[-40px] top-[-40px] w-[180px] h-[180px] bg-[#6c48f5] opacity-20 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-[#6c48f5] font-semibold text-[13px] tracking-wider uppercase flex items-center gap-1.5 mb-1">
              <Gift size={14} /> 新老用户专享
            </span>
            <h2 className="text-[34px] font-bold leading-[1.2] tracking-tight">
              入金送500%现金<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-[#34d399]">
                奖励到账即可提现
              </span>
            </h2>
            <p className="text-[#8a8a93] text-[13px] mt-2 leading-relaxed max-w-[280px]">
              参与入金活动，最高可获得 500% 现金返还，交易即可解锁，随时提现。
            </p>
          </div>
        </div>

        {/* Module 1: Tiers */}
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[4px] h-[16px] bg-[#6c48f5] rounded-full" />
            <h3 className="text-[18px] font-bold">入金奖励梯度</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { deposit: "500,000", reward: "100,000" },
              { deposit: "1,000,000", reward: "3,000,000" },
              { deposit: "2,000,000", reward: "8,000,000" },
              { deposit: "5,000,000", reward: "25,000,000" },
            ].map((tier, idx) => (
              <div key={idx} className="bg-[#14141c] border border-white/5 rounded-[20px] p-4 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#6c48f5]/10 rounded-full blur-[10px] group-hover:bg-[#6c48f5]/20 transition-colors" />
                <p className="text-[#8a8a93] text-[11px] mb-1">入金达</p>
                <p className="font-semibold text-[15px] mb-3">${tier.deposit}</p>
                <div className="w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent mb-3" />
                <p className="text-[#10b981] text-[11px] mb-0.5">可获得</p>
                <p className="font-bold text-[18px] text-[#10b981]">${tier.reward}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-[#1a1a24] rounded-xl px-4 py-3 flex items-start gap-3 border border-white/5">
            <CircleDollarSign size={18} className="text-[#f7931a] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#8a8a93] leading-[1.5]">
              <strong className="text-white font-medium">入金越多奖励越多，上不封顶。</strong> 充值金额可累计，达到对应梯度后系统自动发放奖励至您的账户中。
            </p>
          </div>
        </div>

        {/* Module 2: Recent Deposits Ticker */}
        <RecentDeposits />

        {/* Module 3: Weekly Ranking */}
        <div className="px-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[4px] h-[16px] bg-[#f7931a] rounded-full" />
            <h3 className="text-[18px] font-bold">本周入金排行</h3>
          </div>

          <div className="bg-[#14141c] border border-white/5 rounded-[24px] overflow-hidden">
            <div className="grid grid-cols-[1.2fr_2fr_3fr_2fr] gap-2 px-4 py-3 bg-white/[0.02] border-b border-white/5">
              <span className="text-[#8a8a93] text-[11px] text-center">排名</span>
              <span className="text-[#8a8a93] text-[11px]">用户</span>
              <span className="text-[#8a8a93] text-[11px] text-right">入金金额</span>
              <span className="text-[#8a8a93] text-[11px] text-right">已获奖励</span>
            </div>

            <div className="flex flex-col">
              {[
                { user: "A***8", deposit: "$6,250,000", reward: "$31M" },
                { user: "L***m", deposit: "$4,800,000", reward: "$24M" },
                { user: "W***x", deposit: "$2,100,000", reward: "$8.5M" },
                { user: "T***9", deposit: "$1,500,000", reward: "$4.5M" },
                { user: "J***1", deposit: "$850,000", reward: "$1.2M" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-[1.2fr_2fr_3fr_2fr] gap-2 px-4 py-3.5 border-b border-white/[0.03] last:border-0 items-center">
                  <div className="flex justify-center">
                    {i < 3 ? (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-black ${
                        i === 0 ? 'bg-gradient-to-br from-[#ffd700] to-[#f7931a]' :
                        i === 1 ? 'bg-gradient-to-br from-[#e0e0e0] to-[#99a1af]' :
                        'bg-gradient-to-br from-[#cd7f32] to-[#a0522d]'
                      }`}>
                        {i + 1}
                      </div>
                    ) : (
                      <span className="text-[#8a8a93] text-[12px] font-medium">{i + 1}</span>
                    )}
                  </div>
                  <span className="text-white text-[13px] font-medium">{row.user}</span>
                  <span className="text-white text-[13px] font-semibold text-right font-mono">{row.deposit}</span>
                  <span className="text-[#10b981] text-[13px] font-bold text-right font-mono">{row.reward}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module 4: Advantages */}
        <div className="px-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[4px] h-[16px] bg-[#155dfc] rounded-full" />
            <h3 className="text-[18px] font-bold">平台核心优势</h3>
          </div>

          <div className="flex flex-col gap-4">
            {[
              {
                icon: TrendingUp,
                color: "#10b981",
                title: "全网最高收益率 +92.00%",
                desc: "作为行业领先的二元期权平台，为您提供全网极具竞争力92.%收益，让您的决策更具价值。"
              },
              {
                icon: Zap,
                color: "#6c48f5",
                title: "0交易手续费用",
                desc: "平台不收取任何交易手续费，无论交易品种与频次，您的成本始终为零。"
              },
              {
                icon: ShieldCheck,
                color: "#155dfc",
                title: "资金安全，全球合规",
                desc: "您的资金享有高标准托管机制，遵循全球多重监管要求，层层防护，确保交易环境安全可靠。"
              },
              {
                icon: Zap,
                color: "#f7931a",
                title: "0延迟下单，抓住每一秒波动",
                desc: "依托毫秒级撮合系统与实时数据对接，订单执行近乎无延迟，助您精准捕捉瞬息万变的市场波动。"
              },
              {
                icon: Globe,
                color: "#ec4899",
                title: "全球热门资产，一键交易",
                desc: "汇聚全球热门资产，一屏尽览投资机会。无论黄金、比特币还是纳指，都在你掌控之中。"
              },
            ].map((adv, idx) => {
              const Icon = adv.icon;
              return (
                <div key={idx} className="bg-[#14141c] p-4 rounded-[20px] flex gap-4 border border-white/5">
                  <div
                    className="w-10 h-10 shrink-0 rounded-[12px] flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: `${adv.color}15` }}
                  >
                    <Icon size={20} color={adv.color} />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-[15px] font-semibold mb-1 text-white">{adv.title}</h4>
                    <p className="text-[#8a8a93] text-[12px] leading-relaxed">
                      {adv.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Bottom Fixed CTA */}
      <div className="fixed bottom-0 left-0 w-full p-6 pt-4 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent z-30">
        <button
          onClick={() => navigate('/deposit')}
          className="w-full h-[54px] bg-[#6c48f5] hover:bg-[#5a3ae0] transition-colors rounded-[20px] font-semibold text-[16px] text-white shadow-[0px_8px_20px_rgba(108,72,245,0.3)] flex items-center justify-center gap-2"
        >
          立即入金参与
          <ChevronLeft size={18} className="rotate-180" />
        </button>
      </div>

    </div>
  );
}

function RecentDeposits() {
  const [items, setItems] = useState([
    { id: 1, time: "09:30", user: "U***4", deposit: "500,000", reward: "100,000" },
    { id: 2, time: "09:28", user: "X***9", deposit: "1,200,000", reward: "3,600,000" },
    { id: 3, time: "09:25", user: "M***2", deposit: "50,000", reward: "10,000" },
    { id: 4, time: "09:21", user: "Y***7", deposit: "2,000,000", reward: "8,000,000" },
    { id: 5, time: "09:15", user: "L***1", deposit: "800,000", reward: "2,400,000" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setItems(prev => {
        const newItems = [...prev];
        const last = newItems.pop();
        if (last) {
          last.id = Date.now(); // Ensure unique key for animation
          newItems.unshift(last);
        }
        return newItems;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-6 mb-10">
      <div className="bg-[#14141c] border border-white/5 rounded-[20px] p-4">
        <h3 className="text-[14px] font-semibold mb-3 flex items-center gap-2 text-white/90">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          实时入金动态
        </h3>
        <div className="h-[120px] overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#14141c] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#14141c] to-transparent z-10 pointer-events-none" />

          <div className="flex flex-col gap-3 pt-2">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-3 text-[12px]"
                >
                  <span className="text-[#8a8a93] w-10 shrink-0">{item.time}</span>
                  <div className="flex-1 bg-white/[0.03] px-3 py-1.5 rounded-lg flex items-center justify-between">
                    <span className="text-[#d4d4d8]">
                      <span className="text-white font-medium">{item.user}</span> 入金 <span className="text-white font-mono">${item.deposit}</span>
                    </span>
                    <span className="text-[#10b981] font-medium shrink-0 ml-2">
                      获 ${item.reward}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
