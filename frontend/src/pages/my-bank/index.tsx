import { ArrowLeft, Battery, Wifi, Signal, Building2, Plus, Trash2 } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../utils/api';
import { Toast } from '../../components/Toast';

interface BankCard {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string | null;
  status: number;
}

export function MyBank() {
  const navigate = useNavigate();
  const [bankCards, setBankCards] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchBankCards();
  }, []);

  const fetchBankCards = async () => {
    try {
      const response: any = await apiClient.get('/bank-card/list');
      console.log('银行卡列表响应:', response);
      let cards = extractData(response) || [];
      if (!Array.isArray(cards)) {
        console.warn('银行卡列表不是数组,使用空数组');
        cards = [];
      }
      setBankCards(cards);
    } catch (error) {
      console.error('获取银行卡列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response: any = await apiClient.delete(`/bank-card/${id}`);
      const actualData = response.data || response;
      if (actualData.code === 0 || response.code === 0) {
        setToast({ message: '删除成功', type: 'success' });
        setDeleteConfirm(null);
        // 刷新列表
        fetchBankCards();
      } else {
        setToast({ message: actualData.msg || '删除失败', type: 'error' });
      }
    } catch (error) {
      console.error('删除银行卡失败:', error);
      setToast({ message: '删除失败，请重试', type: 'error' });
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 8) {
      return accountNumber;
    }
    const start = accountNumber.slice(0, 4);
    const end = accountNumber.slice(-4);
    return `${start} **** **** ${end}`;
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] pb-16">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1f2633] rounded-xl p-6 max-w-sm w-full border border-gray-700/50">
            <h3 className="text-white text-lg font-medium mb-3">确认删除</h3>
            <p className="text-gray-400 text-sm mb-6">确定要删除这张银行卡吗？删除后无法恢复。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

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
          <h1 className="text-white text-base font-medium">我的银行</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        {loading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : bankCards.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p>还没有添加银行卡</p>
            <p className="text-sm mt-2">点击下方按钮添加您的银行卡</p>
          </div>
        ) : (
          /* Bank Cards List */
          <div className="space-y-4 mb-6">
            {bankCards.map((card) => (
              <div
                key={card.id}
                className="bg-[#1f2633] rounded-xl p-4 border border-gray-700/50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[#141820] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium mb-1">{card.bankName}</div>
                    <div className="text-gray-400 text-sm mb-1">{card.accountName}</div>
                    <div className="text-gray-400 text-sm font-mono">
                      {maskAccountNumber(card.accountNumber)}
                    </div>
                    {card.swiftCode && (
                      <div className="text-gray-500 text-xs mt-1">
                        SWIFT: {card.swiftCode}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setDeleteConfirm(card.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Bank Card Button */}
        <button
          onClick={() => navigate('/my-bank/add')}
          className="w-full bg-[#1f2633] rounded-xl p-6 border-2 border-dashed border-gray-700/50 hover:border-blue-500/50 transition-colors"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-blue-400" />
            </div>
            <span className="text-white font-medium">添加银行卡</span>
            <span className="text-gray-400 text-sm">绑定新的银行卡</span>
          </div>
        </button>

        {/* Info */}
        <div className="mt-6 bg-[#1f2633] rounded-xl p-4 border border-gray-700/50">
          <p className="text-gray-400 text-xs leading-relaxed">
            提示：为了您的资金安全，请确保银行卡信息与实名认证信息一致。如需修改或删除银行卡，请联系客服。
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
