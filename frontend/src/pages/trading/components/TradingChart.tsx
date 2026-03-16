import { useState, useEffect, useRef } from 'react';
import { KLineChart, type KLineData } from './KLineChart';
import { API_BASE_URL } from '../../../utils/api';

interface TradingChartProps {
  countdown?: number; // 倒计时时间（秒）
  stockCode?: string; // 股票代码，默认为 AAPL.US
  entryPrice?: number; // 买入价
  entryTime?: number; // 买入时间（秒）
  onPriceUpdate?: (price: number, time: number) => void; // 价格更新回调
  profitLoss?: number; // 交易收益
  showProfit?: boolean; // 是否显示收益
}

export function TradingChart({ countdown, stockCode = 'AAPL.US', entryPrice, entryTime, onPriceUpdate, profitLoss, showProfit }: TradingChartProps) {
  const [kLineData, setKLineData] = useState<KLineData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const eventSourceRef = useRef<EventSource | null>(null);

  // SSE 连接实时数据
  useEffect(() => {
    // 只在浏览器环境中执行
    if (typeof window === 'undefined') {
      return;
    }

    // 切换股票时清空旧数据
    setKLineData([]);
    setCurrentPrice(0);

    const sseUrl = `${API_BASE_URL}/api/quote/stream/${stockCode}`;

    console.log(`正在连接 SSE: ${sseUrl}`);
    setConnectionStatus('connecting');

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE 连接已建立');
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        // 处理 NestJS SSE 的双重嵌套格式
        const data = parsed.data || parsed;

        console.log('收到 SSE 数据:', data);

        if (data.type === 'connected') {
          console.log('SSE 连接确认:', data);
        } else if (data.type === 'tick') {
          // 接收到新的 tick 数据
          const newDataPoint: KLineData = {
            time: data.time,
            price: data.price,
            volume: data.volume,
          };

          console.log('添加新数据点:', newDataPoint);

          setKLineData(prev => {
            const updated = [...prev, newDataPoint];
            // 保持最多20分钟的数据（1200个点）
            return updated.length > 20 * 60 ? updated.slice(-20 * 60) : updated;
          });

          setCurrentPrice(data.price);

          // 通知父组件价格和时间更新
          if (onPriceUpdate) {
            onPriceUpdate(data.price, data.time);
          }
        } else if (data.type === 'heartbeat') {
          console.log('收到心跳:', data.timestamp);
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
      console.log('关闭 SSE 连接');
      eventSource.close();
    };
  }, [stockCode]);
  return (
    <div className="relative bg-[#09090b] h-[60vh] min-h-[400px] pb-4">
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
            <div className={`text-[24px] font-bold font-mono leading-none tracking-tight ${
              kLineData.length > 1 && currentPrice >= kLineData[0].price ? 'text-[#ef4444]' : 'text-[#10b981]'
            }`}>
              {currentPrice.toFixed(2)}
            </div>
            <div className={`text-[13px] font-medium mt-1 ${
              kLineData.length > 1 && currentPrice >= kLineData[0].price ? 'text-[#ef4444]' : 'text-[#10b981]'
            }`}>
              {kLineData.length > 1
                ? `${currentPrice >= kLineData[0].price ? '+' : ''}${(currentPrice - kLineData[0].price).toFixed(2)} ${currentPrice >= kLineData[0].price ? '+' : ''}${(((currentPrice - kLineData[0].price) / kLineData[0].price) * 100).toFixed(2)}%`
                : '+0.00 +0.00%'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="absolute inset-0 pt-24">
        {kLineData.length > 0 && (
          <KLineChart
            data={kLineData}
            currentPrice={currentPrice}
            countdownTime={countdown}
            entryPrice={entryPrice}
            entryTime={entryTime}
            profitLoss={profitLoss}
            showProfit={showProfit}
          />
        )}
      </div>

      {/* Bull/Bear Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8 z-10">
        <div className="flex justify-between text-[12px] font-medium mb-2 px-1">
          <span className="text-[#ef4444]">看涨 32.56%</span>
          <span className="text-[#10b981]">67.34% 看跌</span>
        </div>
        <div className="h-[6px] w-full bg-[#1a1a24] rounded-full overflow-hidden flex">
          <div className="bg-[#ef4444] h-full transition-all duration-500" style={{ width: '32.56%' }}></div>
          <div className="bg-[#10b981] h-full transition-all duration-500" style={{ width: '67.44%' }}></div>
        </div>
      </div>
    </div>
  );
}
