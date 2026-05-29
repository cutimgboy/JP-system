import { ChevronLeft, Download, Share, ShieldCheck, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAccount } from '../../contexts/AccountContext';
import apiClient, { extractData } from '../../utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Toast } from '../../components/Toast';
import QRCode from 'qrcode';
import { tx } from "../../i18n/text";
import { formatVndAmount } from '../../utils/currency';
import { goBackOrNavigate } from '../../utils/navigation';
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
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return Number(value || 0).toLocaleString('en-US', options);
}
function formatPrice(value: number) {
  return formatNumber(Number(value || 0), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function getOrderDisplayNo(order: OrderDetail) {
  const letters = (order.stockCode || 'TRD').replace(/[^a-z]/gi, '').toUpperCase().padEnd(3, 'X').slice(0, 3);
  const openedAt = new Date(order.openTime || '').getTime();
  const timeSeed = Number.isFinite(openedAt) ? Math.floor(openedAt / 1000) : 0;
  const stockSeed = letters.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 17), 0);
  let mixed = (Number(order.id || 0) * 2654435761 ^ timeSeed ^ stockSeed) >>> 0;
  const suffix = Array.from({
    length: 8
  }, (_, index) => {
    mixed = (mixed ^ mixed << 13) >>> 0;
    mixed = (mixed ^ mixed >>> 17) >>> 0;
    mixed = (mixed ^ mixed << 5 ^ index * 1013904223) >>> 0;
    return ORDER_ALPHABET[mixed % ORDER_ALPHABET.length];
  }).join('');
  return `${ORDER_PREFIX}-${letters}-${suffix}`;
}
function isDrawOrder(order: OrderDetail) {
  const openPrice = Number(order.openPrice);
  const closePrice = Number(order.closePrice);
  return Number.isFinite(openPrice) && Number.isFinite(closePrice) && openPrice === closePrice;
}
function getDisplayProfitLoss(order: OrderDetail) {
  return isDrawOrder(order) ? 0 : Number(order.profitLoss || 0);
}
function getProfitRate(order: OrderDetail) {
  const investment = Number(order.investmentAmount || 0);
  if (!investment || isDrawOrder(order)) return 0;
  return getDisplayProfitLoss(order) / investment * 100;
}
function formatSignedNumber(value: number) {
  return formatVndAmount(value, { signed: true });
}
function formatSignedRate(value: number) {
  const formatted = Math.abs(value).toFixed(2);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return '0.00';
}
function formatShareMoney(value: number) {
  return formatVndAmount(value, { showCode: false, signed: true });
}
function formatShareAmount(value: number) {
  return formatVndAmount(Math.abs(value || 0), { showCode: false });
}
function formatShareRate(value: number) {
  const absoluteRate = Math.abs(value);
  const formatted = Number.isInteger(absoluteRate) ? absoluteRate.toFixed(0) : absoluteRate.toFixed(2);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}
