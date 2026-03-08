import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Toast } from '../components/Toast';
import { apiClient } from '../utils/api';

interface LeaderboardItem {
  id?: number;
  username: string;
  avatar: string;
  trades: number;
  winRate: number;
  profit: number;
  rank: number;
}

interface CommunitySettings {
  date: string;
  participants: number;
  baseDate: string;
  baseParticipants: number;
}

export function CommunityManagement() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [settings, setSettings] = useState<CommunitySettings>({
    date: new Date().toISOString().split('T')[0],
    participants: 0,
    baseDate: '2024-01-01',
    baseParticipants: 1039284,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<LeaderboardItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<LeaderboardItem>({
    username: '',
    avatar: 'logo',
    trades: 0,
    winRate: 0,
    profit: 0,
    rank: 1,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leaderboardRes, settingsRes] = await Promise.all([
        apiClient.get('/api/admin/community/leaderboard'),
        apiClient.get('/api/community/settings'),
      ]);

      setLeaderboard(leaderboardRes.data || []);

      const settingsData = settingsRes.data || {};
      setSettings({
        date: settingsData.date || new Date().toISOString().split('T')[0],
        participants: parseInt(settingsData.participants || '0'),
        baseDate: settingsData.baseDate || '2024-01-01',
        baseParticipants: parseInt(settingsData.baseParticipants || '1039284'),
      });
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await apiClient.put('/api/admin/community/settings', settings);
      setToast({ message: '设置保存成功', type: 'success' });
      fetchData(); // 刷新数据
    } catch (error) {
      console.error('保存设置失败:', error);
      setToast({ message: '保存设置失败', type: 'error' });
    }
  };

  const handleAdd = async () => {
    try {
      await apiClient.post('/api/admin/community/leaderboard', newItem);
      setIsAdding(false);
      setNewItem({
        username: '',
        avatar: 'logo',
        trades: 0,
        winRate: 0,
        profit: 0,
        rank: 1,
      });
      setToast({ message: '添加成功', type: 'success' });
      fetchData();
    } catch (error) {
      console.error('添加失败:', error);
      setToast({ message: '添加失败', type: 'error' });
    }
  };

  const handleEdit = (item: LeaderboardItem) => {
    setEditingId(item.id!);
    setEditingItem({ ...item });
  };

  const handleSave = async () => {
    if (!editingItem || !editingId) return;

    try {
      await apiClient.put(`/api/admin/community/leaderboard/${editingId}`, editingItem);
      setEditingId(null);
      setEditingItem(null);
      setToast({ message: '保存成功', type: 'success' });
      fetchData();
    } catch (error) {
      console.error('保存失败:', error);
      setToast({ message: '保存失败', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      await apiClient.delete(`/api/admin/community/leaderboard/${id}`);
      setToast({ message: '删除成功', type: 'success' });
      fetchData();
    } catch (error) {
      console.error('删除失败:', error);
      setToast({ message: '删除失败', type: 'error' });
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">社区管理</h1>

      {/* 社区设置 */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">社区设置</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">日期</label>
            <input
              type="date"
              value={settings.date}
              onChange={(e) => setSettings({ ...settings, date: e.target.value })}
              className="w-full bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">参与人数（设置为0则自动计算）</label>
            <input
              type="number"
              value={settings.participants}
              onChange={(e) => setSettings({ ...settings, participants: parseInt(e.target.value) || 0 })}
              className="w-full bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">基准日期</label>
            <input
              type="date"
              value={settings.baseDate}
              onChange={(e) => setSettings({ ...settings, baseDate: e.target.value })}
              className="w-full bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">基准人数</label>
            <input
              type="number"
              value={settings.baseParticipants}
              onChange={(e) => setSettings({ ...settings, baseParticipants: parseInt(e.target.value) || 0 })}
              className="w-full bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSaveSettings}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          保存设置
        </button>
      </div>

      {/* 排行榜管理 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">排行榜管理</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加记录
          </button>
        </div>

        {/* 添加表单 */}
        {isAdding && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="grid grid-cols-6 gap-3 mb-3">
              <input
                type="text"
                placeholder="排名"
                value={newItem.rank || ''}
                onChange={(e) => setNewItem({ ...newItem, rank: parseInt(e.target.value) || 0 })}
                className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="用户名"
                value={newItem.username}
                onChange={(e) => setNewItem({ ...newItem, username: e.target.value })}
                className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="交易笔数"
                value={newItem.trades || ''}
                onChange={(e) => setNewItem({ ...newItem, trades: parseInt(e.target.value) || 0 })}
                className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="胜率(%)"
                value={newItem.winRate || ''}
                onChange={(e) => setNewItem({ ...newItem, winRate: parseFloat(e.target.value) || 0 })}
                className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="收益"
                value={newItem.profit || ''}
                onChange={(e) => setNewItem({ ...newItem, profit: parseFloat(e.target.value) || 0 })}
                className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                >
                  <Save className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded"
                >
                  <X className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 排行榜列表 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left text-sm text-gray-600 pb-3 font-semibold">排名</th>
                <th className="text-left text-sm text-gray-600 pb-3 font-semibold">用户名</th>
                <th className="text-left text-sm text-gray-600 pb-3 font-semibold">交易笔数</th>
                <th className="text-left text-sm text-gray-600 pb-3 font-semibold">胜率(%)</th>
                <th className="text-left text-sm text-gray-600 pb-3 font-semibold">收益</th>
                <th className="text-right text-sm text-gray-600 pb-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  {editingId === item.id ? (
                    <>
                      <td className="py-3">
                        <input
                          type="number"
                          value={editingItem?.rank}
                          onChange={(e) => setEditingItem({ ...editingItem!, rank: parseInt(e.target.value) || 1 })}
                          className="w-20 bg-white text-gray-800 px-2 py-1 rounded border border-gray-300"
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="text"
                          value={editingItem?.username}
                          onChange={(e) => setEditingItem({ ...editingItem!, username: e.target.value })}
                          className="w-full bg-white text-gray-800 px-2 py-1 rounded border border-gray-300"
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={editingItem?.trades}
                          onChange={(e) => setEditingItem({ ...editingItem!, trades: parseInt(e.target.value) || 0 })}
                          className="w-20 bg-white text-gray-800 px-2 py-1 rounded border border-gray-300"
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={editingItem?.winRate}
                          onChange={(e) => setEditingItem({ ...editingItem!, winRate: parseFloat(e.target.value) || 0 })}
                          className="w-20 bg-white text-gray-800 px-2 py-1 rounded border border-gray-300"
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={editingItem?.profit}
                          onChange={(e) => setEditingItem({ ...editingItem!, profit: parseFloat(e.target.value) || 0 })}
                          className="w-32 bg-white text-gray-800 px-2 py-1 rounded border border-gray-300"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-700 mr-3"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingItem(null);
                          }}
                          className="text-gray-500 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 text-gray-800">{item.rank}</td>
                      <td className="py-3 text-gray-800">{item.username}</td>
                      <td className="py-3 text-gray-800">{item.trades}</td>
                      <td className="py-3 text-gray-800">{Number(item.winRate).toFixed(2)}%</td>
                      <td className="py-3 text-green-600 font-medium">₫{Number(item.profit).toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-700 mr-3"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
