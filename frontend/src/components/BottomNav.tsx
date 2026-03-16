import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, ArrowLeftRight, Trophy, Briefcase, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/market', label: '市场', icon: BarChart2 },
    { path: '/trading', label: '交易', icon: ArrowLeftRight },
    { path: '/community', label: '社区', icon: Trophy },
    { path: '/positions', label: '持仓', icon: Briefcase },
    { path: '/profile', label: '我的', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-4 pt-4 bg-gradient-to-t from-[#09090b] via-[rgba(9,9,11,0.9)] to-transparent">
      <div className="bg-[#18181b]/80 h-[81.5px] rounded-[30px] w-full flex items-center justify-between px-4 backdrop-blur-xl border border-white/5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-[60px] h-full cursor-pointer group"
            >
              <motion.div
                initial={false}
                animate={{
                  y: isActive ? -10 : 0,
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#fff' : '#8a8a93',
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20
                }}
                className="relative z-10 flex items-center justify-center h-[34px] w-[34px] rounded-[12px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-bg-rect"
                    className="absolute inset-0 bg-[#6c48f5] rounded-[12px] shadow-[0px_2px_8px_rgba(108,72,245,0.4)]"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? [1, 0.8, 1.1, 1] : 1
                  }}
                  transition={{
                    duration: 0.4,
                    times: [0, 0.3, 0.7, 1]
                  }}
                  className="relative z-10"
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
              </motion.div>

              <motion.span
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 5,
                  scale: isActive ? 1 : 0.9
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className="absolute bottom-4 text-[11px] font-medium text-white whitespace-nowrap"
              >
                {item.label}
              </motion.span>

              {!isActive && (
                <span className="absolute bottom-4 text-[10px] text-[#8a8a93] group-hover:text-white/70 transition-colors duration-200">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
