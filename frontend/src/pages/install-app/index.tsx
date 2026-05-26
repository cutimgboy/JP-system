import { useEffect, useState } from 'react';
import {
  Book,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Home,
  Lock,
  MonitorSmartphone,
  MoreVertical,
  PlusSquare,
  RefreshCw,
  Search,
  Share,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export function InstallApp() {
  const navigate = useNavigate();
  const [browser, setBrowser] = useState<'safari' | 'chrome'>('safari');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('chrome') || ua.includes('crios')) {
      setBrowser('chrome');
    } else if (ua.includes('safari')) {
      setBrowser('safari');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">安装APP应用</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-10 pt-6">
        <div className="relative mb-6 flex rounded-[14px] border border-white/5 bg-[#14141c] p-1">
          <motion.div
            className="absolute inset-y-1 w-[calc(50%-4px)] rounded-[10px] bg-[#2a2a36] shadow-sm"
            initial={false}
            animate={{
              x: browser === 'safari' ? 0 : '100%',
              marginLeft: browser === 'safari' ? '4px' : '0px',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => setBrowser('safari')}
            className={`relative z-10 flex-1 rounded-[10px] py-2.5 text-[14px] font-medium transition-colors ${
              browser === 'safari' ? 'text-white' : 'text-[#8a8a93] hover:text-white/80'
            }`}
          >
            Safari浏览器
          </button>
          <button
            onClick={() => setBrowser('chrome')}
            className={`relative z-10 flex-1 rounded-[10px] py-2.5 text-[14px] font-medium transition-colors ${
              browser === 'chrome' ? 'text-white' : 'text-[#8a8a93] hover:text-white/80'
            }`}
          >
            谷歌浏览器
          </button>
        </div>

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
                  <div className="flex h-[60px] w-full items-center justify-between border-t border-white/5 bg-[#1a1a24] px-6">
                    <ChevronLeft size={22} className="text-[#8a8a93]" />
                    <ChevronRight size={22} className="text-[#8a8a93]/30" />
                    <div className="relative">
                      <Share size={24} className="text-[#6c48f5]" />
                      <span className="absolute -right-1 -top-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6c48f5] opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#6c48f5]" />
                      </span>
                    </div>
                    <Book size={22} className="text-[#8a8a93]" />
                    <Copy size={22} className="text-[#8a8a93]" />
                  </div>
                </StepCard>

                <StepCard number={2} title="点击“添加到主屏幕”" description="在弹出的菜单中，向上滑动找到并点击该选项">
                  <div className="bg-[#1a1a24] p-2">
                    <div className="overflow-hidden rounded-[14px] bg-[#2a2a36]">
                      <MenuRow icon={Copy} label="拷贝" />
                      <div className="relative flex items-center justify-between bg-[#6c48f5]/15 px-4 py-3.5">
                        <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#6c48f5]" />
                        <span className="ml-1 text-[15px] font-medium text-[#a58dff]">添加到主屏幕</span>
                        <PlusSquare size={20} className="text-[#a58dff]" />
                      </div>
                      <MenuRow icon={Search} label="在网页中查找" />
                    </div>
                  </div>
                </StepCard>
              </>
            ) : (
              <>
                <StepCard number={1} title="点击右上角的菜单按钮">
                  <div className="flex h-[60px] w-full items-center gap-3 border-b border-white/5 bg-[#1a1a24] px-4">
                    <Home size={20} className="text-[#8a8a93]" />
                    <div className="flex h-[36px] flex-1 items-center justify-center rounded-full border border-white/5 bg-[#2a2a36] px-3">
                      <Lock size={14} className="mr-1.5 text-[#8a8a93]" />
                      <span className="text-[14px] text-white/80">trading.app</span>
                    </div>
                    <div className="relative p-1">
                      <MoreVertical size={24} className="text-[#6c48f5]" />
                      <span className="absolute right-1 top-1 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6c48f5] opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#6c48f5]" />
                      </span>
                    </div>
                  </div>
                </StepCard>

                <StepCard number={2} title="点击“添加到主屏幕”" description="在下拉菜单中找到此选项以安装">
                  <div className="relative h-[180px] bg-[#1a1a24] p-3">
                    <div className="ml-auto w-[220px] rounded-[16px] border border-white/10 bg-[#2a2a36] py-1.5 shadow-xl">
                      <MenuRow icon={Star} label="添加书签" />
                      <MenuRow icon={Download} label="下载此网页" />
                      <div className="relative flex items-center gap-3 bg-[#6c48f5]/15 px-4 py-3">
                        <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#6c48f5]" />
                        <MonitorSmartphone size={18} className="ml-1 text-[#a58dff]" />
                        <span className="text-[14px] font-medium text-[#a58dff]">添加到主屏幕</span>
                      </div>
                      <MenuRow icon={RefreshCw} label="重新加载" />
                    </div>
                  </div>
                </StepCard>
              </>
            )}

            <StepCard number={3} title="开始交易" description="回到手机桌面，点击图标即可快速访问">
              <div className="flex justify-center bg-[#1a1a24] py-8">
                <div className="grid max-w-[300px] grid-cols-4 gap-x-6 gap-y-4 px-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex flex-col items-center gap-2">
                      <div
                        className={`h-[56px] w-[56px] rounded-[14px] ${
                          item === 3
                            ? 'flex items-center justify-center border border-white/10 bg-gradient-to-br from-[#6c48f5] to-[#4b2eb3] shadow-[0_4px_16px_rgba(108,72,245,0.4)]'
                            : 'border border-white/5 bg-[#2a2a36]'
                        }`}
                      >
                        {item === 3 ? (
                          <div className="relative">
                            <TrendingUp size={28} className="text-white" strokeWidth={2.5} />
                            <div className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-[#a58dff] shadow-[0_0_8px_#a58dff]" />
                          </div>
                        ) : null}
                      </div>
                      <span className="text-[11px] font-medium text-white/80">{item === 3 ? 'Trading' : 'App'}</span>
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

function StepCard({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-white/5 bg-[#14141c] p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6c48f5]/20 text-[12px] font-bold text-[#a58dff]">
          {number}
        </div>
        <div>
          <h3 className="mb-1 text-[15px] font-medium text-white/90">{title}</h3>
          {description ? <p className="text-[13px] leading-relaxed text-[#8a8a93]">{description}</p> : null}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[16px] border border-white/5 bg-[#09090b]">{children}</div>
    </div>
  );
}

function MenuRow({ icon: Icon, label }: { icon: typeof Copy; label: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5 last:border-b-0">
      <Icon size={20} className="text-[#8a8a93]" />
      <span className="text-[15px] text-white/90">{label}</span>
    </div>
  );
}
