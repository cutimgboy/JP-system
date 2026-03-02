interface AlertDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export function AlertDialog({ isOpen, title, message, onClose }: AlertDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹框内容 */}
      <div className="relative bg-[#1f2633] rounded-2xl shadow-2xl border border-gray-700/50 w-[320px] mx-4 animate-scale-in">
        <div className="p-6">
          {/* 标题 */}
          {title && (
            <h3 className="text-lg font-semibold text-white mb-3">
              {title}
            </h3>
          )}

          {/* 消息内容 */}
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            {message}
          </p>

          {/* 确认按钮 */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-lg transition-all font-medium"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
