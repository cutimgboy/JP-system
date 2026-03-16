import { useState, useEffect } from 'react';
import { Crown, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { BottomNav } from '../../components/BottomNav';
import { PageHeader } from '../../components/PageHeader';
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

  const top1 = leaderboardData[0];
  const top2 = leaderboardData[1];
  const top3 = leaderboardData[2];
  const rest = leaderboardData.slice(3);

  return (
    <div className="min-h-screen bg-[#09090b] pb-28">
      {/* Header - Fixed */}
      <PageHeader />

      {/* Content with top padding to account for fixed header */}
      <div className="pt-[120px]">
        {/* Header Section */}
        <div className="px-6 pb-4">
          <h1 className="text-[32px] font-bold tracking-tight mb-2 text-white">24小时交易</h1>
          <p className="text-[#8a8a93] text-[14px] mb-4">
            对近24小时交易的客户，进行投资收益排行
          </p>
          <div className="flex items-center gap-4 text-[#8a8a93] text-[13px]">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{formatDate(settings.date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} />
              <span>{formatNumber(displayParticipants)}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-[#8a8a93]">加载中...</div>
        ) : leaderboardData.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#8a8a93]">暂无数据</div>
        ) : (
          <>
            {/* Podium Section */}
            <div className="flex items-end justify-center gap-2 mt-8 mb-6 px-4">
              {/* Top 2 */}
              {top2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center flex-1 pb-4"
                >
                  <Crown size={24} className="text-[#94a3b8] mb-2 drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]" fill="currentColor" />
                  <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-b from-[#94a3b8]/20 to-transparent border border-[#94a3b8]/40 flex items-center justify-center text-[18px] font-bold text-[#94a3b8] mb-3">
                    2
                  </div>
                  <span className="font-semibold text-[14px] mb-1 text-white">{top2.username}</span>
                  <span className="text-[#10b981] font-bold text-[13px] mb-1">+₫{formatNumber(top2.profit)}</span>
                  <span className="text-[#8a8a93] text-[12px]">{top2.trades} &nbsp; {Number(top2.winRate).toFixed(2)}%</span>
                </motion.div>
              )}

              {/* Top 1 */}
              {top1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center flex-1 relative z-10"
                >
                  <Crown size={32} className="text-[#f59e0b] mb-2 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" fill="currentColor" />
                  <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-b from-[#f59e0b]/20 to-[#f59e0b]/5 border-2 border-[#f59e0b]/50 flex items-center justify-center text-[24px] font-bold text-[#f59e0b] mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    1
                  </div>
                  <span className="font-semibold text-[15px] mb-1 text-white">{top1.username}</span>
                  <span className="text-[#10b981] font-bold text-[14px] mb-1">+₫{formatNumber(top1.profit)}</span>
                  <span className="text-[#8a8a93] text-[12px]">{top1.trades} &nbsp; {Number(top1.winRate).toFixed(2)}%</span>
                </motion.div>
              )}

              {/* Top 3 */}
              {top3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center flex-1 pb-4"
                >
                  <Crown size={24} className="text-[#b45309] mb-2 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" fill="currentColor" />
                  <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-b from-[#b45309]/20 to-transparent border border-[#b45309]/40 flex items-center justify-center text-[18px] font-bold text-[#b45309] mb-3">
                    3
                  </div>
                  <span className="font-semibold text-[14px] mb-1 text-white">{top3.username}</span>
                  <span className="text-[#10b981] font-bold text-[13px] mb-1">+₫{formatNumber(top3.profit)}</span>
                  <span className="text-[#8a8a93] text-[12px]">{top3.trades} &nbsp; {Number(top3.winRate).toFixed(2)}%</span>
                </motion.div>
              )}
            </div>

            {/* List Section */}
            {rest.length > 0 && (
              <div className="px-4">
                {/* Table Header */}
                <div className="flex items-center bg-[#1a1a24] rounded-t-[16px] px-4 py-3 text-[12px] text-[#8a8a93] font-medium border-b border-white/5">
                  <div className="w-[40px]">#</div>
                  <div className="flex-1">用户</div>
                  <div className="w-[60px] text-center">笔数</div>
                  <div className="w-[70px] text-center">胜率</div>
                  <div className="w-[90px] text-right">盈利</div>
                </div>

                {/* Table Body */}
                <div className="bg-[#14141c] rounded-b-[16px] border border-white/5 overflow-hidden flex flex-col">
                  {rest.map((item, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      key={item.rank}
                      className="flex items-center px-4 py-4 border-b border-white/5 last:border-none hover:bg-white/5 transition-colors"
                    >
                      <div className="w-[40px] font-bold text-[#8a8a93]">{item.rank}</div>
                      <div className="flex-1 font-semibold text-[14px] text-white">{item.username}</div>
                      <div className="w-[60px] text-center text-[13px] text-[#8a8a93]">{item.trades}</div>
                      <div className="w-[70px] text-center text-[13px] text-[#8a8a93]">{Number(item.winRate).toFixed(2)}%</div>
                      <div className="w-[90px] text-right font-bold text-[13px] text-[#10b981]">+₫{formatNumber(item.profit)}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