function getDurationLabel(order: OrderDetail) {
  const duration = Number(order.durationSeconds || 0);
  const fallbackSeconds = Math.max(0, Math.round((new Date(order.expectedCloseTime || order.closeTime).getTime() - new Date(order.openTime).getTime()) / 1000));
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
function getPublicAssetUrl(path: string) {
  if (typeof window === 'undefined') return path;
  return new URL(path, window.location.origin).toString();
}
function imageUrlToDataUrl(path: string) {
  return fetch(getPublicAssetUrl(path), { cache: 'force-cache' }).then(response => {
    if (!response.ok) {
      throw new Error(`Failed to load image asset: ${path}`);
    }
    return response.blob();
  }).then(blob => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error(`Failed to read image asset: ${path}`));
    reader.readAsDataURL(blob);
  }));
}
function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load canvas image: ${src}`));
    image.src = src;
  });
}
async function tryLoadCanvasImage(src: string) {
  try {
    return await loadCanvasImage(src);
  } catch (error) {
    console.warn(error);
    return null;
  }
}
function buildRoundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const size = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + size, y);
  ctx.lineTo(x + width - size, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + size);
  ctx.lineTo(x + width, y + height - size);
  ctx.quadraticCurveTo(x + width, y + height, x + width - size, y + height);
  ctx.lineTo(x + size, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - size);
  ctx.lineTo(x, y + size);
  ctx.quadraticCurveTo(x, y, x + size, y);
  ctx.closePath();
}
function fillRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fillStyle: string) {
  buildRoundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}
function strokeRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, strokeStyle: string, lineWidth = 1) {
  buildRoundRectPath(ctx, x, y, width, height, radius);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}
function drawImageCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  if (!imageWidth || !imageHeight) return;
  const sourceRatio = imageWidth / imageHeight;
  const targetRatio = width / height;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;
  if (sourceRatio > targetRatio) {
    sourceWidth = imageHeight * targetRatio;
    sourceX = (imageWidth - sourceWidth) / 2;
  } else {
    sourceHeight = imageWidth / targetRatio;
    sourceY = (imageHeight - sourceHeight) / 2;
  }
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}
function drawRoundedImageCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number, radius: number) {
  ctx.save();
  buildRoundRectPath(ctx, x, y, width, height, radius);
  ctx.clip();
  drawImageCover(ctx, image, x, y, width, height);
  ctx.restore();
}
function drawCircleImageCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, size: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  drawImageCover(ctx, image, x, y, size, size);
  ctx.restore();
}
function truncateCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  const suffix = '...';
  let result = text;
  while (result.length > 0 && ctx.measureText(`${result}${suffix}`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}${suffix}`;
}
function drawCanvasText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth?: number) {
  ctx.fillText(maxWidth ? truncateCanvasText(ctx, text, maxWidth) : text, x, y);
}
async function createSharePosterDataUrl(order: OrderDetail, qrCodeDataUrl: string, appOnlineUrl: string) {
  const cssWidth = 320;
  const cssHeight = 658;
  const scale = Math.min(Math.max(window.devicePixelRatio || 2, 2), 3);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cssWidth * scale);
  canvas.height = Math.round(cssHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }
  ctx.scale(scale, scale);
  ctx.textBaseline = 'alphabetic';

  const displayProfitLoss = getDisplayProfitLoss(order);
  const profitRate = getProfitRate(order);
  const isProfit = displayProfitLoss > 0;
  const isLoss = displayProfitLoss < 0;
  const accentColor = isProfit ? '#10b981' : isLoss ? '#ef4444' : '#ffffff';
  const accentGlow = isProfit ? 'rgba(16,185,129,0.28)' : isLoss ? 'rgba(239,68,68,0.28)' : 'rgba(255,255,255,0.12)';
  const assetName = order.stockName || order.stockCode;
  const assetInitial = (assetName || order.stockCode || '?').trim().charAt(0).toUpperCase();
  const directionText = order.tradeType === 'bull' ? tx("买涨") : tx("买跌");
  const directionColor = order.tradeType === 'bull' ? '#10b981' : '#ef4444';
  const shareProfitText = formatShareMoney(displayProfitLoss);
  const shareAmountText = formatShareAmount(order.investmentAmount);
  const shareRateText = `${formatShareRate(profitRate)}%`;
  const qrDataUrl = qrCodeDataUrl || (appOnlineUrl ? await QRCode.toDataURL(appOnlineUrl, {
    width: 192,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#09090b',
      light: '#ffffff'
    }
  }) : '');
  const [appIcon, assetLogo, adImage, qrImage] = await Promise.all([
    tryLoadCanvasImage('/icons/icon-192.png'),
    tryLoadCanvasImage(`/logo/${order.stockCode}.svg`),
    tryLoadCanvasImage('/trad.png'),
    qrDataUrl ? tryLoadCanvasImage(qrDataUrl) : Promise.resolve(null)
  ]);

  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.save();
  buildRoundRectPath(ctx, 0, 0, cssWidth, cssHeight, 24);
  ctx.clip();
  ctx.fillStyle = '#111119';
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  if (appIcon) {
    ctx.save();
    ctx.shadowColor = 'rgba(108,72,245,0.65)';
    ctx.shadowBlur = 14;
    fillRoundRect(ctx, 24, 24, 32, 32, 8, '#1b1730');
    ctx.restore();
    drawRoundedImageCover(ctx, appIcon, 24, 24, 32, 32, 8);
  } else {
    fillRoundRect(ctx, 24, 24, 32, 32, 8, '#6c48f5');
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  drawCanvasText(ctx, 'JMP Trading', 68, 45, 180);

  ctx.fillStyle = '#8a8a93';
  ctx.font = '400 13px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${getDurationLabel(order)}${tx("交易收益")}`, cssWidth / 2, 105);

  let profitFontSize = shareProfitText.length > 12 ? 32 : shareProfitText.length > 10 ? 36 : 42;
  const codeFontSize = 20;
  const maxProfitWidth = 268;
  while (profitFontSize > 28) {
    ctx.font = `700 ${profitFontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`;
    const amountWidth = ctx.measureText(shareProfitText).width;
    ctx.font = `700 ${codeFontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`;
    const codeWidth = ctx.measureText('VND').width;
    if (amountWidth + codeWidth + 4 <= maxProfitWidth) break;
    profitFontSize -= 1;
  }
  ctx.textAlign = 'left';
  ctx.shadowColor = accentGlow;
  ctx.shadowBlur = 15;
  ctx.fillStyle = accentColor;
  ctx.font = `700 ${profitFontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`;
  const amountWidth = ctx.measureText(shareProfitText).width;
  ctx.font = `700 ${codeFontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`;
  const codeWidth = ctx.measureText('VND').width;
  const amountStartX = (cssWidth - amountWidth - codeWidth - 4) / 2;
  ctx.font = `700 ${profitFontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`;
  ctx.fillText(shareProfitText, amountStartX, 152);
  ctx.font = `700 ${codeFontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`;
  ctx.fillText('VND', amountStartX + amountWidth + 4, 152);
  ctx.shadowBlur = 0;

  ctx.textAlign = 'center';
  ctx.font = '400 17px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
  ctx.fillStyle = accentColor;
  ctx.fillText(`${tx("收益率")} ${shareRateText}`, cssWidth / 2, 196);

  fillRoundRect(ctx, 24, 220, 272, 84, 16, '#1c1c24');
  ctx.save();
  ctx.shadowColor = 'rgba(108,72,245,0.3)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(62, 262, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (assetLogo) {
    drawCircleImageCover(ctx, assetLogo, 40, 240, 44);
  } else {
    ctx.fillStyle = '#6c48f5';
    ctx.beginPath();
    ctx.arc(62, 262, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '700 18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(assetInitial, 62, 269);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 15px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  drawCanvasText(ctx, assetName, 96, 257, 118);
  ctx.fillStyle = '#8a8a93';
  ctx.font = '400 12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  drawCanvasText(ctx, order.stockCode, 96, 283, 118);
  ctx.textAlign = 'right';
  ctx.fillStyle = directionColor;
  ctx.font = '700 13px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`${order.tradeType === 'bull' ? '↗' : '↘'} ${directionText}`, 276, 253);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
  ctx.fillText(shareAmountText, 276, 289);
  ctx.textAlign = 'left';

  if (adImage) {
    drawRoundedImageCover(ctx, adImage, 24, 325, 272, 260, 12);
    const adFade = ctx.createLinearGradient(0, 505, 0, 585);
    adFade.addColorStop(0, 'rgba(17,17,25,0)');
    adFade.addColorStop(1, '#111119');
    ctx.save();
    buildRoundRectPath(ctx, 24, 325, 272, 260, 12);
    ctx.clip();
    ctx.fillStyle = adFade;
    ctx.fillRect(24, 505, 272, 80);
    ctx.restore();
  }

  fillRoundRect(ctx, 24, 558, 272, 76, 14, 'rgba(255,255,255,0.05)');
  strokeRoundRect(ctx, 24, 558, 272, 76, 14, 'rgba(255,255,255,0.1)');
  ctx.fillStyle = '#ffffff';
  ctx.font = '500 14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  drawCanvasText(ctx, tx("扫码加入交易"), 36, 587, 176);
  ctx.fillStyle = '#8a8a93';
  ctx.font = '400 12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  drawCanvasText(ctx, tx("交易全球资产 获取全球收益"), 36, 613, 176);
  fillRoundRect(ctx, 232, 570, 52, 52, 10, '#ffffff');
  if (qrImage) {
    drawRoundedImageCover(ctx, qrImage, 238, 576, 40, 40, 0);
  }

  ctx.restore();
  strokeRoundRect(ctx, 0.5, 0.5, cssWidth - 1, cssHeight - 1, 24, 'rgba(108,72,245,0.3)', 1);
  return canvas.toDataURL('image/png');
}
export default function OrderDetail() {
  const navigate = useNavigate();
  const {
    orderId
  } = useParams();
  const {
    accountType
  } = useAccount();
  const sharePosterRef = useRef<HTMLDivElement>(null);
  const shareAssetsPromiseRef = useRef<Promise<void> | null>(null);
  const assetLogoPromiseRef = useRef<Promise<void> | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [shareAppIconSrc, setShareAppIconSrc] = useState('/icons/icon-192.png');
  const [shareAdSrc, setShareAdSrc] = useState('/trad.png');
  const [assetLogoSrc, setAssetLogoSrc] = useState('');
  const [savingShareImage, setSavingShareImage] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
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
            light: '#ffffff'
          }
        });
        if (isActive) {
          setQrCodeDataUrl(dataUrl);
        }
      } catch (error) {
        console.error(tx("生成二维码失败:"), error);
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
  useEffect(() => {
    let isActive = true;
    const preloadShareAssets = async () => {
      try {
        const [appIconDataUrl, adDataUrl] = await Promise.all([imageUrlToDataUrl('/icons/icon-192.png'), imageUrlToDataUrl('/trad.png')]);
        if (isActive) {
          setShareAppIconSrc(appIconDataUrl);
          setShareAdSrc(adDataUrl);
        }
      } catch (error) {
        console.warn('Preload share poster assets failed:', error);
      }
    };
    const preloadPromise = preloadShareAssets();
    shareAssetsPromiseRef.current = preloadPromise;
    void preloadPromise;
    return () => {
      isActive = false;
    };
  }, []);
  useEffect(() => {
    if (!order?.stockCode) {
      setAssetLogoSrc('');
      assetLogoPromiseRef.current = null;
      return;
    }
    let isActive = true;
    setAssetLogoSrc('');
    const logoUrl = `/logo/${order.stockCode}.svg`;
    const preloadAssetLogo = async () => {
      try {
        const logoDataUrl = await imageUrlToDataUrl(logoUrl);
        if (isActive) {
          setAssetLogoSrc(logoDataUrl);
        }
      } catch (error) {
        console.warn('Preload asset logo failed:', error);
        if (isActive) {
          setAssetLogoSrc('');
        }
      }
    };
    const preloadPromise = preloadAssetLogo();
    assetLogoPromiseRef.current = preloadPromise;
    void preloadPromise;
    return () => {
      isActive = false;
    };
  }, [order?.stockCode]);
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/trade/order/${orderId}`, {
        params: {
          accountType
        }
      });
      const orderData = extractData<OrderDetail>(response);
      setOrder(orderData);
    } catch (error) {
      console.error(tx("获取订单详情失败:"), error);
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
    if (!order || savingShareImage) return;
    try {
      setSavingShareImage(true);
      await document.fonts?.ready;
      const dataUrl = await createSharePosterDataUrl(order, qrCodeDataUrl, appOnlineUrl);
      const link = document.createElement('a');
      const safeOrderNo = order ? getOrderDisplayNo(order).replace(/[^a-z0-9-]/gi, '') : 'order';
      link.href = dataUrl;
      link.download = `jmp-trading-${safeOrderNo}.png`;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({
        message: tx("分享图已保存"),
        type: 'success'
      });
      setShowShare(false);
    } catch (error) {
      console.error(tx("保存分享图失败:"), error);
      setToast({
        message: tx("保存失败，请稍后重试"),
        type: 'error'
      });
    } finally {
      setSavingShareImage(false);
    }
  };
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="text-[#8a8a93]">{tx("加载中...")}</div>
      </div>;
  }
  if (!order) {
    return <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="text-[#8a8a93]">{tx("订单不存在")}</div>
      </div>;
  }
  const displayProfitLoss = getDisplayProfitLoss(order);
  const profitRate = getProfitRate(order);
  const isProfit = displayProfitLoss > 0;
  const isLoss = displayProfitLoss < 0;
  const assetName = order.stockName || order.stockCode;
  const orderNo = getOrderDisplayNo(order);
  const pnlTextClass = isProfit ? 'text-[#10b981]' : isLoss ? 'text-[#ef4444]' : 'text-white';
  const pnlGlowClass = isProfit ? 'drop-shadow-[0_0_15px_rgba(16,185,129,0.25)]' : isLoss ? 'drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]' : '';
  const directionText = order.tradeType === 'bull' ? tx("买涨") : tx("买跌");
  const directionClass = order.tradeType === 'bull' ? 'text-[#10b981]' : 'text-[#ef4444]';
  const directionBgClass = order.tradeType === 'bull' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]';
  const shareProfitText = formatShareMoney(displayProfitLoss);
  const shareProfitTextSize = shareProfitText.length > 12 ? 'text-[32px]' : shareProfitText.length > 10 ? 'text-[36px]' : 'text-[42px]';
  const assetInitial = (assetName || order.stockCode || '?').trim().charAt(0).toUpperCase();
  return <div className="absolute inset-0 z-50 flex flex-col overflow-hidden bg-[#09090b] text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="relative z-10 flex h-[60px] shrink-0 items-center justify-between border-b border-white/5 bg-[#09090b]/80 px-4 backdrop-blur-md">
        <button onClick={() => goBackOrNavigate(navigate, '/positions')} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium text-white">{tx("订单详情")}</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto pb-[100px]">
        {/* Top PnL Area */}
        <div className="flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-[#14141c] to-transparent px-6 pb-6 pt-8">
          <div className="mb-2 text-[13px] text-[#8a8a93]">{tx("盈亏结算 (VND)")}</div>
          <div className={`mb-2 font-mono text-[40px] font-bold tracking-tight ${pnlTextClass} ${pnlGlowClass}`}>
            {formatSignedNumber(displayProfitLoss)}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-[#1a1a24] px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-[#8a8a93]" />
            <span className="text-[12px] text-[#8a8a93]">{tx("已结算")}</span>
          </div>
        </div>

        {/* Details Card */}
        <div className="space-y-4 px-4 py-6">
          <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-5 rounded-[20px] border border-white/5 bg-[#14141c] p-5 shadow-sm">
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
                <div className="mb-0.5 text-[12px] text-[#8a8a93]">{tx("订单号")}</div>
                <div className="font-mono text-[13px]">{orderNo}</div>
              </div>
            </div>

            <div className="space-y-4">
              <DetailRow label={tx("投资金额")} value={formatVndAmount(order.investmentAmount)} />
              <DetailRow label={tx("开仓价格")} value={formatPrice(order.openPrice)} />
              <DetailRow label={tx("结算价格")} value={formatPrice(order.closePrice)} />
              <DetailRow label={tx("收益率")} value={`${formatSignedRate(profitRate)}%`} valueClassName={`font-mono ${pnlTextClass}`} />
            </div>

            <div className="space-y-4 border-t border-white/5 pt-4">
              <DetailRow label={tx("开仓时间")} value={formatDateTime(order.openTime)} valueClassName="font-mono text-white/90" />
              <DetailRow label={tx("到期时间")} value={formatDateTime(order.expectedCloseTime || order.closeTime)} valueClassName="font-mono text-white/90" />
            </div>
          </motion.div>

          <div className="mb-4 flex items-start gap-2 rounded-[16px] border border-[#6c48f5]/10 bg-[#6c48f5]/5 p-4">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#6c48f5]" />
            <p className="text-[12px] leading-relaxed text-[#8a8a93]">{tx("所有交易数据均实时同步至链上/结算中心，保证公开透明。系统采用银行级加密，保障您的资金安全。")}</p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/5 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <button onClick={handleTradeAgain} className="flex h-[52px] flex-1 items-center justify-center rounded-full border border-white/5 bg-[#1a1a24] font-medium text-white transition-all active:scale-95">{tx("再来一笔")}</button>
          <button onClick={() => setShowShare(true)} className="flex h-[52px] flex-1 items-center justify-center rounded-full bg-[#6c48f5] font-medium text-white shadow-[0_4px_16px_rgba(108,72,245,0.4)] transition-all active:scale-95">
            <Share size={18} className="mr-2" />{tx("分享交易")}</button>
        </div>
      </div>

      <AnimatePresence>
        {showShare && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
            <button onClick={() => setShowShare(false)} className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
              <X size={20} />
            </button>

            <motion.div ref={sharePosterRef} initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} exit={{
          scale: 0.9,
          y: 20
        }} className="relative flex w-full max-w-[320px] flex-col overflow-hidden rounded-[24px] border border-[#6c48f5]/30 bg-[#111119] shadow-[0_0_40px_rgba(108,72,245,0.4)]">
              <div className="relative z-10 flex items-center gap-3 px-6 pb-3 pt-6">
             <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-[8px] shadow-[0_0_14px_rgba(108,72,245,0.65)]">
                    <img src={shareAppIconSrc} alt="JMP Trading" crossOrigin="anonymous" className="h-full w-full object-cover" />
                </div>
                <span className="text-sm font-bold tracking-wider text-white drop-shadow-md">JMP Trading</span>
              </div>

              <div className="relative z-10 px-6">
                <div className="mb-6 text-center">
                  <div className="mb-1 text-[13px] text-[#8a8a93]">{getDurationLabel(order)}{tx("交易收益")}</div>
                  <div className={`flex items-end justify-center gap-1 whitespace-nowrap font-mono font-bold leading-none tracking-normal ${pnlTextClass} ${pnlGlowClass}`}>
                    <span className={shareProfitTextSize}>{shareProfitText}</span>
                    <span className="pb-1 text-[20px]">VND</span>
                  </div>
                  <div className={`mt-3 flex justify-center gap-2 font-mono text-[17px] ${pnlTextClass}`}>
                    <span>{tx("收益率")}</span>
                    <span>{formatShareRate(profitRate)}%</span>
                  </div>
                </div>

                <div className="mb-5 flex min-h-[84px] items-center justify-between gap-3 rounded-[16px] bg-[#1c1c24] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_12px_rgba(108,72,245,0.3)]">
                           <img src={assetLogoSrc || `/logo/${order.stockCode}.svg`} alt={assetName} crossOrigin="anonymous" className="h-full w-full object-cover" onError={(e) => {
                     const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                        const parent = target.parentElement;
                   if (parent) {
                 parent.classList.add('bg-[#6c48f5]', 'text-[18px]', 'font-bold', 'text-white');
                        parent.classList.remove('bg-white');
                          parent.textContent = assetInitial;
                }
                      }} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-bold text-white">{assetName}</div>
                      <div className="mt-0.5 truncate text-[12px] text-[#8a8a93]">{order.stockCode}</div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`text-[13px] font-bold ${directionClass}`}>
                      <span className="mr-1">{order.tradeType === 'bull' ? '↗' : '↘'}</span>{directionText}
                    </div>
                    <div className="mt-1 font-mono text-[16px] font-bold text-white">{formatShareAmount(order.investmentAmount)}</div>
                  </div>
                </div>
              </div>

              <div className="relative h-[260px] w-full px-6">
                <img src={shareAdSrc} alt="" crossOrigin="anonymous" className="h-full w-full rounded-[12px] object-cover object-center opacity-95" />
                <div className="pointer-events-none absolute inset-x-6 bottom-0 h-20 rounded-b-[12px] bg-gradient-to-t from-[#111119] to-transparent" />
              </div>

              <div className="relative z-10 px-6 pb-6 pt-5">
                <div className="flex items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-white/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{tx("扫码加入交易")}</span>
                    <span className="mt-0.5 text-xs text-[#8a8a93]">{tx("交易全球资产 获取全球收益")}</span>
                  </div>
                  <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[10px] border-2 border-white bg-white p-1 shadow-lg">
                    {qrCodeDataUrl ? <img src={qrCodeDataUrl} alt={tx("扫码打开 JMP Trading")} className="h-full w-full object-cover" /> : <div className="h-full w-full rounded-[6px] bg-[#09090b]/10" />}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.button initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} onClick={handleSaveShareImage} disabled={savingShareImage} className="mt-8 flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-[#09090b] transition-transform active:scale-95 disabled:opacity-60" style={{
          color: '#09090b'
        }}>
              <Download size={18} color="#09090b" />
              <span className="text-[16px] leading-none" style={{
            color: '#09090b'
          }}>
                {savingShareImage ? tx("保存中...") : tx("保存图片")}
              </span>
            </motion.button>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
interface DetailRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}
function DetailRow({
  label,
  value,
  valueClassName = 'font-mono text-white'
}: DetailRowProps) {
  return <div className="flex items-center justify-between gap-4">
      <span className="text-[14px] text-[#8a8a93]">{label}</span>
      <span className={`text-right text-[14px] font-medium ${valueClassName}`}>{value}</span>
    </div>;
}
