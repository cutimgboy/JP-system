import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Toast } from '../components/Toast';
import {
  Button,
  ConfirmDialog,
  DataTable,
  Modal,
  PageHeader,
  StatusBadge,
  fieldClass,
  textareaClass,
} from '../components/AdminUI';
import { apiClient, extractData, isSuccessResponse } from '../utils/api';

interface Message {
  id?: number;
  icon: string;
  title: string;
  content: string;
  actionText: string;
  type: 'success' | 'warning' | 'info' | 'celebration';
  sortOrder?: number;
}

const defaultMessage: Message = {
  icon: '📢',
  title: '',
  content: '',
  actionText: '查看详情',
  type: 'info',
  sortOrder: 0,
};

export function MessageManagement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Message | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Message>(defaultMessage);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/api/admin/messages');
      const messagesData = extractData<Message[]>(response) || [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error('获取数据失败:', error);
      setToast({ message: '获取消息失败', type: 'error' });
    }
  };

  const handleAdd = async () => {
    if (!newItem.title.trim() || !newItem.content.trim()) {
      setToast({ message: '标题和内容不能为空', type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const response = await apiClient.post('/api/admin/messages', newItem);
      if (isSuccessResponse(response)) {
        setIsAdding(false);
        setNewItem(defaultMessage);
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
      const response = await apiClient.put(`/api/admin/messages/${editingId}`, editingItem);
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
      const response = await apiClient.delete(`/api/admin/messages/${deleteTarget.id}`);
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

  const typeLabel = (value: Message['type']) => {
    switch (value) {
      case 'success':
        return '成功';
      case 'warning':
        return '警告';
      case 'celebration':
        return '庆祝';
      default:
        return '信息';
    }
  };

  const typeTone = (value: Message['type']) => {
    switch (value) {
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'celebration':
        return 'violet';
      default:
        return 'blue';
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="消息管理"
        description="维护消息中心内容、按钮文案和排序"
        actions={
          <Button variant="primary" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" />
            添加消息
          </Button>
        }
      />

      <DataTable
        loading={false}
        rows={messages}
        rowKey={(row) => row.id || `${row.title}-${row.sortOrder}`}
        emptyText="暂无消息内容"
        columns={[
          { key: 'icon', title: '图标', render: (item) => <span className="text-xl">{item.icon}</span> },
          { key: 'title', title: '标题', render: (item) => item.title },
          { key: 'content', title: '内容', render: (item) => <div className="max-w-[480px] text-slate-600">{item.content}</div> },
          { key: 'actionText', title: '按钮文案', render: (item) => item.actionText },
          { key: 'type', title: '类型', render: (item) => <StatusBadge tone={typeTone(item.type)}>{typeLabel(item.type)}</StatusBadge> },
          { key: 'sortOrder', title: '排序', render: (item) => item.sortOrder ?? 0 },
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
          title="添加消息"
          onClose={() => setIsAdding(false)}
          footer={
            <>
              <Button onClick={() => setIsAdding(false)} disabled={saving}>取消</Button>
              <Button variant="primary" onClick={handleAdd} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
            </>
          }
        >
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <input className={fieldClass} placeholder="图标" value={newItem.icon} onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })} />
              <select className={fieldClass} value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value as Message['type'] })}>
                <option value="info">信息</option>
                <option value="success">成功</option>
                <option value="warning">警告</option>
                <option value="celebration">庆祝</option>
              </select>
              <input className={fieldClass} type="number" placeholder="排序" value={newItem.sortOrder} onChange={(e) => setNewItem({ ...newItem, sortOrder: Number(e.target.value) || 0 })} />
            </div>
            <input className={fieldClass} placeholder="标题" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
            <textarea className={textareaClass} rows={4} placeholder="内容" value={newItem.content} onChange={(e) => setNewItem({ ...newItem, content: e.target.value })} />
            <input className={fieldClass} placeholder="操作按钮文字" value={newItem.actionText} onChange={(e) => setNewItem({ ...newItem, actionText: e.target.value })} />
          </div>
        </Modal>
      )}

      {editingItem && editingId && (
        <Modal
          title="编辑消息"
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
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <input className={fieldClass} value={editingItem.icon} onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })} />
              <select className={fieldClass} value={editingItem.type} onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as Message['type'] })}>
                <option value="info">信息</option>
                <option value="success">成功</option>
                <option value="warning">警告</option>
                <option value="celebration">庆祝</option>
              </select>
              <input className={fieldClass} type="number" value={editingItem.sortOrder} onChange={(e) => setEditingItem({ ...editingItem, sortOrder: Number(e.target.value) || 0 })} />
            </div>
            <input className={fieldClass} value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
            <textarea className={textareaClass} rows={4} value={editingItem.content} onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })} />
            <input className={fieldClass} value={editingItem.actionText} onChange={(e) => setEditingItem({ ...editingItem, actionText: e.target.value })} />
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="删除消息"
          danger
          message={`确定删除「${deleteTarget.title}」吗？`}
          confirmText="确认删除"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
