import { ArrowLeft, Battery, Wifi, Signal } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../utils/api';

interface DepositDetail {
  id: number;
  userId: number;
  amount: number;
  userBankName: string;
  userAccountName: string;
  userAccountNumber: string;
  systemBankName: string;
  systemAccountName: string;
  systemAccountNumber: string;
  receiptImages: string | null;
  status: number;
  remark: string | null;
  createTime: string;
  reviewTime: string | null;
}

export function DepositDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [deposit, setDeposit] = useState<DepositDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const depositId = location.state?.depositId;

  useEffect(() => {
    if (!depositId) {
      navigate('/deposit');
      return;
    }
    fetchDepositDetail();
  }, [depositId]);

  const fetchDepositDetail = async () => {
    try {
      const response: any = await apiClient.get(`/deposit/${depositId}`);
      const depositData = extractData(response);
      if (depositData) {
        setDeposit(depositData);
      }
    } catch (error) {
      console.error('获取入金详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return '审核中';
      case 1:
        return '已到账';
      case 2:
        return '已拒绝';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'text-orange-400';
      case 1:
        return 'text-green-400';
      case 2:
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!deposit) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-gray-400">未找到入金记录</div>
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
          <h1 className="text-white text-base font-medium">入金详情</h1>
        </div>
      </div>

      {/* Amount Section */}
      <div className="bg-[#1a1f2e] px-4 py-12 text-center border-b border-gray-700/30">
        <div className="text-gray-400 text-sm mb-3">通知存入金额</div>
        <div className="text-white text-3xl font-medium tracking-wide">
          {deposit.amount.toLocaleString()} VND
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-[#1a1f2e] px-4 py-6">
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between py-3">
            <div className="text-gray-300 text-sm">状态</div>
            <div className={`text-sm font-medium ${getStatusColor(deposit.status)}`}>
              {getStatusText(deposit.status)}
            </div>
          </div>

          {/* Rejected Warning */}
          {deposit.status === 2 && deposit.remark && (
            <div className="text-right -mt-2 mb-2">
              <div className="text-red-400 text-xs">拒绝原因：{deposit.remark}</div>
            </div>
          )}

          {/* Notify Time */}
          <div className="flex items-center justify-between py-3">
            <div className="text-gray-300 text-sm">提交时间</div>
            <div className="text-white text-sm">{formatDate(deposit.createTime)}</div>
          </div>

          {/* Bank */}
          <div className="flex items-center justify-between py-3">
            <div className="text-gray-300 text-sm">汇款银行</div>
            <div className="text-white text-sm">{deposit.userBankName}</div>
          </div>

          {/* Arrival Amount */}
          <div className="flex items-center justify-between py-3">
            <div className="text-gray-300 text-sm">到账金额</div>
            <div className="text-white text-sm">
              {deposit.status === 1 ? `${deposit.amount.toLocaleString()} VND` : '——'}
            </div>
          </div>

          {/* Arrival Time */}
          <div className="flex items-center justify-between py-3">
            <div className="text-gray-300 text-sm">到账时间</div>
            <div className="text-white text-sm">
              {deposit.status === 1 && deposit.reviewTime ? formatDate(deposit.reviewTime) : '——'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
