import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Message {
  id?: number;
  icon: string;
  title: string;
  content: string;
  actionText: string;
  type: 'success' | 'warning' | 'info' | 'celebration';
  sortOrder?: number;
}

export function MessageManagement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Message | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Message>({
    icon: '📢',
    title: '',
    content: '',
    actionText: '查看详情',
    type: 'info',
    sortOrder: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_BASE_URL}/api/admin/messages`, { headers });
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(
        `${API_BASE_URL}/api/admin/messages`,
        newItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAdding(false);
      setNewItem({
        icon: '📢',
        title: '',
        content: '',
        actionText: '查看详情',
        type: 'info',
        sortOrder: 0,
      });
      fetchData();
    } catch (error) {
      console.error('添加失败:', error);
      alert('添加失败');
    }
  };

  const handleEdit = (item: Message) => {
    setEditingId(item.id!);
    setEditingItem({ ...item });
  };

  const handleSave = async () => {
    if (!editingItem || !editingId) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${API_BASE_URL}/api/admin/messages/${editingId}`,
        editingItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条消息吗？')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(
        `${API_BASE_URL}/api/admin/messages/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const typeOptions = [
    { value: 'success', label: '成功', color: 'text-green-600' },
    { value: 'warning', label: '警告', color: 'text-orange-600' },
    { value: 'info', label: '信息', color: 'text-blue-600' },
    { value: 'celebration', label: '庆祝', color: 'text-purple-600' },
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">消息管理</h1>

      {/* 消息列表 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">消息列表</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加消息
          </button>
        </div>

        {/* 添加表单 */}
        {isAdding && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="grid grid-cols-1 gap-3 mb-3">
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="图标 (如: 📢)"
                  value={newItem.icon}
                  onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                  className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                  className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                >
                  {typeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="排序"
                  value={newItem.sortOrder}
                  onChange={(e) => setNewItem({ ...newItem, sortOrder: parseInt(e.target.value) || 0 })}
                  className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="标题"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <textarea
                placeholder="内容"
                value={newItem.content}
                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                rows={3}
                className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="操作按钮文字"
                value={newItem.actionText}
                onChange={(e) => setNewItem({ ...newItem, actionText: e.target.value })}
                className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 消息列表 */}
        <div className="space-y-3">
          {messages.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              {editingId === item.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={editingItem?.icon}
                      onChange={(e) => setEditingItem({ ...editingItem!, icon: e.target.value })}
                      className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300"
                    />
                    <select
                      value={editingItem?.type}
                      onChange={(e) => setEditingItem({ ...editingItem!, type: e.target.value as any })}
                      className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300"
                    >
                      {typeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={editingItem?.sortOrder}
                      onChange={(e) => setEditingItem({ ...editingItem!, sortOrder: parseInt(e.target.value) || 0 })}
                      className="bg-white text-gray-800 px-3 py-2 rounded border border-gray-300"
                    />
                  </div>
                  <input
                    type="text"
                    value={editingItem?.title}
                    onChange={(e) => setEditingItem({ ...editingItem!, title: e.target.value })}
                    className="w-full bg-white text-gray-800 px-3 py-2 rounded border border-gray-300"
                  />
                  <textarea
                    value={editingItem?.content}
                    onChange={(e) => setEditingItem({ ...editingItem!, content: e.target.value })}
                    rows={3}
                    className="w-full bg-white text-gray-800 px-3 py-2 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={editingItem?.actionText}
                    onChange={(e) => setEditingItem({ ...editingItem!, actionText: e.target.value })}
                    className="w-full bg-white text-gray-800 px-3 py-2 rounded border border-gray-300"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingItem(null);
                      }}
                      className="text-gray-500 hover:text-gray-600 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-800 font-medium">{item.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            typeOptions.find(t => t.value === item.type)?.color
                          } bg-gray-100`}>
                            {typeOptions.find(t => t.value === item.type)?.label}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{item.content}</p>
                        <p className="text-yellow-600 text-sm">👉 {item.actionText}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id!)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
