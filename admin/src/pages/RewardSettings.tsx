import { useState, useEffect } from 'react';
import { Toast } from '../components/Toast';
import { apiClient } from '../utils/api';

interface RewardSetting {
  id: number;
  accountType: 'demo' | 'real';
  rewardAmount: number;
  isActive: number;
}

export function RewardSettings() {
  const [settings, setSettings] = useState<RewardSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState<RewardSetting | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editActive, setEditActive] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/reward/settings');
      const actualData = response.data || response;
      if (actualData.code === 0) {
        const settingsData = actualData.data || actualData || [];
        setSettings(Array.isArray(settingsData) ? settingsData : []);
      }
    } catch (error) {
      console.error('获取奖励设置失败:', error);
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting: RewardSetting) => {
    setEditingSetting(setting);
    setEditAmount(setting.rewardAmount.toString());
    setEditActive(setting.isActive);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingSetting) return;

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      setToast({ message: '请输入有效的金额', type: 'error' });
      return;
    }

    try {
      const response = await apiClient.put(`/reward/settings/${editingSetting.id}`, {
        rewardAmount: amount,
        isActive: editActive,
      });

      const actualData = response.data.data || response.data;
      if (actualData.code === 0 || response.data.code === 0) {
        setToast({ message: '更新成功', type: 'success' });
        setShowEditModal(false);
        fetchSettings();
      } else {
        setToast({ message: actualData.msg || '更新失败', type: 'error' });
      }
    } catch (error) {
      console.error('更新失败:', error);
      setToast({ message: '更新失败', type: 'error' });
    }
  };

  const getAccountTypeName = (type: string) => {
    return type === 'demo' ? '模拟账户' : '真实账户';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">奖励设置</h1>

      {loading ? (
        <div className="text-center py-8 text-gray-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  账户类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  奖励金额 (VND)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settings.map((setting) => (
                <tr key={setting.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {getAccountTypeName(setting.accountType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {setting.rewardAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      setting.isActive === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {setting.isActive === 1 ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(setting)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              编辑奖励设置 - {getAccountTypeName(editingSetting.accountType)}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                奖励金额 (VND)
              </label>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入奖励金额"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <select
                value={editActive}
                onChange={(e) => setEditActive(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>启用</option>
                <option value={0}>禁用</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

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
