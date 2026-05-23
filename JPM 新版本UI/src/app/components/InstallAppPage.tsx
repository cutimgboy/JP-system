import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ChevronLeft, 
  ChevronRight, 
  Share, 
  Book, 
  Copy, 
  PlusSquare, 
  Search,
  TrendingUp,
  Home,
  Lock,
  MoreVertical,
  Star,
  Download,
  MonitorSmartphone,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function InstallAppPage() {
  const navigate = useNavigate();
  const [browser, setBrowser] = useState<'safari' | 'chrome'>('safari');

  useEffect(() => {
    // Basic browser detection
    const ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('chrome') > -1 || ua.indexOf('crios') > -1) {
      setBrowser('chrome');
    } else if (ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1) {
      setBrowser('safari');
    }
  }, []);

  const StepCard = ({ number, title, description, children }: { number: number, title: string, description?: string, children: React.ReactNode }) => (
    <div className="bg-[#14141c] rounded-[20px] p-5 border border-white/5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-6 h-6 rounded-full bg-[#6c48f5]/20 text-[#a58dff] flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
          {number}
        </div>
        <div>
          <h3 className="text-[15px] font-medium text-white/90 mb-1">{title}</h3>
          {description && <p className="text-[13px] text-[#8a8a93] leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="bg-[#09090b] rounded-[16px] overflow-hidden border border-white/5 relative">
        {children}
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-[#09090b] flex flex-col text-white z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[60px] shrink-0 border-b border-white/5 relative z-10 bg-[#09090b]/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-medium text-white absolute left-1/2 -translate-x-1/2">
          安装APP应用
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-10">
        
        {/* Segmented Control */}
        <div className="flex bg-[#14141c] p-1 rounded-[14px] mb-6 border border-white/5 relative">
          {/* Animated Background Pill */}
          <motion.div 
            className="absolute inset-y-1 w-[calc(50%-4px)] bg-[#2a2a36] rounded-[10px] shadow-sm"
            initial={false}
            animate={{ 
              x: browser === 'safari' ? 0 : '100%',
              marginLeft: browser === 'safari' ? '4px' : '0px'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          <button 
            onClick={() => setBrowser('safari')}
            className={`relative z-10 flex-1 py-2.5 text-[14px] font-medium rounded-[10px] transition-colors ${
              browser === 'safari' ? 'text-white' : 'text-[#8a8a93] hover:text-white/80'
            }`}
          >
            Safari浏览器
          </button>
          <button 
            onClick={() => setBrowser('chrome')}
            className={`relative z-10 flex-1 py-2.5 text-[14px] font-medium rounded-[10px] transition-colors ${
              browser === 'chrome' ? 'text-white' : 'text-[#8a8a93] hover:text-white/80'
            }`}
          >
            谷歌浏览器
          </button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={browser}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {browser === 'safari' ? (
              <>
                <StepCard number={1} title="点击底部栏中间的分享按钮">
                  <div className="w-full h-[60px] bg-[#1a1a24] flex items-center justify-between px-6 border-t border-white/5 relative bottom-0">
                    <ChevronLeft size={22} className="text-[#8a8a93]" />
                    <ChevronRight size={22} className="text-[#8a8a93]/30" />
                    <div className="relative">
                      <Share size={24} className="text-[#6c48f5]" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6c48f5] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#6c48f5]"></span>
                      </span>
                    </div>
                    <Book size={22} className="text-[#8a8a93]" />
                    <Copy size={22} className="text-[#8a8a93]" />
                  </div>
                </StepCard>

                <StepCard number={2} title="点击“添加到主屏幕”" description="在弹出的菜单中，向上滑动找到并点击该选项">
                  <div className="w-full bg-[#1a1a24] p-2">
                    <div className="bg-[#2a2a36] rounded-[14px] overflow-hidden">
                      <div className="px-4 py-3.5 border-b border-white/5 flex items-center gap-3">
                        <Copy size={20} className="text-[#8a8a93]" />
                        <span className="text-[15px] text-white/90">拷贝</span>
                      </div>
                      <div className="px-4 py-3.5 bg-[#6c48f5]/15 flex items-center justify-between relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6c48f5]"></div>
                        <span className="text-[15px] text-[#a58dff] font-medium ml-1">添加到主屏幕</span>
                        <PlusSquare size={20} className="text-[#a58dff]" />
                      </div>
                      <div className="px-4 py-3.5 border-t border-white/5 flex items-center gap-3">
                        <Search size={20} className="text-[#8a8a93]" />
                        <span className="text-[15px] text-white/90">在网页中查找</span>
                      </div>
                    </div>
                  </div>
                </StepCard>
              </>
            ) : (
              <>
                <StepCard number={1} title="点击右上角的菜单按钮">
                  <div className="w-full h-[60px] bg-[#1a1a24] flex items-center px-4 gap-3 border-b border-white/5">
                    <Home size={20} className="text-[#8a8a93]" />
                    <div className="flex-1 h-[36px] bg-[#2a2a36] rounded-full flex items-center justify-center px-3 border border-white/5">
                      <Lock size={14} className="text-[#8a8a93] mr-1.5" />
                      <span className="text-[14px] text-white/80">trading.app</span>
                    </div>
                    <div className="relative p-1">
                      <MoreVertical size={24} className="text-[#6c48f5]" />
                      <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6c48f5] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6c48f5]"></span>
                      </span>
                    </div>
                  </div>
                </StepCard>

                <StepCard number={2} title="点击“添加到主屏幕”" description="在下拉菜单中找到此选项以安装">
                  <div className="w-full h-[180px] bg-[#1a1a24] relative p-3">
                    <div className="w-[220px] bg-[#2a2a36] rounded-[16px] py-1.5 shadow-xl ml-auto border border-white/10">
                      <div className="px-4 py-3 flex items-center gap-3">
                        <Star size={18} className="text-[#8a8a93]" />
                        <span className="text-[14px] text-white/90">添加书签</span>
                      </div>
                      <div className="px-4 py-3 flex items-center gap-3">
                        <Download size={18} className="text-[#8a8a93]" />
                        <span className="text-[14px] text-white/90">下载此网页</span>
                      </div>
                      <div className="px-4 py-3 bg-[#6c48f5]/15 flex items-center gap-3 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6c48f5]"></div>
                        <MonitorSmartphone size={18} className="text-[#a58dff] ml-1" />
                        <span className="text-[14px] text-[#a58dff] font-medium">添加到主屏幕</span>
                      </div>
                      <div className="px-4 py-3 flex items-center gap-3">
                        <RefreshCw size={18} className="text-[#8a8a93]" />
                        <span className="text-[14px] text-white/90">重新加载</span>
                      </div>
                    </div>
                  </div>
                </StepCard>
              </>
            )}

            {/* Common Step 3 */}
            <StepCard number={3} title="开始交易" description="回到手机桌面，点击图标即可快速访问">
              <div className="w-full py-8 bg-[#1a1a24] flex justify-center">
                <div className="grid grid-cols-4 gap-x-6 gap-y-4 px-6 max-w-[300px]">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-[56px] h-[56px] rounded-[14px] ${
                        i === 3 
                          ? 'bg-gradient-to-br from-[#6c48f5] to-[#4b2eb3] shadow-[0_4px_16px_rgba(108,72,245,0.4)] flex items-center justify-center border border-white/10' 
                          : 'bg-[#2a2a36] border border-white/5'
                      }`}>
                        {i === 3 && (
                          <div className="relative">
                            <TrendingUp size={28} className="text-white" strokeWidth={2.5} />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#a58dff] rounded-full shadow-[0_0_8px_#a58dff] animate-pulse" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-white/80">{i === 3 ? 'Trading' : 'App'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </StepCard>

          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
