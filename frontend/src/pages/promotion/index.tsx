import { ArrowLeft, Battery, Wifi, Signal } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';

export function Promotion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1f2e] pb-16">
      {/* Status Bar */}
      <div className="bg-[#141820] px-4 pt-3 pb-2">
        <div className="flex items-center justify-between text-xs">
          <div className="text-white">12:00</div>
          <div className="flex items-center gap-1 text-white">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="bg-[#141820] px-4 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-center relative">
          <button
            onClick={() => navigate('/profile')}
            className="absolute left-0 w-9 h-9 flex items-center justify-center hover:bg-gray-700/30 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-white text-base font-medium">活动详情</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        {/* Main Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 mb-6 shadow-lg">
          <div className="text-center">
            <div className="text-white text-3xl font-bold mb-3">🎉 入金送500%现金</div>
            <div className="text-blue-100 text-lg mb-4">限时优惠，机不可失</div>
            <div className="text-white/90 text-sm">活动时间：2024.02.01 - 2024.02.29</div>
          </div>
        </div>

        {/* Activity Details */}
        <div className="bg-[#1f2633] rounded-xl p-6 border border-gray-700/50 mb-4">
          <h3 className="text-white font-medium mb-4 text-lg">活动规则</h3>
          <div className="space-y-4">
            <div>
              <div className="text-blue-400 font-medium mb-2">💰 充值奖励</div>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>充值 1,000 元，额外赠送 500 元（50%）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>充值 5,000 元，额外赠送 3,000 元（60%）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>充值 10,000 元，额外赠送 8,000 元（80%）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>充值 50,000 元及以上，额外赠送 500%</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-700/50 pt-4">
              <div className="text-purple-400 font-medium mb-2">🎁 参与条件</div>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>活动期间首次充值用户可享受最高奖励</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>赠送金额将在充值成功后立即到账</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>赠送金额可用于交易，盈利可提现</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-700/50 pt-4">
              <div className="text-yellow-400 font-medium mb-2">⚠️ 注意事项</div>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>每个账户仅限参与一次</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>活动最终解释权归平台所有</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>如有疑问请联系客服</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/deposit')}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          立即参与活动
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
