import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, Gift, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiClient, extractData } from '../../utils/api';
import { getLocale, tx } from "../../i18n/text";
interface Message {
  id: number;
  icon?: string;
  title: string;
  content: string;
  actionText?: string;
  type: 'success' | 'warning' | 'info' | 'celebration';
  createdAt?: string;
}
export function MessageCenter() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void fetchMessages();
  }, []);
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/messages');
      const data = extractData<Message[]>(response) || [];
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(tx("获取消息失败:"), error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };
  const unreadCount = useMemo(() => messages.length, [messages.length]);
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString(getLocale(), {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  return <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button onClick={() => navigate('/profile')} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">{tx("消息中心")}</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-10 pt-6">
        <div className="mb-6 rounded-[24px] border border-white/10 bg-[#14141c] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[#8a8a93]">{tx("账户通知")}</p>
              <h2 className="mt-1 text-[24px] font-bold tracking-tight">{tx("您有")}{unreadCount}{tx("条消息")}</h2>
            </div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#6c48f5]/15 text-[#a58dff]">
              <Bell size={22} />
              {unreadCount > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ef4444]" /> : null}
            </div>
          </div>
        </div>

        {loading ? <div className="rounded-[20px] border border-white/10 bg-[#14141c] py-12 text-center text-[#8a8a93]">{tx("加载中...")}</div> : messages.length === 0 ? <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-[#14141c] px-6 py-14 text-center">
            <Bell size={44} className="mb-4 text-white/20" />
            <p className="text-[15px] font-medium text-white">{tx("暂无消息")}</p>
            <p className="mt-2 text-[13px] text-[#8a8a93]">{tx("新的账户通知会展示在这里")}</p>
          </div> : <div className="space-y-4">
            {messages.map((message, index) => {
          const Icon = typeIcon(message.type);
          const tone = typeTone(message.type);
          return <motion.div key={message.id} initial={{
            opacity: 0,
            y: 12
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.28,
            delay: Math.min(index * 0.03, 0.18)
          }} className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#14141c]/90 p-5 shadow-sm">
                  <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${tone.glow} blur-3xl`} />
                  <div className="relative z-10">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.bg} ${tone.text}`}>
                          {message.icon && message.icon.length <= 2 ? <span className="text-[20px]">{message.icon}</span> : <Icon size={20} />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-[16px] font-semibold text-white">{message.title}</h3>
                          <p className="mt-0.5 text-[12px] text-[#8a8a93]">{formatTime(message.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${tone.badge}`}>{typeLabel(message.type)}</span>
                    </div>

                    <p className="mb-5 text-[14px] leading-6 text-white/72">{message.content}</p>

                    {message.actionText ? <button className="flex h-10 w-full items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.03] px-3 text-left transition-colors hover:bg-white/[0.06]">
                        <span className="text-[13px] font-medium text-[#a58dff]">{message.actionText}</span>
                        <ChevronRight size={16} className="text-[#8a8a93]" />
                      </button> : null}
                  </div>
                </motion.div>;
        })}
          </div>}
      </div>
    </div>;
}
function typeIcon(type: Message['type']) {
  if (type === 'success') return CheckCircle2;
  if (type === 'warning') return CircleAlert;
  if (type === 'celebration') return Gift;
  return Megaphone;
}
function typeLabel(type: Message['type']) {
  if (type === 'success') return tx("成功");
  if (type === 'warning') return tx("提醒");
  if (type === 'celebration') return tx("活动");
  return tx("通知");
}
function typeTone(type: Message['type']) {
  if (type === 'success') {
    return {
      bg: 'bg-[#10b981]/10',
      text: 'text-[#10b981]',
      glow: 'bg-[#10b981]/10',
      badge: 'border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]'
    };
  }
  if (type === 'warning') {
    return {
      bg: 'bg-[#f59e0b]/10',
      text: 'text-[#f59e0b]',
      glow: 'bg-[#f59e0b]/10',
      badge: 'border-[#f59e0b]/20 bg-[#f59e0b]/10 text-[#fbbf24]'
    };
  }
  if (type === 'celebration') {
    return {
      bg: 'bg-[#6c48f5]/15',
      text: 'text-[#a58dff]',
      glow: 'bg-[#6c48f5]/15',
      badge: 'border-[#6c48f5]/30 bg-[#6c48f5]/10 text-[#a58dff]'
    };
  }
  return {
    bg: 'bg-[#3b82f6]/10',
    text: 'text-[#60a5fa]',
    glow: 'bg-[#3b82f6]/10',
    badge: 'border-[#3b82f6]/20 bg-[#3b82f6]/10 text-[#93c5fd]'
  };
}
