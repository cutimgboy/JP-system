import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
  };

  const bgColors = {
    success: 'bg-green-500/20 border-green-500/50',
    error: 'bg-red-500/20 border-red-500/50',
    warning: 'bg-yellow-500/20 border-yellow-500/50',
  };

  const textColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className={`${bgColors[type]} border rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
        <span className={`${textColors[type]} text-xl font-bold`}>{icons[type]}</span>
        <span className={`${textColors[type]} flex-1 text-sm font-medium`}>{message}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
