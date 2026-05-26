import { AnimatePresence, motion } from 'framer-motion';
import { tx } from "../../../i18n/text";
interface TimeSelectorProps {
  isOpen: boolean;
  selectedTime: string;
  tempSelectedTime: string;
  timeOptions: Array<{
    value: string;
    label: string;
  }>;
  onClose: () => void;
  onSelectTime: (value: string) => void;
  onConfirm: () => void;
}
export function TimeSelector({
  isOpen,
  selectedTime,
  tempSelectedTime,
  timeOptions,
  onClose,
  onSelectTime,
  onConfirm
}: TimeSelectorProps) {
  const currentLabel = timeOptions.find(option => option.value === tempSelectedTime)?.label || timeOptions.find(option => option.value === selectedTime)?.label || '';
  return <AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-[70] flex flex-col justify-end">
          <motion.button type="button" aria-label={tx("关闭到期时间选择")} initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div role="dialog" aria-modal="true" aria-labelledby="time-selector-title" initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 220
      }} className="relative w-full rounded-t-[24px] border-t border-white/10 bg-[#1c1c24] pt-5 pb-[calc(2rem+80px)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="mb-4 flex items-start justify-between gap-3 px-6">
              <h3 id="time-selector-title" className="shrink-0 text-[18px] font-bold leading-6 text-white">{tx("请选择到期时间")}</h3>
              <div className="min-w-0 text-right text-[14px] leading-5 text-[#8a8a93]">{tx("当前选择:")}<span className="ml-1 font-medium text-[#6c48f5]">{currentLabel}</span>
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-2 px-4">
              {timeOptions.map(option => {
            const isActive = tempSelectedTime === option.value;
            return <button key={option.value} type="button" className={`rounded-xl border px-6 py-4 text-center text-[16px] transition-all ${isActive ? 'border-[#6c48f5]/50 bg-[#6c48f5]/10 font-medium text-[#6c48f5] shadow-[0_0_15px_rgba(108,72,245,0.15)]' : 'border-transparent bg-[#23232c] text-white/80 hover:bg-[#2a2a35]'}`} onClick={() => onSelectTime(option.value)}>
                    {option.label}
                  </button>;
          })}
            </div>

            <div className="px-6 pb-2">
              <button type="button" className="h-[52px] w-full rounded-[26px] bg-[#6c48f5] text-[18px] font-bold text-white shadow-[0_4px_12px_rgba(108,72,245,0.4)] transition-colors hover:bg-[#5a3cd1]" onClick={onConfirm}>{tx("确认")}</button>
            </div>
          </motion.div>
        </div>}
    </AnimatePresence>;
}
