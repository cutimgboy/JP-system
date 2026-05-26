import {
  Activity,
  Bitcoin,
  ChevronLeft,
  Download,
  Share,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAccount } from '../../contexts/AccountContext';
import apiClient, { extractData } from '../../utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Toast } from '../../components/Toast';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';

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
  durationSeconds?: number;
  status?: string;
}

const ORDER_PREFIX = 'TRD';
const ORDER_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function formatDateTime(dateString?: string) {
  if (!dateString) return '--';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '--';

  const pad = (value: number) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-')
    + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return Number(value || 0).toLocaleString('en-US', options);
}

function formatPrice(value: number) {
  return formatNumber(Number(value || 0), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getOrderDisplayNo(order: OrderDetail) {
  const letters = (order.stockCode || 'TRD')
    .replace(/[^a-z]/gi, '')
    .toUpperCase()
    .padEnd(3, 'X')
    .slice(0, 3);
  const openedAt = new Date(order.openTime || '').getTime();
  const timeSeed = Number.isFinite(openedAt) ? Math.floor(openedAt / 1000) : 0;
  const stockSeed = letters
    .split('')
    .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 17), 0);
  let mixed = ((Number(order.id || 0) * 2654435761) ^ timeSeed ^ stockSeed) >>> 0;
  const suffix = Array.from({ length: 8 }, (_, index) => {
    mixed = (mixed ^ (mixed << 13)) >>> 0;
    mixed = (mixed ^ (mixed >>> 17)) >>> 0;
    mixed = (mixed ^ (mixed << 5) ^ (index * 1013904223)) >>> 0;
    return ORDER_ALPHABET[mixed % ORDER_ALPHABET.length];
  }).join('');

  return `${ORDER_PREFIX}-${letters}-${suffix}`;
}

function isDrawOrder(order: OrderDetail) {
  const openPrice = Number(order.openPrice);
  const closePrice = Number(order.closePrice);

  return Number.isFinite(openPrice)
    && Number.isFinite(closePrice)
    && openPrice === closePrice;
}

function getDisplayProfitLoss(order: OrderDetail) {
  return isDrawOrder(order) ? 0 : Number(order.profitLoss || 0);
}

function getProfitRate(order: OrderDetail) {
  const investment = Number(order.investmentAmount || 0);
  if (!investment || isDrawOrder(order)) return 0;

  return (getDisplayProfitLoss(order) / investment) * 100;
}

function formatSignedNumber(value: number) {
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return formatNumber(value);
  return '0';
}

function formatSignedRate(value: number) {
  const formatted = Math.abs(value).toFixed(2);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return '0.00';
}

function getDurationLabel(order: OrderDetail) {
  const duration = Number(order.durationSeconds || 0);
  const fallbackSeconds = Math.max(
    0,
    Math.round(
      (new Date(order.expectedCloseTime || order.closeTime).getTime()
        - new Date(order.openTime).getTime()) / 1000,
    ),
  );
  const seconds = duration || fallbackSeconds || 30;

  if (seconds < 60) return `${seconds}s`;
  if (seconds % 60 === 0) return `${seconds / 60}min`;
  return `${seconds}s`;
}

function getAppOnlineUrl() {
  const configuredUrl = String(import.meta.env.VITE_APP_URL || '').trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
}

