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
    <div className="relative bg-[#1a1f2e] h-[60vh] min-h-[400px] pb-4">
      {/* Overlaid Trading Pair Title and Price Info */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4 pb-2">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-white flex items-center gap-2">
              {stockCode}
              <span className={`text-xs px-2 py-0.5 rounded ${
                connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {connectionStatus === 'connected' ? '已连接' :
                 connectionStatus === 'connecting' ? '连接中...' :
                 '已断开'}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              交易时间: {new Date().toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
        </div>
        
        {/* Price Info */}
        <div className="flex items-start gap-4">
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">成交价</div>
            <div className="text-white text-sm">{currentPrice.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">涨跌额</div>
            <div className={`text-xs ${kLineData.length > 1 && currentPrice >= kLineData[0].price ? 'text-green-400' : 'text-red-400'}`}>
              {kLineData.length > 1 
                ? `${currentPrice >= kLineData[0].price ? '+' : ''}${(currentPrice - kLineData[0].price).toFixed(2)}`
                : '0.00'
              }
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">涨跌幅</div>
            <div className={`text-xs ${kLineData.length > 1 && currentPrice >= kLineData[0].price ? 'text-green-400' : 'text-red-400'}`}>
              {kLineData.length > 1 
                ? `${currentPrice >= kLineData[0].price ? '+' : ''}${(((currentPrice - kLineData[0].price) / kLineData[0].price) * 100).toFixed(2)}%`
                : '0.00%'
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

      {/* Bull/Bear Ratio Bar - Below X-Axis with more spacing */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-3 pt-8 z-10">
        <div className="flex items-center gap-2">
          {/* 看涨标签 + 百分比 */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">看涨</span>
            <span className="text-xs text-teal-400 font-medium">67%</span>
          </div>
          
          {/* 进度条 - with opacity */}
          <div className="flex-1 flex items-center h-2.5 relative overflow-hidden rounded-full">
            {/* 看涨区域 - 青绿色，半透明 */}
            <div 
              className="bg-teal-500/40 h-full" 
              style={{ width: '67%' }}
            ></div>
            
            {/* 中间分隔符 - 更低调 */}
            <div className="w-0.5 h-full bg-white/30 absolute" style={{ left: '67%', transform: 'translateX(-50%)' }}></div>
            
            {/* 看跌区域 - 红色，半透明 */}
            <div 
              className="bg-red-500/40 h-full flex-1"
            ></div>
          </div>
          
          {/* 看跌百分比 + 标签 */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-red-400 font-medium">33%</span>
            <span className="text-xs text-gray-400">看跌</span>
          </div>
        </div>
      </div>
    </div>
  );
}
