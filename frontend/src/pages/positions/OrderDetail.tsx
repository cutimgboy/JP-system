import { ArrowLeft, Copy, Share, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAccount } from '../../contexts/AccountContext';
import apiClient, { extractData } from '../../utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Toast } from '../../components/Toast';

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
  const [showShare, setShowShare] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/trade/order/${orderId}`, {
        params: { accountType }
      });
      const orderData = extractData(response);
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

  const getShareText = () => {
    if (!order) return '';
    const profitPrefix = order.profitLoss >= 0 ? '+' : '';
    return [
      `我的 ${order.stockName || order.stockCode} 交易已结算`,
      `方向: ${order.tradeType === 'bull' ? '看涨' : '看跌'}`,
      `盈亏: ${profitPrefix}${Number(order.profitLoss || 0).toLocaleString()} VND`,
      `订单号: ${order.id}`,
    ].join('\n');
  };

  const handleShare = async () => {
    const text = getShareText();
    try {
      if (navigator.share) {
        await navigator.share({
          title: '交易订单分享',
          text,
        });
        setShowShare(false);
        return;
      }

      await navigator.clipboard.writeText(text);
      setToast({ message: '分享内容已复制', type: 'success' });
      setShowShare(false);
    } catch (error) {
      console.error('分享失败:', error);
      setToast({ message: '分享失败，请稍后重试', type: 'error' });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setToast({ message: '分享内容已复制', type: 'success' });
    } catch (error) {
      setToast({ message: '复制失败', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-gray-400">订单不存在</div>
      </div>
    );
  }

  const isProfit = order.profitLoss > 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#09090b]/90 backdrop-blur-md px-4 py-4 border-b border-white/5">
        <div className="flex items-center justify-center relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-[18px] font-medium">订单详情</h1>
        </div>
      </div>

      {/* PnL Section */}
      <div className="px-6 pt-8 pb-6 text-center border-b border-white/5 bg-gradient-to-b from-[#14141c] to-transparent">
        <div className="text-[#8a8a93] text-[13px] mb-2">盈亏结算 (VND)</div>
        <div className={`text-[40px] font-bold font-mono tracking-tight mb-3 ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
          {order.profitLoss >= 0 ? '+' : ''}{Number(order.profitLoss || 0).toLocaleString()}
        </div>
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
        <div className="bg-[#14141c] rounded-[20px] border border-white/5 overflow-hidden shadow-sm">
          <InfoRow label="订单状态" value="已结算" valueColor="text-[#10b981]" />
          <InfoRow label="交易品种" value={order.stockName || order.stockCode} />
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

        <div className="mt-4 rounded-[16px] border border-[#6c48f5]/10 bg-[#6c48f5]/5 p-4 text-[12px] leading-relaxed text-[#8a8a93]">
          所有交易数据均实时同步至结算中心。系统采用加密传输和账户隔离机制，保障您的资金安全。
        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent border-t border-white/5 px-4 py-4">
        <div className="flex gap-3">
        <button
          onClick={handleTradeAgain}
          className="flex-1 bg-[#1a1a24] border border-white/5 text-white py-3.5 rounded-full font-medium hover:bg-[#23232c] transition-colors active:scale-[0.98]"
        >
          再来一笔
        </button>
          <button
            onClick={() => setShowShare(true)}
            className="flex-1 bg-[#6c48f5] text-white py-3.5 rounded-full font-medium hover:bg-[#5a3bd9] transition-colors active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(108,72,245,0.35)]"
          >
            <Share size={18} />
            分享交易
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          >
            <button
              onClick={() => setShowShare(false)}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="w-full max-w-[320px] overflow-hidden rounded-[24px] border border-[#6c48f5]/30 bg-[#14141c] shadow-[0_0_40px_rgba(108,72,245,0.35)]"
            >
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] text-[#8a8a93]">交易分享</div>
                    <div className="text-[16px] font-bold">{order.stockName || order.stockCode}</div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                    order.tradeType === 'bull' ? 'bg-[#ef4444]/15 text-[#ef4444]' : 'bg-[#10b981]/15 text-[#10b981]'
                  }`}>
                    {order.tradeType === 'bull' ? '看涨' : '看跌'}
                  </div>
                </div>

                <div className="mb-5 text-center">
                  <div className="mb-1 text-[13px] text-[#8a8a93]">本次盈亏</div>
                  <div className={`font-mono text-[42px] font-bold leading-none ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {order.profitLoss >= 0 ? '+' : ''}{Number(order.profitLoss || 0).toLocaleString()}
                  </div>
                  <div className="mt-2 text-[13px] text-[#8a8a93]">收益率 {order.profitLoss >= 0 ? '+' : ''}{calculateProfitRate()}%</div>
                </div>

                <div className="space-y-3 rounded-[16px] border border-white/5 bg-[#09090b] p-4 text-[13px]">
                  <div className="flex justify-between text-[#8a8a93]">
                    <span>投资金额</span>
                    <span className="font-mono text-white">{order.investmentAmount.toLocaleString()} VND</span>
                  </div>
                  <div className="flex justify-between text-[#8a8a93]">
                    <span>开仓价格</span>
                    <span className="font-mono text-white">{Number(order.openPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#8a8a93]">
                    <span>结算价格</span>
                    <span className="font-mono text-white">{Number(order.closePrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#8a8a93]">
                    <span>订单号</span>
                    <span className="font-mono text-white">{order.id}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 border-t border-white/5">
                <button onClick={handleCopy} className="flex h-14 items-center justify-center gap-2 text-white hover:bg-white/5">
                  <Copy size={18} />
                  复制
                </button>
                <button onClick={handleShare} className="flex h-14 items-center justify-center gap-2 bg-[#6c48f5] text-white hover:bg-[#5a3bd9]">
                  <Share size={18} />
                  分享
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className={`flex items-center justify-between px-4 py-3.5 ${!noBorder ? 'border-b border-white/5' : ''}`}>
      <span className="text-[#8a8a93] text-sm">{label}</span>
      <span className={`text-sm font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}
