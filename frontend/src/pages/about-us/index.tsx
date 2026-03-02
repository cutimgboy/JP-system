import { ArrowLeft, Battery, Wifi, Signal } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';

export function AboutUs() {
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
          <h1 className="text-white text-base font-medium">关于我们</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">FT</span>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Finance Trading</h2>
          <p className="text-gray-400 text-sm">版本 1.0.0</p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#1f2633] rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-white font-medium mb-3">关于平台</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              我们是一家专业的二元期权交易平台，致力于为全球用户提供安全、便捷、高效的交易服务。平台拥有先进的交易系统和专业的风控团队，确保每一笔交易的安全性和公平性。
            </p>
          </div>

          <div className="bg-[#1f2633] rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-white font-medium mb-3">联系我们</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">客服邮箱</span>
                <span className="text-gray-300">support@financetrading.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">客服热线</span>
                <span className="text-gray-300">400-888-8888</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">工作时间</span>
                <span className="text-gray-300">7×24小时</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1f2633] rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-white font-medium mb-3">法律信息</h3>
            <div className="space-y-2">
              <button className="w-full text-left text-gray-300 text-sm py-2 hover:text-white transition-colors">
                用户协议
              </button>
              <button className="w-full text-left text-gray-300 text-sm py-2 hover:text-white transition-colors">
                隐私政策
              </button>
              <button className="w-full text-left text-gray-300 text-sm py-2 hover:text-white transition-colors">
                风险提示
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
