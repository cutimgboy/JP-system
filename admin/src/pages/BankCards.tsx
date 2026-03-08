import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

interface SystemBankCard {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string | null;
  isActive: number;
  status: number;
}

export function BankCards() {
  const [bankCards, setBankCards] = useState<SystemBankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<SystemBankCard | null>(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    swiftCode: '',
  });

  useEffect(() => {
    fetchBankCards();
  }, []);

  const fetchBankCards = async () => {
    try {
      const response = await apiClient.get('/system-bank-card/list');
      console.log('获取银行卡列表响应:', response);

      // 处理嵌套的响应结构
      const actualData = response.data || response;
      if (actualData.code === 0 || response.code === 0) {
        const cards = actualData.data || actualData || [];
        setBankCards(Array.isArray(cards) ? cards : []);
      } else {
        setBankCards([]);
      }
    } catch (error) {
      console.error('获取银行卡列表失败:', error);
      setBankCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCard(null);
    setFormData({
      bankName: '',
      accountName: '',
      accountNumber: '',
      swiftCode: '',
    });
    setShowModal(true);
  };

  const handleEdit = (card: SystemBankCard) => {
    setEditingCard(card);
    setFormData({
      bankName: card.bankName,
      accountName: card.accountName,
      accountNumber: card.accountNumber,
      swiftCode: card.swiftCode || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingCard) {
        // 更新
        const response = await apiClient.put(`/system-bank-card/${editingCard.id}`, formData);
        const actualData = response.data.data || response.data;
        if (actualData.code === 0 || response.data.code === 0) {
          alert('更新成功');
          fetchBankCards();
          setShowModal(false);
        } else {
          alert(actualData.msg || '更新失败');
        }
      } else {
        // 添加
        const response = await apiClient.post('/system-bank-card', formData);
        const actualData = response.data.data || response.data;
        if (actualData.code === 0 || response.data.code === 0) {
          alert('添加成功');
          fetchBankCards();
          setShowModal(false);
        } else {
          alert(actualData.msg || '添加失败');
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败');
    }
  };

  const handleActivate = async (id: number) => {
    if (!confirm('确定要启用这张银行卡吗？启用后其他银行卡将自动禁用。')) {
      return;
    }
    try {
      const response = await apiClient.put(`/system-bank-card/${id}/activate`);
      const actualData = response.data.data || response.data;
      if (actualData.code === 0 || response.data.code === 0) {
        alert('启用成功');
        fetchBankCards();
      } else {
        alert(actualData.msg || '启用失败');
      }
    } catch (error) {
      console.error('启用失败:', error);
      alert('启用失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这张银行卡吗？')) {
      return;
    }
    try {
      const response = await apiClient.delete(`/system-bank-card/${id}`);
      const actualData = response.data.data || response.data;
      if (actualData.code === 0 || response.data.code === 0) {
        alert('删除成功');
        fetchBankCards();
      } else {
        alert(actualData.msg || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">收款银行卡管理</h1>
        <p className="text-gray-600 mt-1">管理系统收款银行卡信息，同一时间只能启用一张</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + 添加银行卡
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">银行名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">账户号码</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">账户名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SWIFT代码</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bankCards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  bankCards.map((card) => (
                    <tr key={card.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.bankName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.accountNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.accountName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.swiftCode || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {card.isActive === 1 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            已启用
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            未启用
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {card.isActive === 0 && (
                          <button
                            onClick={() => handleActivate(card.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            启用
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(card)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCard ? '编辑银行卡' : '添加银行卡'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  银行名称 *
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入银行名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  账户名称 *
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入账户名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  账户号码 *
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入账户号码"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SWIFT代码（选填）
                </label>
                <input
                  type="text"
                  value={formData.swiftCode}
                  onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入SWIFT代码"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.bankName || !formData.accountName || !formData.accountNumber}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
