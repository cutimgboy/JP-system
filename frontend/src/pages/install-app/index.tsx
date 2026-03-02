import { ArrowLeft, Battery, Wifi, Signal, Download, Smartphone } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';

export function InstallApp() {
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
          <h1 className="text-white text-base font-medium">APP (IOS&Android)</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Smartphone className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">下载我们的移动应用</h2>
          <p className="text-gray-400 text-sm">随时随地进行交易，体验更流畅的移动端操作</p>
        </div>

        <div className="space-y-4">
          {/* iOS Download */}
          <button className="w-full bg-[#1f2633] rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-medium mb-1">iOS 版本</div>
                <div className="text-gray-400 text-sm">适用于 iPhone 和 iPad</div>
              </div>
              <Download className="w-6 h-6 text-blue-400" />
            </div>
          </button>

          {/* Android Download */}
          <button className="w-full bg-[#1f2633] rounded-xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 15.341c-.759 0-1.373.615-1.373 1.373s.614 1.373 1.373 1.373c.758 0 1.373-.615 1.373-1.373s-.615-1.373-1.373-1.373zm-11.046 0c-.758 0-1.373.615-1.373 1.373s.615 1.373 1.373 1.373c.759 0 1.373-.615 1.373-1.373s-.614-1.373-1.373-1.373zm13.118-7.341l1.605-2.781c.088-.152.035-.347-.117-.435-.152-.088-.347-.035-.435.117l-1.623 2.812c-1.329-.652-2.832-1.013-4.425-1.013s-3.096.361-4.425 1.013l-1.623-2.812c-.088-.152-.283-.205-.435-.117-.152.088-.205.283-.117.435l1.605 2.781c-2.754 1.411-4.606 4.181-4.606 7.373h19.2c0-3.192-1.852-5.962-4.606-7.373z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-medium mb-1">Android 版本</div>
                <div className="text-gray-400 text-sm">适用于 Android 设备</div>
              </div>
              <Download className="w-6 h-6 text-green-400" />
            </div>
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 bg-[#1f2633] rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-white font-medium mb-4">应用特性</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-gray-300 text-sm">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span>实时行情推送，把握每一个交易机会</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300 text-sm">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span>快速下单，流畅的交易体验</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300 text-sm">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span>安全可靠，多重加密保护</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300 text-sm">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span>支持生物识别登录，更加便捷</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
