import { useState, useEffect } from 'react';
import { Battery, Wifi, Signal, Calendar, Users as UsersIcon } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { apiClient, extractData } from '../../utils/api';

interface LeaderboardItem {
  rank: number;
  username: string;
  avatar: string;
  trades: number;
  winRate: number;
  profit: number;
}

interface CommunitySettings {
  date: string;
  participants: string;
  baseDate?: string;
  baseParticipants?: number;
}

export default function CommunityPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [settings, setSettings] = useState<CommunitySettings>({
    date: new Date().toISOString().split('T')[0],
    participants: '0',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, settingsRes] = await Promise.all([
        apiClient.get('/api/community/leaderboard'),
        apiClient.get('/api/community/settings'),
      ]);

      let leaderboard = extractData(leaderboardRes) || [];
      if (!Array.isArray(leaderboard)) {
        console.warn('排行榜数据不是数组,使用空数组');
        leaderboard = [];
      }
      setLeaderboardData(leaderboard);

      const settingsData = extractData(settingsRes) || {};
      setSettings({
        date: settingsData.date || new Date().toISOString().split('T')[0],
        participants: settingsData.participants || '0',
        baseDate: settingsData.baseDate || '2024-01-01',
        baseParticipants: parseInt(settingsData.baseParticipants) || 1039284,
      });
    } catch (error) {
      console.error('获取社区数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    return n.toLocaleString();
  };

  // 计算参与人数：从基准值开始每天增加
  const calculateParticipants = () => {
    const baseDate = new Date(settings.baseDate || '2024-01-01');
    const baseCount = settings.baseParticipants || 1039284;
    const today = new Date();

    // 计算天数差
    const diffTime = today.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 每天增加的人数（使用日期作为种子生成固定的随机数）
    const dailyIncrease = 200 + (diffDays % 300); // 每天增加 200-500 人之间

    return baseCount + (diffDays * dailyIncrease);
  };

  const displayParticipants = settings.participants && parseInt(settings.participants) > 0
    ? parseInt(settings.participants)
    : calculateParticipants();

  return (
    <div className="min-h-screen bg-[#1a1f2e] pb-20">
      {/* Main Content */}
      <div className="px-4 pt-6 pb-4">
        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">24小时交易</h1>
        <p className="text-sm text-gray-400 mb-6">对近24小时交易的客户，进行投资收益排行</p>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Date Card */}
          <div className="bg-[#1f2633] rounded-xl p-4 flex items-center gap-3 border border-gray-700/30">
            <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">日期</div>
              <div className="text-sm font-medium text-white">{formatDate(settings.date)}</div>
            </div>
          </div>

          {/* Users Count Card */}
          <div className="bg-[#1f2633] rounded-xl p-4 flex items-center gap-3 border border-gray-700/30">
            <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">参与人数</div>
              <div className="text-sm font-medium text-white">{formatNumber(displayParticipants)}</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#1f2633] rounded-xl overflow-hidden border border-gray-700/30">
          {/* Table Header */}
          <div className="bg-[#141820] px-3 py-3 grid grid-cols-[32px_1fr_48px_60px_90px] gap-2 border-b border-gray-700/30">
            <div className="text-xs text-gray-500">#</div>
            <div className="text-xs text-gray-500">用户</div>
            <div className="text-xs text-gray-500 text-center">笔数</div>
            <div className="text-xs text-gray-500 text-center">胜率</div>
            <div className="text-xs text-gray-500 text-right">收益</div>
          </div>

          {/* Table Body */}
          <div>
            {loading ? (
              <div className="px-3 py-8 text-center text-gray-400">加载中...</div>
            ) : leaderboardData.length === 0 ? (
              <div className="px-3 py-8 text-center text-gray-400">暂无数据</div>
            ) : (
              leaderboardData.map((item, index) => (
                <div
                  key={index}
                  className={`px-3 py-3 grid grid-cols-[32px_1fr_48px_60px_90px] gap-2 items-center ${
                    index !== leaderboardData.length - 1 ? 'border-b border-gray-700/20' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="text-sm text-white font-medium">{item.rank}</div>

                  {/* User */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 bg-gray-700/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {item.avatar === 'logo' ? 'L' : item.username[0]}
                      </span>
                    </div>
                    <span className="text-sm text-white truncate">{item.username}</span>
                  </div>

                  {/* Trades */}
                  <div className="text-sm text-white text-center">{item.trades}</div>

                  {/* Win Rate */}
                  <div className="text-sm text-white text-center">{Number(item.winRate).toFixed(2)}%</div>

                  {/* Profit */}
                  <div className="text-sm text-teal-400 font-medium text-right whitespace-nowrap">
                    +₫{Number(item.profit).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
