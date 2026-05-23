import { useEffect, useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import { Toast } from '../components/Toast';
import {
  Button,
  DataTable,
  Modal,
  PageHeader,
  StatusBadge,
  fieldClass,
} from '../components/AdminUI';
import {
  apiClient,
  extractData,
  extractMessage,
  isSuccessResponse,
} from '../utils/api';

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
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    void fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/reward/settings');
      const settingsData = extractData<RewardSetting[]>(response) || [];
      setSettings(Array.isArray(settingsData) ? settingsData : []);
    } catch (error) {
      console.error('获取奖励设置失败:', error);
      setSettings([]);
      setToast({ message: '获取奖励设置失败', type: 'error' });
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
    const amount = Number(editAmount);
    if (Number.isNaN(amount) || amount < 0) {
      setToast({ message: '请输入有效的奖励金额', type: 'warning' });
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.put(`/reward/settings/${editingSetting.id}`, {
        rewardAmount: amount,
        isActive: editActive,
      });

      if (isSuccessResponse(response)) {
        setToast({ message: '更新成功', type: 'success' });
        setShowEditModal(false);
        void fetchSettings();
      } else {
        setToast({ message: extractMessage(response, '更新失败'), type: 'error' });
      }
    } catch (error) {
      console.error('更新失败:', error);
      setToast({ message: '更新失败', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="奖励设置" description="管理模拟账户和真实账户的奖励金额与开关状态" />

      <DataTable
        loading={loading}
        rows={settings}
        rowKey={(row) => row.id}
        emptyText="暂无奖励设置"
        columns={[
          {
            key: 'accountType',
            title: '账户类型',
            render: (setting) => (setting.accountType === 'demo' ? '模拟账户' : '真实账户'),
          },
          {
            key: 'rewardAmount',
            title: '奖励金额',
            render: (setting) => `${Number(setting.rewardAmount).toLocaleString()} VND`,
          },
          {
            key: 'status',
            title: '状态',
            render: (setting) => (
              <StatusBadge tone={setting.isActive === 1 ? 'green' : 'slate'}>
                {setting.isActive === 1 ? '启用' : '禁用'}
              </StatusBadge>
            ),
          },
          {
            key: 'actions',
            title: '操作',
            render: (setting) => (
              <Button variant="secondary" onClick={() => handleEdit(setting)}>
                <Pencil className="h-4 w-4" />
                编辑
              </Button>
            ),
          },
        ]}
      />

      {showEditModal && editingSetting && (
        <Modal
          title={`编辑奖励设置 - ${editingSetting.accountType === 'demo' ? '模拟账户' : '真实账户'}`}
          onClose={() => setShowEditModal(false)}
          footer={
            <>
              <Button onClick={() => setShowEditModal(false)} disabled={saving}>取消</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
            </>
          }
        >
          <div className="grid gap-4">
            <div>
              <div className="mb-2 text-sm font-medium text-slate-900">奖励金额 (VND)</div>
              <input
                className={fieldClass}
                type="number"
                value={editAmount}
                onChange={(event) => setEditAmount(event.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-slate-900">状态</div>
              <div className="flex gap-2">
                <Button
                  variant={editActive === 1 ? 'success' : 'secondary'}
                  onClick={() => setEditActive(1)}
                >
                  <Check className="h-4 w-4" />
                  启用
                </Button>
                <Button
                  variant={editActive === 0 ? 'danger' : 'secondary'}
                  onClick={() => setEditActive(0)}
                >
                  禁用
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
