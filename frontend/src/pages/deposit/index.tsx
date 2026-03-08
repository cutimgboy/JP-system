import { ArrowLeft, Battery, Wifi, Signal, ChevronRight, Building2, Plus } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';
import { useAccount } from '../../contexts/AccountContext';
import { Toast } from '../../components/Toast';

interface BankCard {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string | null;
}

export function Deposit() {
  const navigate = useNavigate();
  const { accountType } = useAccount();
  const [bankCards, setBankCards] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    fetchBankCards();
  }, []);

  const fetchBankCards = async () => {
    try {
      const response: any = await apiClient.get('/bank-card/list');
      console.log('银行卡列表响应:', response);
      const actualData = response.data || response;
      if (actualData.code === 0 || response.code === 0) {
        const cards = actualData.data || actualData || [];
        setBankCards(cards);
      }
    } catch (error) {
      console.error('获取银行卡列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 8) {
      return accountNumber;
    }
    const start = accountNumber.slice(0, 4);
    const end = accountNumber.slice(-4);
    return `${start} **** ${end}`;
  };

  const handleBankCardClick = (card: BankCard) => {
    // 所有账户类型都可以充值
    navigate('/deposit/funds', { state: { userBankCard: card } });
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] pb-16">
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
          <h1 className="text-white text-base font-medium">入金</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        {/* Title */}
        <h2 className="text-white text-lg font-medium mb-2">选择入金银行卡</h2>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-6">
          当前为您的账户银行卡：
        </p>

        {loading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : bankCards.length === 0 ? (
          <div className="text-center text-gray-400 py-12 mb-6">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p>还没有添加银行卡</p>
            <p className="text-sm mt-2">请先添加银行卡</p>
          </div>
        ) : (
          /* Bank Cards List */
          <div className="space-y-3 mb-4">
            {bankCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleBankCardClick(card)}
                className="w-full bg-[#1f2633] rounded-xl p-4 border border-gray-700/50 hover:bg-[#252b3a] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Bank Icon */}
                    <div className="w-12 h-12 bg-[#141820] rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-400" />
                    </div>

                    {/* Bank Info */}
                    <div className="text-left">
                      <div className="text-white font-medium mb-1">{card.bankName}</div>
                      <div className="text-gray-400 text-sm">{card.accountName}</div>
                      <div className="text-gray-400 text-sm">{maskAccountNumber(card.accountNumber)}</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Add Bank Card Button */}
        <button
          onClick={() => navigate('/my-bank')}
          className="w-full bg-[#1f2633] rounded-xl p-4 border border-gray-700/50 hover:bg-[#252b3a] transition-colors"
        >
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <Plus className="w-5 h-5" />
            <span className="font-medium">添加银行卡</span>
          </div>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

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
