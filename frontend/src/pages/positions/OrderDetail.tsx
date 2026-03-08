import { ArrowLeft, Battery, Wifi, Signal, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAccount } from '../../contexts/AccountContext';
import apiClient from '../../utils/api';

interface OrderDetail {
  id: number;
  stockCode: string;
  stockName: string;
  tradeType: 'bull' | 'bear';
  investmentAmount: number;
  openPrice: number;
  closePrice: number;
  profitLoss: number;
  result: 'win' | 'loss' | 'draw';
  openTime: string;
  closeTime: string;
  expectedCloseTime: string;
  accountType: 'demo' | 'real';
}

export default function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { accountType } = useAccount();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/trade/order/${orderId}`, {
        params: { accountType }
      });
      const orderData = response.data.data || response.data;
      setOrder(orderData);
    } catch (error) {
      console.error('获取订单详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateProfitRate = () => {
    if (!order) return 0;
    return ((order.profitLoss / order.investmentAmount) * 100).toFixed(2);
  };

  const handleTradeAgain = () => {
    if (order) {
      navigate(`/trading?stock=${order.stockCode}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-gray-400">订单不存在</div>
      </div>
    );
  }

  const isProfit = order.profitLoss > 0;

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
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

      {/* Header */}
      <div className="bg-[#141820] px-4 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-center relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 w-9 h-9 flex items-center justify-center hover:bg-gray-700/30 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-white text-base font-medium">订单详情</h1>
        </div>
      </div>

      {/* Icon Section */}
      <div className="px-4 pt-8 pb-6 text-center">
        <div className="flex justify-center mb-4">
          {isProfit ? (
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-green-400" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
              <TrendingDown className="w-10 h-10 text-red-400" />
            </div>
          )}
        </div>
        <div className="text-white text-lg mb-2">
          {isProfit ? '恭喜您！' : '别灰心'}
        </div>
        <div className="text-gray-400 text-sm px-6">
          {isProfit
            ? `这笔交易获得了 ${order.profitLoss >= 0 ? '+' : ''}${order.profitLoss.toLocaleString()} VND`
            : '市场瞬息万变，每一次波动都是成长的机会。'}
        </div>
      </div>

      {/* Info Section */}
      <div className="px-4 pb-24">
        <div className="bg-[#1f2633] rounded-xl border border-gray-700/50 overflow-hidden">
          <InfoRow label="账户类型" value={order.accountType === 'demo' ? '模拟账户' : '真实账户'} />
          <InfoRow label="投资金额" value={`${order.investmentAmount.toLocaleString()} VND`} />
          <InfoRow
            label="盈亏金额"
            value={`${order.profitLoss >= 0 ? '+' : ''}${order.profitLoss.toLocaleString()} VND`}
            valueColor={order.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          <InfoRow
            label="盈亏比例"
            value={`${order.profitLoss >= 0 ? '+' : ''}${calculateProfitRate()}%`}
            valueColor={order.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          <InfoRow
            label="交易方向"
            value={order.tradeType === 'bull' ? '看涨' : '看跌'}
            valueColor={order.tradeType === 'bull' ? 'text-green-400' : 'text-red-400'}
          />
          <InfoRow label="开仓时间" value={formatDate(order.openTime)} />
          <InfoRow label="开仓价格" value={Number(order.openPrice).toFixed(2)} />
          <InfoRow label="到期时间" value={formatDate(order.expectedCloseTime || order.closeTime)} />
          <InfoRow label="平仓价格" value={Number(order.closePrice).toFixed(2)} />
          <InfoRow label="订单号" value={String(order.id)} noBorder />
        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#141820] border-t border-gray-700/50 px-4 py-4">
        <button
          onClick={handleTradeAgain}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors active:scale-[0.98]"
        >
          再来一笔
        </button>
      </div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  valueColor?: string;
  noBorder?: boolean;
}

function InfoRow({ label, value, valueColor = 'text-white', noBorder = false }: InfoRowProps) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 ${!noBorder ? 'border-b border-gray-700/30' : ''}`}>
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`text-sm font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}
