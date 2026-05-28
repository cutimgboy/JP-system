import { useEffect, useRef, useState } from 'react';
import { tx } from "../../../i18n/text";
export interface KLineData {
  time: number;
  price: number;
  sequence?: number;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}
interface KLineChartProps {
  data: KLineData[];
  width?: number;
  height?: number;
  currentPrice?: number;
  countdownTime?: number;
  entryPrice?: number;
  entryTime?: number;
  entryPointSequence?: number;
  tradeType?: 'bull' | 'bear' | null;
  profitLoss?: number;
  showProfit?: boolean;
  getTrendColor?: (isUp: boolean) => string;
  getProfitColor?: (value: number) => string;
  getTradeColor?: (tradeType: 'bull' | 'bear') => string;
}
type CanvasPoint = KLineData & {
  x: number;
  y: number;
  drawPrice: number;
};
type CanvasSize = {
  width: number;
  height: number;
};
type EntryAnchor = {
  key: string;
  point: KLineData | null;
};
type ChartRenderState = {
  data: KLineData[];
  canvasSize: CanvasSize;
  currentPrice?: number;
  countdownTime?: number;
  entryPrice?: number;
  entryTime?: number;
  entryPointSequence?: number;
  tradeType?: 'bull' | 'bear' | null;
  profitLoss?: number;
  showProfit: boolean;
  getTrendColor: (isUp: boolean) => string;
  getProfitColor: (value: number) => string;
  getTradeColor: (tradeType: 'bull' | 'bear') => string;
};
const MAX_CHART_SLOTS = 70;
const FIXED_HEAD_INDEX = 42;
const TRANSITION_MS = 850;
const FRAME_INTERVAL_MS = 1000 / 30;
const DEFAULT_RED = '#ef4444';
const DEFAULT_GREEN = '#10b981';
const defaultTrendColor = (isUp: boolean) => isUp ? DEFAULT_RED : DEFAULT_GREEN;
const defaultProfitColor = (value: number) => value >= 0 ? DEFAULT_RED : DEFAULT_GREEN;
const defaultTradeColor = (tradeType: 'bull' | 'bear') => tradeType === 'bull' ? DEFAULT_RED : DEFAULT_GREEN;
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
function getEntryAnchorKey(
  entryPrice: number | undefined,
  entryTime: number | undefined,
  entryPointSequence: number | undefined,
  tradeType: 'bull' | 'bear' | null | undefined
) {
  if (typeof entryPrice !== 'number' || typeof entryTime !== 'number' || !tradeType) {
    return null;
  }
  return `${tradeType}:${entryTime}:${entryPrice}:${entryPointSequence ?? 'no-sequence'}`;
}
function resolveEntryAnchorPoint(
  data: KLineData[],
  entryTime: number,
  entryPrice: number,
  entryPointSequence: number | undefined
) {
  if (typeof entryPointSequence === 'number' && Number.isFinite(entryPointSequence)) {
    return data.find(point => point.sequence === entryPointSequence) ?? null;
  }
  let closest: KLineData | null = null;
  let closestTimeDistance = Number.POSITIVE_INFINITY;
  let closestPriceDistance = Number.POSITIVE_INFINITY;
  data.forEach(point => {
    const timeDistance = Math.abs(point.time - entryTime);
    const priceDistance = Math.abs(point.price - entryPrice);
    if (timeDistance < closestTimeDistance || timeDistance === closestTimeDistance && priceDistance <= closestPriceDistance) {
      closest = point;
      closestTimeDistance = timeDistance;
      closestPriceDistance = priceDistance;
    }
  });
  return closest && closestTimeDistance <= 2 ? closest : null;
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
function drawSmoothLine(ctx: CanvasRenderingContext2D, points: CanvasPoint[]) {
  if (points.length === 0) {
    return;
  }
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length === 1) {
    return;
  }
  for (let i = 1; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    ctx.quadraticCurveTo(current.x, current.y, midX, midY);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
}
function drawTradeIcon(ctx: CanvasRenderingContext2D, x: number, y: number, isBull: boolean, color: string) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (isBull) {
    ctx.moveTo(x - 5.5, y + 3.5);
    ctx.lineTo(x - 1.5, y - 0.5);
    ctx.lineTo(x + 1.5, y + 2.5);
    ctx.lineTo(x + 6, y - 4);
    ctx.moveTo(x + 2, y - 4);
    ctx.lineTo(x + 6, y - 4);
    ctx.lineTo(x + 6, y);
  } else {
    ctx.moveTo(x - 5.5, y - 3.5);
    ctx.lineTo(x - 1.5, y + 0.5);
    ctx.lineTo(x + 1.5, y - 2.5);
    ctx.lineTo(x + 6, y + 4);
    ctx.moveTo(x + 2, y + 4);
    ctx.lineTo(x + 6, y + 4);
    ctx.lineTo(x + 6, y);
  }
  ctx.stroke();
}
function drawEntryDot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}
export function KLineChart({
  data,
  width = 420,
  height = 300,
  currentPrice,
  countdownTime,
  entryPrice,
  entryTime,
  entryPointSequence,
  tradeType,
  profitLoss,
  showProfit = false,
  getTrendColor = defaultTrendColor,
  getProfitColor = defaultProfitColor,
  getTradeColor = defaultTradeColor
}: KLineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({
    width,
    height
  });
  const backingSizeRef = useRef({
    width: 0,
    height: 0,
    dpr: 0
  });
  const lastPointRef = useRef<KLineData | null>(null);
  const entryAnchorRef = useRef<EntryAnchor | null>(null);
  const transitionRef = useRef({
    latestTime: 0,
    startedAt: 0,
    previousPrice: 0
  });
  const renderStateRef = useRef<ChartRenderState>({
    data,
    canvasSize: {
      width,
      height
    },
    currentPrice,
    countdownTime,
    entryPrice,
    entryTime,
    entryPointSequence,
    tradeType,
    profitLoss,
    showProfit,
    getTrendColor,
    getProfitColor,
    getTradeColor
  });
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) {
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasSize({
          width: rect.width,
          height: rect.height
        });
      }
    };
    updateSize();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    if (observer && containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', updateSize);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  useEffect(() => {
    const latestPoint = data[data.length - 1];
    if (!latestPoint || latestPoint.time === transitionRef.current.latestTime) {
      return;
    }
    const previousPoint = lastPointRef.current ?? data[data.length - 2] ?? latestPoint;
    transitionRef.current = {
      latestTime: latestPoint.time,
      startedAt: performance.now(),
      previousPrice: previousPoint.price
    };
    lastPointRef.current = latestPoint;
  }, [data]);
  useEffect(() => {
    const key = getEntryAnchorKey(entryPrice, entryTime, entryPointSequence, tradeType);
    if (!key) {
      entryAnchorRef.current = null;
      return;
    }
    if (entryAnchorRef.current?.key === key && entryAnchorRef.current.point) {
      return;
    }
    entryAnchorRef.current = {
      key,
      point: resolveEntryAnchorPoint(data, entryTime as number, entryPrice as number, entryPointSequence)
    };
  }, [data, entryPointSequence, entryPrice, entryTime, tradeType]);
  useEffect(() => {
    renderStateRef.current = {
      data,
      canvasSize,
      currentPrice,
      countdownTime,
      entryPrice,
      entryTime,
      entryPointSequence,
      tradeType,
      profitLoss,
      showProfit,
      getTrendColor,
      getProfitColor,
      getTradeColor
    };
  }, [canvasSize, countdownTime, currentPrice, data, entryPointSequence, entryPrice, entryTime, getProfitColor, getTradeColor, getTrendColor, profitLoss, showProfit, tradeType]);
  useEffect(() => {
    let animationId = 0;
    let lastDrawAt = 0;
    const draw = () => {
      const {
        data: renderData,
        canvasSize: size,
        currentPrice: renderCurrentPrice,
        countdownTime: renderCountdownTime,
        entryPrice: renderEntryPrice,
        entryTime: renderEntryTime,
        entryPointSequence: renderEntryPointSequence,
        tradeType: renderTradeType,
        profitLoss: renderProfitLoss,
        showProfit: renderShowProfit,
        getTrendColor: renderTrendColor,
        getProfitColor: renderProfitColor,
        getTradeColor: renderTradeColor
      } = renderStateRef.current;
      const canvas = canvasRef.current;
      if (!canvas || renderData.length === 0 || size.width <= 0 || size.height <= 0) {
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = size.width;
      const logicalHeight = size.height;
      const backingWidth = Math.max(1, Math.floor(logicalWidth * dpr));
      const backingHeight = Math.max(1, Math.floor(logicalHeight * dpr));
      if (backingSizeRef.current.width !== backingWidth || backingSizeRef.current.height !== backingHeight || backingSizeRef.current.dpr !== dpr) {
        canvas.width = backingWidth;
        canvas.height = backingHeight;
        backingSizeRef.current = {
          width: backingWidth,
          height: backingHeight,
          dpr
        };
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
      const sourceData = renderData.slice(-Math.min(renderData.length, FIXED_HEAD_INDEX + 1));
      const latestPoint = sourceData[sourceData.length - 1];
      const age = performance.now() - transitionRef.current.startedAt;
      const progress = clamp(age / TRANSITION_MS, 0, 1);
      const easedProgress = progress < 1 ? 1 - Math.pow(1 - progress, 3) : 1;
      const animatedLatestPrice = transitionRef.current.latestTime === latestPoint.time ? transitionRef.current.previousPrice + (latestPoint.price - transitionRef.current.previousPrice) * easedProgress : latestPoint.price;
      const chartPadding = {
        top: 12,
        right: 28,
        bottom: 30,
        left: 8
      };
      const chartWidth = logicalWidth - chartPadding.left - chartPadding.right;
      const chartHeight = logicalHeight - chartPadding.top - chartPadding.bottom;
      const slotWidth = chartWidth / (MAX_CHART_SLOTS - 1);
      const hasScrolled = renderData.length > FIXED_HEAD_INDEX + 1;
      const scrollShift = hasScrolled ? (1 - easedProgress) * slotWidth : 0;
      const domainPrices = sourceData.map((point, index) => index === sourceData.length - 1 ? animatedLatestPrice : point.price);
      if (typeof renderCurrentPrice === 'number' && Number.isFinite(renderCurrentPrice)) {
        domainPrices.push(renderCurrentPrice);
      }
      if (typeof renderEntryPrice === 'number' && Number.isFinite(renderEntryPrice)) {
        domainPrices.push(renderEntryPrice);
      }
      const rawMin = Math.min(...domainPrices);
      const rawMax = Math.max(...domainPrices);
      const rawRange = Math.max(rawMax - rawMin, Math.max(Math.abs(rawMax) * 0.02, 1));
      const priceMin = rawMin - rawRange * 0.18;
      const priceMax = rawMax + rawRange * 0.18;
      const priceRange = priceMax - priceMin || 1;
      const priceToY = (price: number) => {
        const normalized = (price - priceMin) / priceRange;
        return chartPadding.top + chartHeight - normalized * chartHeight;
      };
      const points: CanvasPoint[] = sourceData.map((point, index) => {
        const settledIndex = hasScrolled ? FIXED_HEAD_INDEX - (sourceData.length - 1 - index) : index;
        const isLatest = index === sourceData.length - 1;
        const drawPrice = isLatest ? animatedLatestPrice : point.price;
        const x = chartPadding.left + settledIndex * slotWidth + (hasScrolled && !isLatest ? scrollShift : 0);
        return {
          ...point,
          x,
          y: priceToY(drawPrice),
          drawPrice
        };
      });
      const firstPoint = points[0];
      const currentPoint = points[points.length - 1];
      const isUpTrend = currentPoint.drawPrice >= firstPoint.drawPrice;
      const trendColor = renderTrendColor(isUpTrend);
      const trendFill = trendColor.toLowerCase() === DEFAULT_RED ? 'rgba(239, 68, 68, ' : 'rgba(16, 185, 129, ';
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      for (let i = 0; i <= FIXED_HEAD_INDEX; i += 7) {
        const x = chartPadding.left + i * slotWidth;
        ctx.beginPath();
        ctx.moveTo(x, chartPadding.top);
        ctx.lineTo(x, chartPadding.top + chartHeight);
        ctx.stroke();
      }
      for (let i = 0; i <= 4; i += 1) {
        const y = chartPadding.top + chartHeight * i / 4;
        ctx.beginPath();
        ctx.moveTo(chartPadding.left, y);
        ctx.lineTo(logicalWidth - chartPadding.right, y);
        ctx.stroke();
      }
      ctx.restore();
      if (points.length > 1) {
        const bottomY = chartPadding.top + chartHeight;
        const gradient = ctx.createLinearGradient(0, chartPadding.top, 0, bottomY);
        gradient.addColorStop(0, `${trendFill}0.28)`);
        gradient.addColorStop(0.65, `${trendFill}0.08)`);
        gradient.addColorStop(1, `${trendFill}0)`);
        ctx.beginPath();
        drawSmoothLine(ctx, points);
        ctx.lineTo(currentPoint.x, bottomY);
        ctx.lineTo(firstPoint.x, bottomY);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.beginPath();
        drawSmoothLine(ctx, points);
        ctx.strokeStyle = trendColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = trendColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      const fixedX = currentPoint.x;
      const bottomY = chartPadding.top + chartHeight;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(fixedX, chartPadding.top + 2);
      ctx.lineTo(fixedX, bottomY);
      ctx.stroke();
      ctx.restore();
      const flagTop = chartPadding.top + 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(fixedX, flagTop);
      ctx.lineTo(fixedX, flagTop + 20);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(fixedX + 1, flagTop);
      ctx.lineTo(fixedX + 15, flagTop + 4);
      ctx.lineTo(fixedX + 1, flagTop + 8);
      ctx.closePath();
      ctx.fill();
      const pulse = 0.72 + Math.sin(performance.now() / 240) * 0.28;
      ctx.fillStyle = `${trendFill}${0.24 * pulse})`;
      ctx.beginPath();
      ctx.arc(fixedX, currentPoint.y, 13 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `${trendFill}${0.42 * pulse})`;
      ctx.beginPath();
      ctx.arc(fixedX, currentPoint.y, 7 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = trendColor;
      ctx.beginPath();
      ctx.arc(fixedX, currentPoint.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      const currentLabel = currentPoint.drawPrice.toFixed(2);
      const labelWidth = 68;
      const labelHeight = 22;
      const labelX = clamp(fixedX + 10, chartPadding.left, logicalWidth - labelWidth - 2);
      const labelY = clamp(currentPoint.y - labelHeight / 2, chartPadding.top, bottomY - labelHeight);
      roundRect(ctx, labelX, labelY, labelWidth, labelHeight, 6);
      ctx.fillStyle = 'rgba(26, 26, 36, 0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.stroke();
      ctx.fillStyle = '#f4f4f5';
      ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentLabel, labelX + labelWidth / 2, labelY + labelHeight / 2);
      if (typeof renderCountdownTime === 'number' && renderCountdownTime > 0) {
        const countdownText = `${Math.ceil(renderCountdownTime)}s`;
        const boxWidth = 48;
        const boxHeight = 24;
        const boxX = clamp(fixedX - boxWidth / 2, 4, logicalWidth - boxWidth - 4);
        const boxY = bottomY - boxHeight - 6;
        roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 8);
        ctx.fillStyle = 'rgba(26, 26, 36, 0.95)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 12px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countdownText, boxX + boxWidth / 2, boxY + boxHeight / 2);
      }
      if (typeof renderEntryPrice === 'number' && typeof renderEntryTime === 'number' && renderTradeType) {
        const isBull = renderTradeType === 'bull';
        const tradeColor = renderTradeColor(renderTradeType);
        const anchorKey = getEntryAnchorKey(renderEntryPrice, renderEntryTime, renderEntryPointSequence, renderTradeType);
        const entryAnchor = anchorKey && entryAnchorRef.current?.key === anchorKey ? entryAnchorRef.current : null;
        const entrySourceIndex = entryAnchor?.point ? sourceData.indexOf(entryAnchor.point) : -1;
        const entryPoint = entrySourceIndex >= 0 ? points[entrySourceIndex] : null;
        if (entryPoint) {
          const entryX = entryPoint.x;
          const entryY = clamp(entryPoint.y, chartPadding.top, bottomY);
          const entryPriceLabel = entryPoint.price.toFixed(2);
          ctx.save();
          ctx.strokeStyle = tradeColor;
          ctx.lineWidth = 1.2;
          ctx.shadowColor = tradeColor;
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.moveTo(entryX, entryY);
          ctx.lineTo(logicalWidth - chartPadding.right, entryY);
          ctx.stroke();
          ctx.restore();
          const entryLabelWidth = 68;
          const entryLabelX = logicalWidth - chartPadding.right - entryLabelWidth;
          const entryLabelY = clamp(entryY - 11, chartPadding.top, bottomY - 22);
          roundRect(ctx, entryLabelX, entryLabelY, entryLabelWidth, 22, 6);
          ctx.fillStyle = tradeColor;
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 10px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(entryPriceLabel, entryLabelX + entryLabelWidth / 2, entryLabelY + 11);
          drawEntryDot(ctx, entryX, entryY, tradeColor);
          const iconY = clamp(entryY - 28, chartPadding.top + 12, bottomY - 12);
          drawTradeIcon(ctx, entryX, iconY, isBull, tradeColor);
        }
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const latestTime = latestPoint.time;
      for (let i = 0; i <= FIXED_HEAD_INDEX; i += 10) {
        const x = chartPadding.left + i * slotWidth;
        const labelTime = latestTime - (FIXED_HEAD_INDEX - i);
        const date = new Date(labelTime * 1000);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        ctx.fillText(`${hours}:${minutes}`, x, bottomY + 7);
      }
      if (renderShowProfit && typeof renderProfitLoss === 'number') {
        const isProfit = renderProfitLoss >= 0;
        const color = renderProfitColor(renderProfitLoss);
        const boxWidth = 136;
        const boxHeight = 64;
        const boxX = clamp(fixedX - boxWidth - 16, 8, logicalWidth - boxWidth - 8);
        const boxY = clamp(currentPoint.y - boxHeight / 2, chartPadding.top, bottomY - boxHeight);
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 24;
        roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 12);
        ctx.fillStyle = isProfit ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
        ctx.font = '600 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isProfit ? tx("盈利") : tx("亏损"), boxX + boxWidth / 2, boxY + 19);
        ctx.fillStyle = color;
        ctx.font = '800 22px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText(`${isProfit ? '+' : ''}${Math.floor(renderProfitLoss).toLocaleString()}`, boxX + boxWidth / 2, boxY + 42);
      }
    };
    const animate = (now: number) => {
      if (document.visibilityState !== 'hidden' && now - lastDrawAt >= FRAME_INTERVAL_MS) {
        lastDrawAt = now;
        draw();
      }
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);
  return <div ref={containerRef} className="relative h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full" style={{
      width: '100%',
      height: '100%'
    }} />
    </div>;
}
