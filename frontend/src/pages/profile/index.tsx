import {
  ChevronRight,
  Crown,
  ShieldCheck,
  Zap,
  Globe,
  Download,
  Upload,
  FileText,
  Landmark,
  User,
  Bell,
  Smartphone,
  Lock,
  Info,
  TrendingUp,
  CircleDollarSign,
  Gift,
  Headphones
} from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { PageHeader } from '../../components/PageHeader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-[48px] h-[48px] shrink-0 rounded-[14px] bg-gradient-to-br from-[#6c48f5]/20 via-[#6c48f5]/10 to-[#14141c] border border-[#6c48f5]/30 flex items-center justify-center shadow-[0_4px_16px_rgba(108,72,245,0.15)] group-hover:shadow-[0_4px_20px_rgba(108,72,245,0.25)] transition-shadow duration-300">
    <div className="absolute inset-0 bg-[#6c48f5] opacity-[0.15] blur-xl rounded-full" />
    <div className="relative z-10 text-[#a58dff]">
      {children}
    </div>
  </div>
);

const highlights = [
  {
    title: "全网最高收益率 +92.00%",
    desc: "作为行业领先的二元期权平台，为您提供全网极具竞争力92.%收益，让您的决策更具价值。",
    icon: () => (
      <IconWrapper>
        <TrendingUp size={24} strokeWidth={2} />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#a58dff] rounded-full shadow-[0_0_8px_#a58dff] animate-pulse" />
      </IconWrapper>
    )
  },
  {
    title: "0交易手续费用",
    desc: "平台不收取任何交易手续费，无论交易品种与频次，您的成本始终为零。",
    icon: () => (
      <IconWrapper>
        <CircleDollarSign size={24} strokeWidth={2} />
      </IconWrapper>
    )
  },
  {
    title: "资金安全，全球合规",
    desc: "您的资金享有高标准托管机制，遵循全球多重监管要求，层层防护，确保交易环境安全可靠。",
    icon: () => (
      <IconWrapper>
        <ShieldCheck size={24} strokeWidth={2} />
      </IconWrapper>
    )
  },
  {
    title: "0延迟下单，抓住每一秒波动",
    desc: "依托毫秒级撮合系统与实时数据对接，订单执行近乎无延迟，助您精准捕捉瞬息万变的市场波动。",
    icon: () => (
      <IconWrapper>
        <Zap size={24} strokeWidth={2} />
      </IconWrapper>
    )
  },
  {
    title: "全球热门资产，一键交易",
    desc: "汇聚全球热门资产，一屏尽览投资机会。无论黄金、比特币还是纳指，都在你掌控之中。",
    icon: () => (
      <IconWrapper>
        <Globe size={24} strokeWidth={2} />
      </IconWrapper>
    )
  }
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % highlights.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] pb-28">
      {/* Header - Fixed */}
      <PageHeader />

      {/* Content with top padding to account for fixed header */}
      <div className="pt-[120px]">
        <div className="px-4 flex flex-col gap-4 mt-2">

          {/* Module 1: Highlights Carousel */}
          <div className="bg-[#14141c] rounded-[24px] px-5 py-3.5 relative overflow-hidden border-[0.5px] border-white/5 shadow-md">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-[#8a8a93] text-[13px] font-medium">
                <div className="bg-white/5 p-1 rounded-md border border-white/10 flex items-center justify-center shadow-sm">
                  <Crown size={14} className="text-[#8a8a93]" />
                </div>
                尊享特权
              </div>
              <span className="text-[#8a8a93] text-[12px]">3048723人已获得</span>
            </div>

            <div className="relative h-[76px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex gap-5 items-center group"
                >
                  {(() => {
                    const Icon = highlights[currentSlide].icon;
                    return <div className="scale-100 shrink-0"><Icon /></div>;
                  })()}
                  <div className="flex flex-col justify-center flex-1 pr-1">
                    <h3 className="text-[15px] font-bold mb-1 tracking-tight text-white">{highlights[currentSlide].title}</h3>
                    <p className="text-[#8a8a93] text-[12px] leading-snug line-clamp-2">
                      {highlights[currentSlide].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-2.5">
              {highlights.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Module 2: 4 Functional Entry Points */}
          <div className="bg-[#14141c] rounded-[20px] p-5 border-[0.5px] border-white/5 shadow-sm flex justify-between items-center">
            {[
              { icon: Download, label: '存入资金', path: '/deposit' },
              { icon: Upload, label: '提取资金', path: '/withdraw' },
              { icon: FileText, label: '资金记录', path: '/fund-records' },
              { icon: Landmark, label: '我的银行', path: '/my-bank' },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] rounded-[14px] bg-[#1a1a24] border border-white/5 flex items-center justify-center group-hover:bg-[#2a2a36] transition-colors shadow-sm">
                  <item.icon size={20} className="text-white" strokeWidth={1.5} />
                </div>
                <span className="text-[12px] font-medium text-white/90">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Module 3: Activity Banner */}
          <div
            onClick={() => navigate('/promotion')}
            className="relative h-[86px] rounded-[20px] overflow-hidden flex items-center justify-center border border-white/5 shadow-md cursor-pointer group"
          >
            <img
              src="/rujin.png"
              alt="入金交易，送5倍现金奖励"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Module 4: Other Entry Points List */}
          <div className="bg-[#14141c] rounded-[20px] px-4 py-2 border-[0.5px] border-white/5 shadow-sm">
            {[
              { icon: User, label: '个人资料', path: '/personal-info' },
              { icon: Bell, label: '消息中心', hasRedDot: true, path: '/message-center' },
              { icon: Smartphone, label: 'APP (IOS&Android)', path: '/install-app' },
              { icon: Lock, label: '修改密码', path: '/change-password' },
              { icon: Globe, label: '切换语言', path: '/change-language' },
              { icon: Info, label: '关于我们', path: '/about-us' },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(item.path)}
                className={`flex items-center justify-between py-4 cursor-pointer hover:bg-white/[0.02] -mx-4 px-4 transition-colors ${
                  idx !== 5 ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-[#8a8a93]" strokeWidth={1.5} />
                  <span className="text-[14px] font-medium text-white/90 relative">
                    {item.label}
                    {item.hasRedDot && (
                      <span className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                    )}
                  </span>
                </div>
                <ChevronRight size={16} className="text-[#8a8a93]" />
              </div>
            ))}
          </div>

        </div>
      </div>

      <BottomNav />
    </div>
  );
}
