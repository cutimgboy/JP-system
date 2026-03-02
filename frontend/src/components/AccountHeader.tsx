import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';

interface AccountHeaderProps {
  accountType: 'demo' | 'real';
  onAccountSwitch: (type: 'demo' | 'real') => void;
  showDepositButton?: boolean;
}

export function AccountHeader({
  accountType,
  onAccountSwitch,
  showDepositButton = true,
}: AccountHeaderProps) {
  const navigate = useNavigate();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [demoBalance, setDemoBalance] = useState(0);
  const [realBalance, setRealBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // 获取账户余额
  const fetchBalance = async (type: 'demo' | 'real') => {
    try {
      const response = await apiClient.get('/account/balance', {
        params: { accountType: type }
      });
      const balanceData = response.data.data || response.data;
      const balance = balanceData.balance || 0;

      if (type === 'demo') {
        setDemoBalance(balance);
      } else {
        setRealBalance(balance);
      }
    } catch (error) {
      console.error(`获取${type}账户余额失败:`, error);
    }
  };

  // 初始化时获取两个账户的余额
  useEffect(() => {
    const loadBalances = async () => {
      setLoading(true);
      await Promise.all([
        fetchBalance('demo'),
        fetchBalance('real')
      ]);
      setLoading(false);
    };

    loadBalances();

    // 每5秒刷新一次余额
    const interval = setInterval(() => {
      fetchBalance('demo');
      fetchBalance('real');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 当账户类型切换时，刷新对应账户的余额
  useEffect(() => {
    fetchBalance(accountType);
  }, [accountType]);

  const accountData = {
    demo: {
      label: '模拟账户',
      balance: loading ? '加载中...' : `${demoBalance.toLocaleString()} VND`
    },
    real: {
      label: '真实账户',
      balance: loading ? '加载中...' : `${realBalance.toLocaleString()} VND`
    }
  };

  const handleAccountSwitch = (type: 'demo' | 'real') => {
    onAccountSwitch(type);
    setShowAccountDropdown(false);
  };

  return (
    <div className="bg-[#141820] px-4 py-4 border-b border-gray-700/50 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white">FT</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  accountType === 'demo'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {accountData[accountType].label}
                </span>
                <span className="text-xs text-gray-400">可用资金</span>
                {showAccountDropdown ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="text-white">{accountData[accountType].balance}</div>
            </button>

            {/* Account Dropdown */}
            {showAccountDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAccountDropdown(false)}
                />

                {/* Dropdown Menu */}
                <div className="absolute left-0 top-full mt-2 w-64 bg-[#1f2633] border border-gray-700/50 rounded-lg shadow-lg z-20 overflow-hidden">
                  <div className="py-2">
                    {/* Demo Account Option */}
                    <button
                      onClick={() => handleAccountSwitch('demo')}
                      className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors ${
                        accountType === 'demo' ? 'bg-blue-500/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          accountType === 'demo' ? 'bg-blue-500/20' : 'bg-gray-700/50'
                        }`}>
                          <span className={`text-sm ${
                            accountType === 'demo' ? 'text-blue-400' : 'text-gray-400'
                          }`}>模拟</span>
                        </div>
                        <div className="text-left">
                          <div className="text-sm text-white">{accountData.demo.label}</div>
                          <div className="text-sm text-gray-400">{accountData.demo.balance}</div>
                        </div>
                      </div>
                      {accountType === 'demo' && (
                        <Check className="w-5 h-5 text-blue-400" />
                      )}
                    </button>

                    {/* Divider */}
                    <div className="h-px bg-gray-700/50 my-1"></div>

                    {/* Real Account Option */}
                    <button
                      onClick={() => handleAccountSwitch('real')}
                      className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors ${
                        accountType === 'real' ? 'bg-green-500/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          accountType === 'real' ? 'bg-green-500/20' : 'bg-gray-700/50'
                        }`}>
                          <span className={`text-sm ${
                            accountType === 'real' ? 'text-green-400' : 'text-gray-400'
                          }`}>真实</span>
                        </div>
                        <div className="text-left">
                          <div className="text-sm text-white">{accountData.real.label}</div>
                          <div className="text-sm text-gray-400">{accountData.real.balance}</div>
                        </div>
                      </div>
                      {accountType === 'real' && (
                        <Check className="w-5 h-5 text-green-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {showDepositButton && (
          <button
            onClick={() => navigate('/deposit')}
            className="px-4 py-1.5 bg-blue-600 !text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            存款/充值
          </button>
        )}
      </div>
    </div>
  );
}
