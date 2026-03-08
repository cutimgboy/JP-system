import { ChevronRight, Shield, CircleArrowDown, CircleArrowUp, Receipt, Building2, Zap, Headphones, Gift } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { AccountHeader } from '../../components/AccountHeader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { accountType, setAccountType } = useAccount();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: 'top1',
      title: '全网最高收益率 +92.00%',
      description: '作为行业领先的二元期权平台，为您提供全网最具竞争力92.%收益，让您的决策更具价值。'
    },
    {
      icon: 'shield',
      title: '资金安全，全球合规',
      description: '您的资金享有高标准托管机制，遵循全球多重监管要求，层层防护，确保交易环境安全可靠。'
    },
    {
      icon: 'fast',
      title: '极速出入金，秒级到账',
      description: '支持多种支付方式，入金即时到账，提现快速处理，让您的资金流转更加便捷高效。'
    },
    {
      icon: 'support',
      title: '7×24小时专业客服',
      description: '全天候在线客服团队，随时为您解答疑问，提供专业的交易指导和技术支持服务。'
    },
    {
      icon: 'gift',
      title: '新人专享福利大礼包',
      description: '注册即送体验金，首次入金享受高额返利，更有多重优惠活动等您来领取。'
    }
  ];

  // 自动轮播功能 - 每3秒切换到下一个
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1f2e] pb-16">
      {/* Header */}
      <AccountHeader
        accountType={accountType}
        onAccountSwitch={setAccountType}
      />

      {/* Banner - 尊享特权营销位 */}
      <div className="px-4 pt-3 pb-3">
        <div className="bg-[#1f2633] rounded-xl p-4 shadow-sm border border-gray-700/50">
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
              <span className="text-sm text-gray-300">尊享特权</span>
            </div>
            <span className="text-xs text-gray-500">3048723人已获得</span>
          </div>

          {/* 内容区域 - 根据 currentSlide 显示不同内容 */}
          <div className="flex gap-4 h-24">
            {/* 左侧图标 - 固定尺寸容器 */}
            <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center">
              {currentSlide === 0 && (
                <div className="flex flex-col items-center justify-center">
                  <div className="text-5xl leading-none text-white mb-0.5">1</div>
                  <div className="text-sm text-gray-400">TOP</div>
                </div>
              )}
              {currentSlide === 1 && (
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <Shield className="w-16 h-16 text-white stroke-[1.5]" />
                    <svg className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
              )}
              {currentSlide === 2 && (
                <div className="flex items-center justify-center">
                  <Zap className="w-16 h-16 text-yellow-400 fill-yellow-400 stroke-[1.5]" />
                </div>
              )}
              {currentSlide === 3 && (
                <div className="flex items-center justify-center">
                  <Headphones className="w-16 h-16 text-blue-400 stroke-[1.5]" />
                </div>
              )}
              {currentSlide === 4 && (
                <div className="flex items-center justify-center">
                  <Gift className="w-16 h-16 text-pink-400 stroke-[1.5]" />
                </div>
              )}
            </div>

            {/* 右侧文字区域 - 固定高度 */}
            <div className="flex-1 flex flex-col justify-center">
              {/* 主标题 */}
              <h3 className="text-lg text-white mb-2">{slides[currentSlide].title}</h3>

              {/* 描述文字 */}
              <p className="text-xs text-gray-400 leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </div>
          </div>

          {/* 分页指示器 - 可点击 */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-blue-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/deposit')}
            className="flex flex-col items-center gap-2.5 hover:opacity-70 transition-opacity"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <CircleArrowDown className="w-7 h-7 text-blue-400 stroke-[2]" />
            </div>
            <span className="text-xs text-white">存入资金</span>
          </button>

          <button
            onClick={() => navigate('/withdraw')}
            className="flex flex-col items-center gap-2.5 hover:opacity-70 transition-opacity"
          >
            <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center">
              <CircleArrowUp className="w-7 h-7 text-teal-400 stroke-[2]" />
            </div>
            <span className="text-xs text-white">提取资金</span>
          </button>

          <button
            onClick={() => navigate('/fund-records')}
            className="flex flex-col items-center gap-2.5 hover:opacity-70 transition-opacity"
          >
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Receipt className="w-7 h-7 text-purple-400 stroke-[2]" />
            </div>
            <span className="text-xs text-white">资金记录</span>
          </button>

          <button
            onClick={() => navigate('/my-bank')}
            className="flex flex-col items-center gap-2.5 hover:opacity-70 transition-opacity"
          >
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-7 h-7 text-orange-400 stroke-[2]" />
            </div>
            <span className="text-xs text-white">我的银行</span>
          </button>
        </div>
      </div>

      {/* Activity Banner Placeholder */}
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate('/promotion')}
          className="w-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 border border-blue-500/50 flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-600/30"
        >
          <div className="text-center">
            <div className="text-white text-2xl font-bold mb-2">🎉 入金送500%现金</div>
            <div className="text-blue-100 text-sm">点击查看活动详情</div>
          </div>
        </button>
      </div>

      {/* Menu List */}
      <div className="px-4 pt-4 space-y-3">
        <button
          onClick={() => navigate('/personal-info')}
          className="w-full bg-[#1f2633] rounded-xl p-4 border border-gray-700/50 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <span className="text-white font-normal">个人资料</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => navigate('/message-center')}
          className="w-full bg-[#1f2633] rounded-xl p-4 border border-gray-700/50 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-normal">消息中心</span>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => navigate('/install-app')}
          className="w-full bg-[#1f2633] rounded-xl p-4 border border-gray-700/50 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <span className="text-white font-normal">APP (IOS&Android)</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => navigate('/change-language')}
          className="w-full bg-[#1f2633] rounded-xl p-4 border border-gray-700/50 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <span className="text-white font-normal">切换语言</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => navigate('/about-us')}
          className="w-full bg-[#1f2633] rounded-xl p-4 border border-gray-700/50 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <span className="text-white font-normal">关于我们</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
