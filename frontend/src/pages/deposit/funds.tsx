import { ArrowLeft, Battery, Wifi, Signal, Building2 } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';

interface BankCard {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string | null;
}

export function DepositFunds() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [systemBankCard, setSystemBankCard] = useState<BankCard | null>(null);
  const [loading, setLoading] = useState(true);

  // 从路由状态获取用户选择的银行卡
  const userBankCard = location.state?.userBankCard as BankCard | undefined;

  useEffect(() => {
    // 如果没有用户银行卡信息，返回上一页
    if (!userBankCard) {
      navigate('/deposit');
      return;
    }
    fetchSystemBankCard();
  }, [userBankCard, navigate]);

  const fetchSystemBankCard = async () => {
    try {
      const response: any = await apiClient.get('/system-bank-card/active');
      console.log('系统银行卡响应:', response);
      const actualData = response.data || response;
      if (actualData.code === 0 || response.code === 0) {
        const card = actualData.data || actualData;
        setSystemBankCard(card);
      }
    } catch (error) {
      console.error('获取系统银行卡失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          setCopiedField(field);
          setTimeout(() => setCopiedField(null), 2000);
        }).catch(() => {
          setCopiedField(field);
          setTimeout(() => setCopiedField(null), 2000);
        });
      } else {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      }
    } catch (error) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!systemBankCard) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-gray-400 mb-4">暂无可用的收款银行卡</div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate(-1)}
            className="absolute left-0 w-9 h-9 flex items-center justify-center hover:bg-gray-700/30 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-white text-base font-medium">存入资金</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6 pb-32">
        {/* User Bank Card Section */}
        <div className="mb-6">
          <h2 className="text-sm text-gray-300 mb-3">扣款银行</h2>
          <div className="bg-[#1f2633] rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#141820] rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium mb-1">{userBankCard?.bankName}</div>
                <div className="text-xs text-gray-400">
                  <div>{userBankCard?.accountName}</div>
                  <div>{userBankCard && maskAccountNumber(userBankCard.accountNumber)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Information Section */}
        <div>
          <h2 className="text-white font-medium mb-4">转账至J.P.银行</h2>

          {/* Receiving Bank */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">收款银行</label>
            <div className="bg-[#1f2633] rounded-lg px-4 py-3 border border-gray-700/50 flex items-center justify-between">
              <span className="text-white">{systemBankCard.bankName}</span>
              <button
                onClick={() => copyToClipboard(systemBankCard.bankName, 'bank')}
                className="px-3 py-1 text-sm text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700/30 transition-colors"
              >
                {copiedField === 'bank' ? '已复制' : '复制'}
              </button>
            </div>
          </div>

          {/* Account Number */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">收款账号</label>
            <div className="bg-[#1f2633] rounded-lg px-4 py-3 border border-gray-700/50 flex items-center justify-between">
              <span className="text-white">{systemBankCard.accountNumber}</span>
              <button
                onClick={() => copyToClipboard(systemBankCard.accountNumber, 'account')}
                className="px-3 py-1 text-sm text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700/30 transition-colors"
              >
                {copiedField === 'account' ? '已复制' : '复制'}
              </button>
            </div>
          </div>

          {/* Account Holder Name */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">收款人名称</label>
            <div className="bg-[#1f2633] rounded-lg px-4 py-3 border border-gray-700/50 flex items-center justify-between">
              <span className="text-white">{systemBankCard.accountName}</span>
              <button
                onClick={() => copyToClipboard(systemBankCard.accountName, 'name')}
                className="px-3 py-1 text-sm text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700/30 transition-colors"
              >
                {copiedField === 'name' ? '已复制' : '复制'}
              </button>
            </div>
          </div>

          {/* SWIFT Code */}
          {systemBankCard.swiftCode && (
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">SWIFT 代码</label>
              <div className="bg-[#1f2633] rounded-lg px-4 py-3 border border-gray-700/50 flex items-center justify-between">
                <span className="text-white">{systemBankCard.swiftCode}</span>
                <button
                  onClick={() => copyToClipboard(systemBankCard.swiftCode!, 'swift')}
                  className="px-3 py-1 text-sm text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700/30 transition-colors"
                >
                  {copiedField === 'swift' ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Button - Fixed at bottom */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <button
          onClick={() => navigate('/deposit/upload', { state: { userBankCard, systemBankCard } })}
          className="w-full py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          我已转账，通知J.P.收款
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
