import { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient, { extractData } from '../utils/api';

interface AccountSelectorProps {
  accountType: 'demo' | 'real';
  onAccountSwitch: (type: 'demo' | 'real') => void;
}

export function AccountSelector({ accountType, onAccountSwitch }: AccountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [demoBalance, setDemoBalance] = useState(0);
  const [realBalance, setRealBalance] = useState(0);

  // 获取账户余额
  const fetchBalances = async () => {
    try {
      // 获取模拟账户余额
      const demoResponse = await apiClient.get('/account/balance', {
        params: { accountType: 'demo' }
      });
      const demoData = extractData(demoResponse) || {};
      setDemoBalance(Number(demoData.balance || demoData.availableBalance || 0));

      // 获取真实账户余额
      const realResponse = await apiClient.get('/account/balance', {
        params: { accountType: 'real' }
      });
      const realData = extractData(realResponse) || {};
      setRealBalance(Number(realData.balance || realData.availableBalance || 0));
    } catch (error) {
      console.error('获取账户余额失败:', error);
    }
  };

  useEffect(() => {
    fetchBalances();
    // 每5秒刷新一次余额
    const interval = setInterval(fetchBalances, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const accounts = {
    demo: { id: 'demo' as const, label: '模拟', fullLabel: '模拟账户', balance: demoBalance },
    real: { id: 'real' as const, label: '真实', fullLabel: '真实账户', balance: realBalance },
  };

  const current = accounts[accountType];

  return (
    <div className="relative z-50 flex-1" ref={dropdownRef}>
      {/* Header trigger */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Circle Avatar */}
        <div className="w-[42px] h-[42px] rounded-full border border-white/20 flex items-center justify-center bg-transparent shrink-0">
          <span className="text-white text-[14px] font-medium">{current.label}</span>
        </div>

        {/* Text details */}
        <div className="flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8a8a93] text-[12px] font-medium tracking-wide">可用资金</span>
            <ChevronDown
              size={14}
              className={`text-[#8a8a93] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
          <span className="text-white text-[18px] font-bold leading-none font-mono tracking-tight">
            ${current.balance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 top-[calc(100%+16px)] w-[240px] bg-white rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="flex flex-col p-1">
              {Object.values(accounts).map((acc, index) => {
                const isSelected = accountType === acc.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      onAccountSwitch(acc.id);
                      setIsOpen(false);
                    }}
                    className={`
                      p-4 flex items-center justify-between cursor-pointer rounded-[20px] transition-colors
                      ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'}
                      ${index !== 0 ? 'mt-1' : ''}
                    `}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-semibold text-gray-900">{acc.fullLabel}</span>
                      <span className="text-[13px] font-mono font-medium text-gray-600">${acc.balance.toLocaleString()}</span>
                    </div>
                    {isSelected && (
                      <div className="w-[22px] h-[22px] rounded-full border-2 border-[#10b981] flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-[#10b981]" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
