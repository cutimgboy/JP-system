import { ArrowLeft, Battery, Wifi, Signal, Plus } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';

export function Withdraw() {
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
          <h1 className="text-white text-base font-medium">提取资金</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm">选择或添加银行卡进行提现</p>
        </div>

        {/* Add Bank Card Button */}
        <button className="w-full bg-[#1f2633] rounded-xl p-6 border-2 border-dashed border-gray-700/50 hover:border-teal-500/50 transition-colors mb-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-teal-400" />
            </div>
            <span className="text-white font-medium">添加银行卡</span>
            <span className="text-gray-400 text-sm">绑定您的银行卡以便快速提现</span>
          </div>
        </button>

        {/* Info Card */}
        <div className="bg-[#1f2633] rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-white font-medium mb-4">提现说明</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-gray-300 text-sm">
              <span className="text-teal-400 mt-0.5">•</span>
              <span>提现申请将在24小时内处理</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300 text-sm">
              <span className="text-teal-400 mt-0.5">•</span>
              <span>单笔提现最低金额为100元</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300 text-sm">
              <span className="text-teal-400 mt-0.5">•</span>
              <span>提现需要完成身份验证</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300 text-sm">
              <span className="text-teal-400 mt-0.5">•</span>
              <span>请确保银行卡信息与实名认证信息一致</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
