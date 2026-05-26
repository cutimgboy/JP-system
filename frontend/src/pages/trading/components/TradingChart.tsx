import { useState, useEffect, useRef } from 'react';
import { KLineChart, type KLineData } from './KLineChart';
import { API_BASE_URL, apiClient, extractData } from '../../../utils/api';
import { useTradeColors } from '../../../contexts/TradeColorContext';

interface TradingChartProps {
  countdown?: number; // 倒计时时间（秒）
  stockCode?: string; // 股票代码，默认为 AAPL.US
  entryPrice?: number; // 买入价
  entryTime?: number; // 买入时间（秒）
  tradeType?: 'bull' | 'bear' | null; // 交易方向
  onPriceUpdate?: (price: number, time: number) => void; // 价格更新回调
  onQuoteUpdate?: (quote: TradingQuoteSummary) => void; // 行情摘要更新回调
  profitLoss?: number; // 交易收益
  showProfit?: boolean; // 是否显示收益
}

export interface TradingQuoteSummary {
  price: number;
  change: number;
  changePercent: number;
  isUpTrend: boolean;
  time: number;
}

export function TradingChart({ countdown, stockCode = 'AAPL.US', entryPrice, entryTime, tradeType, onPriceUpdate, onQuoteUpdate, profitLoss, showProfit }: TradingChartProps) {
  const {
    getTrendTone,
    getProfitTone,
    getTradeTone,
    getToneBgClass,
    getToneColor,
    getToneTextClass,
  } = useTradeColors();
  const [kLineData, setKLineData] = useState<KLineData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const eventSourceRef = useRef<EventSource | null>(null);
  const pendingPointsRef = useRef<KLineData[]>([]);
  const flushTimerRef = useRef<number | null>(null);
  const latestPointRef = useRef<KLineData | null>(null);
  const kLineDataRef = useRef<KLineData[]>([]);

  const emitQuoteUpdate = (latestPoint: KLineData, series: KLineData[]) => {
    const firstPoint = series[0] || latestPoint;
    const change = latestPoint.price - firstPoint.price;
    const changePercent = firstPoint.price === 0 ? 0 : (change / firstPoint.price) * 100;

    onPriceUpdate?.(latestPoint.price, latestPoint.time);
    onQuoteUpdate?.({
      price: latestPoint.price,
      change,
      changePercent,
      isUpTrend: change >= 0,
      time: latestPoint.time,
    });
  };

  const flushPendingPoints = () => {
    const pending = pendingPointsRef.current;
    if (pending.length === 0) {
      return;
    }

    pendingPointsRef.current = [];
    const latestPoint = pending[pending.length - 1];
    latestPointRef.current = latestPoint;

    const updated = [...kLineDataRef.current, ...pending];
    const nextData = updated.length > 20 * 60 ? updated.slice(-20 * 60) : updated;
    kLineDataRef.current = nextData;
    setKLineData(nextData);
    setCurrentPrice(latestPoint.price);
    emitQuoteUpdate(latestPoint, nextData);
  };

  // SSE 连接实时数据
  useEffect(() => {
    // 只在浏览器环境中执行
    if (typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    // 切换股票时清空旧数据
    setKLineData([]);
    setCurrentPrice(0);
    kLineDataRef.current = [];
    pendingPointsRef.current = [];
    latestPointRef.current = null;

    const loadSnapshot = async () => {
      try {
        const response = await apiClient.get(`/api/quote/kline/${stockCode}`, {
          params: { interval: '1s', limit: 300 },
        });
        const payload = extractData<{ data?: KLineData[] } | KLineData[]>(response);
        const snapshot = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        if (cancelled || snapshot.length === 0) {
          return;
        }

        const latestPoint = snapshot[snapshot.length - 1];
        latestPointRef.current = latestPoint;
        kLineDataRef.current = snapshot;
        setKLineData(snapshot);
        setCurrentPrice(latestPoint.price);
        emitQuoteUpdate(latestPoint, snapshot);
      } catch (error) {
        console.error('加载K线快照失败:', error);
      }
    };

    void loadSnapshot();

    const sseUrl = `${API_BASE_URL}/api/quote/stream/${stockCode}`;

    setConnectionStatus('connecting');

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        // 处理 NestJS SSE 的双重嵌套格式
        const data = parsed.data || parsed;

        if (data.type === 'tick') {
          // 接收到新的 tick 数据
          const newDataPoint: KLineData = {
            time: data.time,
            price: data.price,
            volume: data.volume,
          };

          const latestPoint = latestPointRef.current;
          if (latestPoint && newDataPoint.time < latestPoint.time) {
            return;
          }

          pendingPointsRef.current.push(newDataPoint);
          if (flushTimerRef.current === null) {
            flushTimerRef.current = window.setTimeout(() => {
              flushTimerRef.current = null;
              flushPendingPoints();
            }, 200);
          }
        }
      } catch (error) {
        console.error('解析 SSE 数据失败:', error, event.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE 连接错误:', error);
      setConnectionStatus('disconnected');
      eventSource.close();
    };

    // 清理函数
    return () => {
      cancelled = true;
      eventSourceRef.current = null;
      eventSource.close();
      if (flushTimerRef.current !== null) {
        window.clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      pendingPointsRef.current = [];
    };
  }, [stockCode]);
  const isUpTrend = kLineData.length > 1 && currentPrice >= kLineData[0].price;
  const trendTone = getTrendTone(isUpTrend);
  const bullTone = getTradeTone('bull');
  const bearTone = getTradeTone('bear');

  return (
    <div className="relative bg-[#09090b] h-[60vh] min-h-[420px] pb-4">
      {/* Overlaid Trading Pair Title and Price Info */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4 pb-2">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-white text-[20px] font-bold tracking-tight">{stockCode}</div>
            <div className="text-[#8a8a93] text-[12px] mt-1 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === 'connected' ? 'bg-[#10b981] animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400'
              }`}></span>
              {connectionStatus === 'connected' ? '交易中' :
               connectionStatus === 'connecting' ? '连接中...' :
               '已断开'} {new Date().toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className={`text-[24px] font-bold font-mono leading-none tracking-tight ${getToneTextClass(trendTone)}`}>
              {currentPrice.toFixed(2)}
            </div>
            <div className={`text-[13px] font-medium mt-1 ${getToneTextClass(trendTone)}`}>
              {kLineData.length > 1
                ? `${currentPrice >= kLineData[0].price ? '+' : ''}${(currentPrice - kLineData[0].price).toFixed(2)} ${currentPrice >= kLineData[0].price ? '+' : ''}${(((currentPrice - kLineData[0].price) / kLineData[0].price) * 100).toFixed(2)}%`
                : '+0.00 +0.00%'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="absolute inset-0 pt-24 pb-12">
        {kLineData.length > 0 && (
          <KLineChart
            data={kLineData}
            currentPrice={currentPrice}
            countdownTime={countdown}
            entryPrice={entryPrice}
            entryTime={entryTime}
            tradeType={tradeType}
            profitLoss={profitLoss}
            showProfit={showProfit}
            getTrendColor={(isUp) => getToneColor(getTrendTone(isUp))}
            getProfitColor={(value) => getToneColor(getProfitTone(value))}
            getTradeColor={(type) => getToneColor(getTradeTone(type))}
          />
        )}
      </div>

      {/* Bull/Bear Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-2 z-10">
        <div className="flex justify-between text-[12px] font-medium mb-2 px-1">
          <span className={getToneTextClass(bullTone)}>看涨 32.56%</span>
          <span className={getToneTextClass(bearTone)}>67.34% 看跌</span>
        </div>
        <div className="h-[6px] w-full bg-[#1a1a24] rounded-full overflow-hidden flex">
          <div className={`${getToneBgClass(bullTone)} h-full transition-all duration-500`} style={{ width: '32.56%' }}></div>
          <div className={`${getToneBgClass(bearTone)} h-full transition-all duration-500`} style={{ width: '67.44%' }}></div>
        </div>
      </div>
    </div>
  );
}