export default function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { accountType } = useAccount();
  const sharePosterRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [savingShareImage, setSavingShareImage] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const appOnlineUrl = getAppOnlineUrl();

  useEffect(() => {
    void fetchOrderDetail();
  }, [orderId, accountType]);

  useEffect(() => {
    let isActive = true;

    const generateQrCode = async () => {
      if (!appOnlineUrl) {
        setQrCodeDataUrl('');
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(appOnlineUrl, {
          width: 192,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#09090b',
            light: '#ffffff',
          },
        });

        if (isActive) {
          setQrCodeDataUrl(dataUrl);
        }
      } catch (error) {
        console.error('生成二维码失败:', error);
        if (isActive) {
          setQrCodeDataUrl('');
        }
      }
    };

    void generateQrCode();

    return () => {
      isActive = false;
    };
  }, [appOnlineUrl]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/trade/order/${orderId}`, {
        params: { accountType },
      });
      const orderData = extractData<OrderDetail>(response);
      setOrder(orderData);
    } catch (error) {
      console.error('获取订单详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTradeAgain = () => {
    if (order) {
      navigate(`/trading?stock=${order.stockCode}`);
    }
  };

  const handleSaveShareImage = async () => {
    if (!sharePosterRef.current || savingShareImage) return;

    try {
      setSavingShareImage(true);
      await document.fonts?.ready;
      const dataUrl = await toPng(sharePosterRef.current, {
        cacheBust: true,
        pixelRatio: Math.min(window.devicePixelRatio || 2, 3),
        backgroundColor: '#14141c',
      });
      const link = document.createElement('a');
      const safeOrderNo = order ? getOrderDisplayNo(order).replace(/[^a-z0-9-]/gi, '') : 'order';
      link.href = dataUrl;
      link.download = `nexus-trade-${safeOrderNo}.png`;
      link.click();
      setToast({ message: '分享图已保存', type: 'success' });
      setShowShare(false);
    } catch (error) {
      console.error('保存分享图失败:', error);
      setToast({ message: '保存失败，请稍后重试', type: 'error' });
    } finally {
      setSavingShareImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="text-[#8a8a93]">加载中...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="text-[#8a8a93]">订单不存在</div>
      </div>
    );
  }

  const displayProfitLoss = getDisplayProfitLoss(order);
  const profitRate = getProfitRate(order);
  const isProfit = displayProfitLoss > 0;
  const isLoss = displayProfitLoss < 0;
  const assetName = order.stockName || order.stockCode;
  const orderNo = getOrderDisplayNo(order);
  const pnlTextClass = isProfit ? 'text-[#10b981]' : isLoss ? 'text-[#ef4444]' : 'text-white';
  const pnlGlowClass = isProfit
    ? 'drop-shadow-[0_0_15px_rgba(16,185,129,0.25)]'
    : isLoss
      ? 'drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]'
      : '';
  const directionText = order.tradeType === 'bull' ? '买涨' : '买跌';
  const directionClass = order.tradeType === 'bull' ? 'text-[#10b981]' : 'text-[#ef4444]';
  const directionBgClass = order.tradeType === 'bull'
    ? 'bg-[#10b981]/10 text-[#10b981]'
    : 'bg-[#ef4444]/10 text-[#ef4444]';

  return (
    <div className="absolute inset-0 z-50 flex flex-col overflow-hidden bg-[#09090b] text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="relative z-10 flex h-[60px] shrink-0 items-center justify-between border-b border-white/5 bg-[#09090b]/80 px-4 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium text-white">
          订单详情
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto pb-[100px]">
        {/* Top PnL Area */}
        <div className="flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-[#14141c] to-transparent px-6 pb-6 pt-8">
          <div className="mb-2 text-[13px] text-[#8a8a93]">盈亏结算 (VND)</div>
          <div className={`mb-2 font-mono text-[40px] font-bold tracking-tight ${pnlTextClass} ${pnlGlowClass}`}>
            {formatSignedNumber(displayProfitLoss)}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-[#1a1a24] px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-[#8a8a93]" />
            <span className="text-[12px] text-[#8a8a93]">已结算</span>
          </div>
        </div>

        {/* Details Card */}
        <div className="space-y-4 px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 rounded-[20px] border border-white/5 bg-[#14141c] p-5 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${directionBgClass}`}>
                  {order.tradeType === 'bull' ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                </div>
                <div>
                  <div className="text-[16px] font-bold">{assetName}</div>
                  <div className={`mt-0.5 text-[12px] font-medium ${directionClass}`}>
                    {directionText}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-0.5 text-[12px] text-[#8a8a93]">订单号</div>
                <div className="font-mono text-[13px]">{orderNo}</div>
              </div>
            </div>

            <div className="space-y-4">
              <DetailRow label="投资金额" value={`${formatNumber(order.investmentAmount)} VND`} />
              <DetailRow label="开仓价格" value={formatPrice(order.openPrice)} />
              <DetailRow label="结算价格" value={formatPrice(order.closePrice)} />
              <DetailRow
                label="收益率"
                value={`${formatSignedRate(profitRate)}%`}
                valueClassName={`font-mono ${pnlTextClass}`}
              />
            </div>

            <div className="space-y-4 border-t border-white/5 pt-4">
              <DetailRow label="开仓时间" value={formatDateTime(order.openTime)} valueClassName="font-mono text-white/90" />
              <DetailRow
                label="到期时间"
                value={formatDateTime(order.expectedCloseTime || order.closeTime)}
                valueClassName="font-mono text-white/90"
              />
            </div>
          </motion.div>

          <div className="mb-4 flex items-start gap-2 rounded-[16px] border border-[#6c48f5]/10 bg-[#6c48f5]/5 p-4">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#6c48f5]" />
            <p className="text-[12px] leading-relaxed text-[#8a8a93]">
              所有交易数据均实时同步至链上/结算中心，保证公开透明。系统采用银行级加密，保障您的资金安全。
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/5 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleTradeAgain}
            className="flex h-[52px] flex-1 items-center justify-center rounded-full border border-white/5 bg-[#1a1a24] font-medium text-white transition-all active:scale-95"
          >
            再来一笔
          </button>
          <button
            onClick={() => setShowShare(true)}
            className="flex h-[52px] flex-1 items-center justify-center rounded-full bg-[#6c48f5] font-medium text-white shadow-[0_4px_16px_rgba(108,72,245,0.4)] transition-all active:scale-95"
          >
            <Share size={18} className="mr-2" />
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
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          >
            <button
              onClick={() => setShowShare(false)}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <X size={20} />
            </button>

            <motion.div
              ref={sharePosterRef}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative flex w-full max-w-[320px] flex-col overflow-hidden rounded-[24px] border border-[#6c48f5]/30 bg-[#14141c]/80 shadow-[0_0_40px_rgba(108,72,245,0.4)] backdrop-blur-2xl"
            >
              <div className="relative z-10 flex items-center gap-2 px-6 pb-2 pt-6">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#6c48f5] shadow-[0_0_10px_rgba(108,72,245,0.6)]">
                  <Activity size={14} className="text-white" />
                </div>
                <span className="text-sm font-bold tracking-wider text-white drop-shadow-md">NEXUS TRADE</span>
              </div>

              <div className="relative z-10 px-6 pb-4">
                <div className="mb-5 text-center">
                  <div className="mb-1 text-[13px] text-[#8a8a93]">{getDurationLabel(order)}交易收益</div>
                  <div className={`font-mono text-[48px] font-bold leading-none tracking-tight ${pnlTextClass} ${pnlGlowClass}`}>
                    {formatSignedRate(profitRate)}
                    <span className="text-[24px]">%</span>
                  </div>
                  <div className={`mt-2 font-mono text-[16px] ${pnlTextClass}`}>
                    {formatSignedNumber(displayProfitLoss)} VND
                  </div>
                </div>

                <div className="mb-4 space-y-3 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8a8a93]">交易品种</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f7931a]">
                        <Bitcoin size={14} className="text-white" />
                      </div>
                      <span className="font-medium text-white">{assetName}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8a8a93]">交易方向</span>
                    <span className={`font-medium ${directionClass}`}>{directionText}</span>
                  </div>
                </div>
              </div>

              <div className="relative mt-2 h-[140px] w-full">
                <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#6c48f5]/20 to-transparent mix-blend-overlay" />
                <img
                  src="/order-share-ad.png"
                  alt=""
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover opacity-80 mix-blend-screen"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#14141c] via-[#14141c]/40 to-transparent" />
              </div>

              <div className="relative z-10 -mt-8 px-6 pb-6">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">扫码加入交易</span>
                    <span className="mt-0.5 text-xs text-[#8a8a93]">交易全球资产 获取全球收益</span>
                  </div>
                  <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[10px] border-2 border-white bg-white p-1 shadow-lg">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="扫码打开 NEXUS TRADE"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-[6px] bg-[#09090b]/10" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleSaveShareImage}
              disabled={savingShareImage}
              className="mt-8 flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-[#09090b] transition-transform active:scale-95 disabled:opacity-60"
              style={{ color: '#09090b' }}
            >
              <Download size={18} color="#09090b" />
              <span className="text-[16px] leading-none" style={{ color: '#09090b' }}>
                {savingShareImage ? '保存中...' : '保存图片'}
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function DetailRow({ label, value, valueClassName = 'font-mono text-white' }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[14px] text-[#8a8a93]">{label}</span>
      <span className={`text-right text-[14px] font-medium ${valueClassName}`}>{value}</span>
    </div>
  );
}
