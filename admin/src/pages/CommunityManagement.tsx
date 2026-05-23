import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { Toast } from '../components/Toast';
import {
  Button,
  ConfirmDialog,
  DataTable,
  Modal,
  PageHeader,
  StatusBadge,
  fieldClass,
} from '../components/AdminUI';
import { apiClient, extractData, isSuccessResponse } from '../utils/api';

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

const defaultNewItem: LeaderboardItem = {
  username: '',
  avatar: 'logo',
  trades: 0,
  winRate: 0,
  profit: 0,
  rank: 1,
};

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
  const [newItem, setNewItem] = useState<LeaderboardItem>(defaultNewItem);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LeaderboardItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leaderboardRes, settingsRes] = await Promise.all([
        apiClient.get('/api/admin/community/leaderboard'),
        apiClient.get('/api/community/settings'),
      ]);

      const leaderboardData = extractData<LeaderboardItem[]>(leaderboardRes) || [];
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);

      const settingsData = extractData<Partial<CommunitySettings>>(settingsRes) || {};
      setSettings({
        date: settingsData.date || new Date().toISOString().split('T')[0],
        participants: Number(settingsData.participants || 0),
        baseDate: settingsData.baseDate || '2024-01-01',
        baseParticipants: Number(settingsData.baseParticipants || 1039284),
      });
    } catch (error) {
      console.error('获取数据失败:', error);
      setToast({ message: '获取社区数据失败', type: 'error' });
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await apiClient.put('/api/admin/community/settings', settings);
      if (isSuccessResponse(response)) {
        setToast({ message: '设置保存成功', type: 'success' });
        void fetchData();
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      setToast({ message: '保存设置失败', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.username.trim()) {
      setToast({ message: '请输入用户名', type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const response = await apiClient.post('/api/admin/community/leaderboard', newItem);
      if (isSuccessResponse(response)) {
        setIsAdding(false);
        setNewItem(defaultNewItem);
        setToast({ message: '添加成功', type: 'success' });
        void fetchData();
      }
    } catch (error) {
      console.error('添加失败:', error);
      setToast({ message: '添加失败', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem || !editingId) return;
    setSaving(true);
    try {
      const response = await apiClient.put(`/api/admin/community/leaderboard/${editingId}`, editingItem);
      if (isSuccessResponse(response)) {
        setEditingId(null);
        setEditingItem(null);
        setToast({ message: '保存成功', type: 'success' });
        void fetchData();
      }
    } catch (error) {
      console.error('保存失败:', error);
      setToast({ message: '保存失败', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      const response = await apiClient.delete(`/api/admin/community/leaderboard/${deleteTarget.id}`);
      if (isSuccessResponse(response)) {
        setDeleteTarget(null);
        setToast({ message: '删除成功', type: 'success' });
        void fetchData();
      }
    } catch (error) {
      console.error('删除失败:', error);
      setToast({ message: '删除失败', type: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="社区管理"
        description="维护参与人数和排行榜内容"
        actions={
          <Button variant="primary" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" />
            添加记录
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">参与人数</div>
          <div className="mt-2 text-2xl font-semibold">{Number(settings.participants).toLocaleString()}</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">排行榜人数</div>
          <div className="mt-2 text-2xl font-semibold">{leaderboard.length}</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">基准人数</div>
          <div className="mt-2 text-2xl font-semibold">{Number(settings.baseParticipants).toLocaleString()}</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">更新时间</div>
          <div className="mt-2 text-sm font-medium">{settings.date}</div>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-slate-950">社区设置</div>
            <div className="text-sm text-slate-500">调整页面展示的运营数据</div>
          </div>
          <Button variant="primary" onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? '保存中...' : '保存设置'}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span>日期</span>
            <input className={fieldClass} type="date" value={settings.date} onChange={(e) => setSettings({ ...settings, date: e.target.value })} />
          </label>
          <label className="grid gap-2 text-sm">
            <span>参与人数</span>
            <input className={fieldClass} type="number" value={settings.participants} onChange={(e) => setSettings({ ...settings, participants: Number(e.target.value) || 0 })} />
          </label>
          <label className="grid gap-2 text-sm">
            <span>基准日期</span>
            <input className={fieldClass} type="date" value={settings.baseDate} onChange={(e) => setSettings({ ...settings, baseDate: e.target.value })} />
          </label>
          <label className="grid gap-2 text-sm">
            <span>基准人数</span>
            <input className={fieldClass} type="number" value={settings.baseParticipants} onChange={(e) => setSettings({ ...settings, baseParticipants: Number(e.target.value) || 0 })} />
          </label>
        </div>
      </div>

      <DataTable
        loading={false}
        rows={leaderboard}
        rowKey={(row) => row.id || `${row.rank}-${row.username}`}
        emptyText="暂无排行榜数据"
        columns={[
          { key: 'rank', title: '排名', render: (item) => item.rank },
          { key: 'name', title: '用户名', render: (item) => item.username },
          { key: 'trades', title: '交易笔数', render: (item) => item.trades },
          { key: 'winRate', title: '胜率', render: (item) => `${Number(item.winRate).toFixed(2)}%` },
          { key: 'profit', title: '收益', render: (item) => <span className="text-emerald-700">₫{Number(item.profit).toLocaleString()}</span> },
          {
            key: 'status',
            title: '状态',
            render: () => <StatusBadge tone="blue">可编辑</StatusBadge>,
          },
          {
            key: 'actions',
            title: '操作',
            render: (item) => (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setEditingId(item.id || null); setEditingItem({ ...item }); }}>
                  <Pencil className="h-4 w-4" />
                  编辑
                </Button>
                <Button variant="danger" onClick={() => setDeleteTarget(item)}>
                  <Trash2 className="h-4 w-4" />
                  删除
                </Button>
              </div>
            ),
          },
        ]}
      />

      {isAdding && (
        <Modal
          title="添加排行榜记录"
          onClose={() => setIsAdding(false)}
          footer={
            <>
              <Button onClick={() => setIsAdding(false)} disabled={saving}>
                取消
              </Button>
              <Button variant="primary" onClick={handleAdd} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
            </>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input className={fieldClass} placeholder="排名" type="number" value={newItem.rank} onChange={(e) => setNewItem({ ...newItem, rank: Number(e.target.value) || 0 })} />
            <input className={fieldClass} placeholder="用户名" value={newItem.username} onChange={(e) => setNewItem({ ...newItem, username: e.target.value })} />
            <input className={fieldClass} placeholder="交易笔数" type="number" value={newItem.trades} onChange={(e) => setNewItem({ ...newItem, trades: Number(e.target.value) || 0 })} />
            <input className={fieldClass} placeholder="胜率" type="number" value={newItem.winRate} onChange={(e) => setNewItem({ ...newItem, winRate: Number(e.target.value) || 0 })} />
            <input className={fieldClass} placeholder="收益" type="number" value={newItem.profit} onChange={(e) => setNewItem({ ...newItem, profit: Number(e.target.value) || 0 })} />
            <input className={fieldClass} placeholder="头像" value={newItem.avatar} onChange={(e) => setNewItem({ ...newItem, avatar: e.target.value })} />
          </div>
        </Modal>
      )}

      {editingItem && editingId && (
        <Modal
          title="编辑排行榜记录"
          onClose={() => {
            setEditingId(null);
            setEditingItem(null);
          }}
          footer={
            <>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setEditingItem(null);
                }}
                disabled={saving}
              >
                取消
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
            </>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input className={fieldClass} value={editingItem.rank} type="number" onChange={(e) => setEditingItem({ ...editingItem, rank: Number(e.target.value) || 0 })} />
            <input className={fieldClass} value={editingItem.username} onChange={(e) => setEditingItem({ ...editingItem, username: e.target.value })} />
            <input className={fieldClass} value={editingItem.trades} type="number" onChange={(e) => setEditingItem({ ...editingItem, trades: Number(e.target.value) || 0 })} />
            <input className={fieldClass} value={editingItem.winRate} type="number" onChange={(e) => setEditingItem({ ...editingItem, winRate: Number(e.target.value) || 0 })} />
            <input className={fieldClass} value={editingItem.profit} type="number" onChange={(e) => setEditingItem({ ...editingItem, profit: Number(e.target.value) || 0 })} />
            <input className={fieldClass} value={editingItem.avatar} onChange={(e) => setEditingItem({ ...editingItem, avatar: e.target.value })} />
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="删除排行榜记录"
          danger
          message={`确定删除 ${deleteTarget.username} 的记录吗？`}
          confirmText="确认删除"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
