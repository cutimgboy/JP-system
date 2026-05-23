import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type TradeColorMode = 'red-up-green-down' | 'red-down-green-up';
type Tone = 'red' | 'green';

interface TradeColorContextType {
  mode: TradeColorMode;
  isReversed: boolean;
  setIsReversed: (value: boolean) => void;
  toggleColorMode: () => void;
  getTrendTone: (isUp: boolean) => Tone;
  getProfitTone: (value: number) => Tone;
  getTradeTone: (tradeType: 'bull' | 'bear') => Tone;
  getToneColor: (tone: Tone) => string;
  getToneTextClass: (tone: Tone) => string;
  getToneBgClass: (tone: Tone) => string;
  getToneBorderClass: (tone: Tone) => string;
}

const STORAGE_KEY = 'tradeColorMode';
const RED = '#ef4444';
const GREEN = '#10b981';

const TradeColorContext = createContext<TradeColorContextType | undefined>(undefined);

function readInitialMode(): TradeColorMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'red-down-green-up' ? 'red-down-green-up' : 'red-up-green-down';
}

export function TradeColorProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<TradeColorMode>(readInitialMode);
  const isReversed = mode === 'red-down-green-up';

  const setIsReversed = (value: boolean) => {
    const nextMode: TradeColorMode = value ? 'red-down-green-up' : 'red-up-green-down';
    setMode(nextMode);
    localStorage.setItem(STORAGE_KEY, nextMode);
  };

  const value = useMemo<TradeColorContextType>(
    () => ({
      mode,
      isReversed,
      setIsReversed,
      toggleColorMode: () => setIsReversed(!isReversed),
      getTrendTone: (isUp: boolean) => {
        if (isUp) {
          return isReversed ? 'green' : 'red';
        }
        return isReversed ? 'red' : 'green';
      },
      getProfitTone: (amount: number) => {
        if (amount >= 0) {
          return isReversed ? 'green' : 'red';
        }
        return isReversed ? 'red' : 'green';
      },
      getTradeTone: (tradeType: 'bull' | 'bear') => {
        if (tradeType === 'bull') {
          return isReversed ? 'green' : 'red';
        }
        return isReversed ? 'red' : 'green';
      },
      getToneColor: (tone: Tone) => (tone === 'red' ? RED : GREEN),
      getToneTextClass: (tone: Tone) =>
        tone === 'red' ? 'text-[#ef4444]' : 'text-[#10b981]',
      getToneBgClass: (tone: Tone) =>
        tone === 'red' ? 'bg-[#ef4444]' : 'bg-[#10b981]',
      getToneBorderClass: (tone: Tone) =>
        tone === 'red' ? 'border-[#ef4444]' : 'border-[#10b981]',
    }),
    [isReversed, mode],
  );

  return (
    <TradeColorContext.Provider value={value}>
      {children}
    </TradeColorContext.Provider>
  );
}

export function useTradeColors() {
  const context = useContext(TradeColorContext);
  if (!context) {
    throw new Error('useTradeColors must be used within a TradeColorProvider');
  }
  return context;
}
