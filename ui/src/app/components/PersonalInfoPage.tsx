import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function PersonalInfoPage() {
  const navigate = useNavigate();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('复制成功');
  };

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
          个人信息
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-[120px]">
        
        {/* Profile Card */}
        <div className="bg-[#14141c] rounded-[20px] px-4 py-2 border-[0.5px] border-white/5 shadow-sm mb-4">
          <div className="flex items-center justify-between py-4 border-b border-white/5 cursor-pointer group hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
            <span className="text-[15px] text-white/90 font-medium">头像</span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6c48f5]/40 to-[#14141c] border border-white/10 flex items-center justify-center overflow-hidden">
                <span className="text-[18px] font-bold text-white">Z</span>
              </div>
              <ChevronRight size={16} className="text-[#8a8a93]" />
            </div>
          </div>
          
          <div className="flex items-center justify-between py-4 border-b border-white/5 hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
            <span className="text-[15px] text-white/90 font-medium">UID</span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#8a8a93]">84920173</span>
              <button onClick={() => handleCopy('84920173')} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                <Copy size={14} className="text-[#8a8a93]" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-white/5 cursor-pointer group hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
            <span className="text-[15px] text-white/90 font-medium">昵称</span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#8a8a93]">Zackary</span>
              <ChevronRight size={16} className="text-[#8a8a93]" />
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-white/5 cursor-pointer group hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
            <span className="text-[15px] text-white/90 font-medium">国家/地区</span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#8a8a93]">中国 (CN)</span>
              <ChevronRight size={16} className="text-[#8a8a93]" />
            </div>
          </div>

          <div className="flex items-center justify-between py-4 cursor-pointer group hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
            <span className="text-[15px] text-white/90 font-medium">基础货币</span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#8a8a93]">USD</span>
              <ChevronRight size={16} className="text-[#8a8a93]" />
            </div>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="bg-[#14141c] rounded-[20px] px-4 py-2 border-[0.5px] border-white/5 shadow-sm mb-4">
          <div className="flex items-center justify-between py-4 border-b border-white/5 cursor-pointer group hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
            <span className="text-[15px] text-white/90 font-medium">身份认证</span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                已认证
              </span>
              <ChevronRight size={16} className="text-[#8a8a93]" />
            </div>
          </div>
          
          <div className="flex items-center justify-between py-4 border-b border-white/5 cursor-pointer group hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
            <span className="text-[15px] text-white/90 font-medium">手机绑定</span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#8a8a93]">未绑定</span>
              <ChevronRight size={16} className="text-[#8a8a93]" />
            </div>
          </div>

          <div className="flex items-center justify-between py-4 cursor-pointer group hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
            <span className="text-[15px] text-white/90 font-medium">邮箱绑定</span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#8a8a93]">za***@gmail.com</span>
              <ChevronRight size={16} className="text-[#8a8a93]" />
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-[#14141c] rounded-[20px] px-4 py-2 border-[0.5px] border-white/5 shadow-sm">
          <div className="flex items-center justify-between py-4 -mx-4 px-4">
            <span className="text-[15px] text-white/90 font-medium">注册时间</span>
            <span className="text-[14px] text-[#8a8a93]">2024-03-12 14:30:00</span>
          </div>
        </div>

      </div>
    </div>
  );
}
