import { useState, useEffect } from 'react';
import { ArrowLeft, Battery, Wifi, Signal, ChevronRight } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { apiClient, extractData } from '../../utils/api';

interface Message {
  id: number;
  time?: string;
  icon: string;
  title: string;
  content: string;
  actionText: string;
  type: 'success' | 'warning' | 'info' | 'celebration';
  createdAt?: string;
}

export function MessageCenter() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/messages');
      let data = extractData(response) || [];
      if (!Array.isArray(data)) {
        console.warn('消息列表不是数组,使用空数组');
        data = [];
      }
      setMessages(data);
    } catch (error) {
      console.error('获取消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] pb-16">
      {/* Status Bar */}
      <div className="bg-[#141820] px-4 pt-3 pb-2">
        <div className="flex items-center justify-between text-xs">
          <div className="text-white">12:00</div>
          <div className="flex items-center gap-1 text-white">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="bg-[#141820] px-4 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-center relative">
          <button
            onClick={() => navigate('/profile')}
            className="absolute left-0 w-9 h-9 flex items-center justify-center hover:bg-gray-700/30 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-white text-base font-medium">消息中心</h1>
        </div>
      </div>

      {/* Messages List */}
      <div className="px-4 pt-4 pb-24 space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 py-8">加载中...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">暂无消息</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="bg-[#1f2633] rounded-xl border border-gray-700/50 p-4 hover:border-gray-600/50 transition-colors"
            >
              {/* Time */}
              <div className="text-xs text-gray-400 mb-3">
                {formatTime(message.createdAt)}
              </div>

              {/* Icon and Title */}
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xl leading-none">{message.icon}</span>
                <h3 className="text-white font-medium flex-1">
                  {message.title}
                </h3>
              </div>

              {/* Content */}
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {message.content}
              </p>

              {/* Action Button */}
              <button className="flex items-center justify-between w-full text-left group">
                <span className="text-sm text-yellow-500 group-hover:text-yellow-400 transition-colors">
                  👉 {message.actionText}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
