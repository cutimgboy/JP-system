interface TimeSelectorProps {
  isOpen: boolean;
  selectedTime: string;
  tempSelectedTime: string;
  timeOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onSelectTime: (value: string) => void;
  onConfirm: () => void;
}

export function TimeSelector({
  isOpen,
  tempSelectedTime,
  timeOptions,
  onClose,
  onSelectTime,
  onConfirm,
}: TimeSelectorProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1f2633] rounded-t-2xl z-50 animate-slide-up shadow-2xl border-t border-gray-700/50">
        <div className="px-6 py-5">
          <h3 className="text-white mb-4">选择到期时间</h3>
          
          {/* Options List */}
          <div className="space-y-2 mb-4">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                className={`w-full text-center py-3 rounded-lg transition-all ${
                  tempSelectedTime === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => onSelectTime(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* Confirm Button */}
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full transition-colors"
            onClick={onConfirm}
          >
            确认
          </button>
        </div>
      </div>
    </>
  );
}
