import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Building2,
  TrendingUp,
  CircleDollarSign,
  ShieldCheck,
  Moon,
  Zap,
  Percent,
  Globe,
  Scale,
  Users,
  Eye,
  Lightbulb,
  Trophy,
  Award,
  Shield,
  Star
} from "lucide-react";

const IconWrapper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative w-[40px] h-[40px] shrink-0 rounded-[12px] bg-gradient-to-br from-[#6c48f5]/20 via-[#6c48f5]/10 to-[#14141c] border border-[#6c48f5]/30 flex items-center justify-center shadow-[0_4px_16px_rgba(108,72,245,0.15)] ${className}`}>
    <div className="absolute inset-0 bg-[#6c48f5] opacity-[0.15] blur-xl rounded-full" />
    <div className="relative z-10 text-[#a58dff]">
      {children}
    </div>
  </div>
);

export function AboutUs() {
  const navigate = useNavigate();

  const advantages = [
    {
      title: "全网最高收益率 +92.00%",
      desc: "作为行业领先的二元期权平台，为您提供全网极具竞争力92.%收益，让您的决策更具价值。",
      icon: TrendingUp
    },
    {
      title: "0交易手续费用",
      desc: "平台不收取任何交易手续费，无论交易品种与频次，您的成本始终为零。",
      icon: CircleDollarSign
    },
    {
      title: "资金安全，全球合规",
      desc: "您的资金享有高标准托管机制，遵循全球多重监管要求，层层防护，确保交易环境安全可靠。",
      icon: ShieldCheck
    },
    {
      title: "0隔夜利息费用",
      desc: "持仓过夜无忧，多仓、空仓均不收取隔夜利息，让您灵活布局，不受时间束缚。",
      icon: Moon
    },
    {
      title: "0延迟下单，抓住每一秒波动",
      desc: "依托毫秒级撮合系统与实时数据对接，订单执行近乎无延迟，助您精准捕捉瞬息万变的市场波动。",
      icon: Zap
    },
    {
      title: "0交易佣金费用",
      desc: "交易无佣金，利润全额归属您，真正实现\"所见即所得\"。",
      icon: Percent
    },
    {
      title: "全球热门资产，一屏汇聚",
      desc: "汇聚全球热门资产，一屏尽览投资机会。无论黄金、比特币还是纳指，都在你掌控之中。",
      icon: Globe
    }
  ];

  const philosophies = [
    {
      title: "责任",
      desc: "交易涉及显著风险，我们对此非常重视。Mitrade Group通过多个司法管辖区的受权威监管实体运营，保持最高的安全、稳定和操作完整性标准。",
      icon: Scale
    },
    {
      title: "惠普",
      desc: "优先考虑易用性与包容性，以满足多样化的用户需求。无论您是在提升交易技能，还是执行更复杂的策略，提供所需工具与支持，助您实现交易目标。",
      icon: Users
    },
    {
      title: "透明",
      desc: "遵循严格的监管，确保公平透明的交易环境。提供产品、定价、执行数据和市场状况的全面信息，所有费用都提前清楚列出，以便您做出明智的决策。",
      icon: Eye
    },
    {
      title: "创新",
      desc: "持续提升执行速度、强化数据分析能力、打造更智能的交易平台。我们致力于引领金融科技行业发展，同时为交易者提供所需的竞争优势。",
      icon: Lightbulb
    }
  ];

  const awards = [
    { title: "全球最佳差价合约经纪商", org: "Global Business Review Magazine-2025", icon: Trophy },
    { title: "全球最佳数字化客户体验经纪商奖", org: "International Business Magazine-2025", icon: Award },
    { title: "最佳客户资金安全奖", org: "Word Business Star Magazine-2025", icon: Shield },
    { title: "外汇客户满意度和幸福度奖", org: "Global Banking and Finance Review", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between px-6 shrink-0 z-20 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 pt-2 pb-4 box-content">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center -ml-3 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h1 className="font-medium text-[16px] tracking-wide">关于我们</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto pb-10 pt-[108px]">
        {/* Module 1: Who are we */}
        <div className="px-5 mt-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#6c48f5]/20 to-[#14141c] border border-[#6c48f5]/30 flex items-center justify-center shadow-[0_0_20px_rgba(108,72,245,0.2)]">
              <Building2 size={24} className="text-[#a58dff]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">JMP Trading</h2>
              <p className="text-[#8a8a93] text-sm">助您成功是我们的工作</p>
            </div>
          </div>
          <div className="bg-[#14141c] rounded-[20px] p-5 border-[0.5px] border-white/5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6c48f5] opacity-5 blur-[60px] rounded-full" />
            <p className="text-[#8a8a93] text-[13px] leading-relaxed relative z-10">
              <span className="text-white font-medium">JMP Trading</span>是由权威机构授权监管的金融科技公司，专注于为投资者提供简单便捷的交易体验。创新型的多元化交易平台，屡次获得最佳移动交易平台、最具创新力券商等殊荣。<br/><br/>
              通过JMP Trading平台，您可以投资、交易更广泛的国际金融市场，涵盖股票、指数、商品、外汇等数百个热门品种。我们专注于提供超快执行速度和可靠的性能，并辅以全天候的客户服务支持，助力您及时把握投资、交易的良机。
            </p>
          </div>
        </div>

        {/* Module 2: Why choose us */}
        <div className="px-5 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            为什么选择 <span className="text-[#a58dff]">JMP Trading？</span>
          </h2>
          <div className="flex flex-col gap-3">
            {advantages.map((adv, idx) => (
              <div key={idx} className="bg-[#14141c] rounded-[20px] p-4 border-[0.5px] border-white/5 flex gap-4">
                <IconWrapper>
                  <adv.icon size={20} strokeWidth={2} />
                </IconWrapper>
                <div className="flex-1 pt-0.5">
                  <h3 className="text-[14px] font-semibold text-white/90 mb-1">{adv.title}</h3>
                  <p className="text-[#8a8a93] text-[12px] leading-relaxed">{adv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 3: Philosophy */}
        <div className="px-5 mb-8">
          <h2 className="text-lg font-bold mb-4">我们的理念</h2>
          <div className="grid grid-cols-2 gap-3">
            {philosophies.map((phil, idx) => (
              <div key={idx} className="bg-[#14141c] rounded-[20px] p-4 border-[0.5px] border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-white/5 p-1.5 rounded-lg border border-white/10">
                    <phil.icon size={16} className="text-[#a58dff]" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-white/90">{phil.title}</h3>
                </div>
                <p className="text-[#8a8a93] text-[11px] leading-[1.6]">{phil.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Module 4: Awards */}
        <div className="px-5 mb-12">
          <h2 className="text-lg font-bold mb-4">奖项及荣誉</h2>
          <div className="bg-[#14141c] rounded-[24px] p-5 border-[0.5px] border-white/5 mb-4">
            <p className="text-[#8a8a93] text-[13px] leading-relaxed">
              我们一向追求卓越，精益求精，致力为客户提供优质的交易服务。<span className="text-white/80">JMP Trading非常荣幸获得了行业内著名的机构所颁发的殊荣</span>，肯定了团队的一直努力及对客户的承担。
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {awards.map((award, idx) => (
              <div key={idx} className="bg-gradient-to-r from-[#14141c] to-transparent rounded-[16px] p-4 border-[0.5px] border-white/5 flex items-center gap-4 group hover:bg-[#1a1a24] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#6c48f5]/10 border border-[#6c48f5]/20 flex items-center justify-center shrink-0 group-hover:bg-[#6c48f5]/20 group-hover:shadow-[0_0_12px_rgba(108,72,245,0.3)] transition-all">
                  <award.icon size={18} className="text-[#a58dff]" />
                </div>
                <div>
                  <h3 className="text-[13px] font-medium text-white/90 mb-0.5 leading-snug">{award.title}</h3>
                  <p className="text-[#8a8a93] text-[11px]">{award.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
