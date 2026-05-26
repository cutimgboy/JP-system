import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../../utils/api';

interface TradingHoursProps {
  stockCode: string;
}

export function TradingHours({ stockCode }: TradingHoursProps) {
  const [tradingHoursText, setTradingHoursText] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/products/${stockCode}`);
        const productData = extractData(response);

        setTradingHoursText(productData?.tradingHours || '');
      } catch (error) {
        console.error('获取产品信息失败:', error);
        setTradingHoursText('');
      } finally {
        setLoading(false);
      }
    };

    if (stockCode) {
      fetchProductInfo();
    }
  }, [stockCode]);

  if (loading) {
    return null;
  }

  const parseTradingHours = (value: string) => {
    const source = value.trim();
    if (!source) {
      return [{ session: '常规交易', days: '周一至周五', time: '以交易所实时开放状态为准' }];
    }

    return source
      .split(/\n|；|;/)
      .map((row) => row.trim())
      .filter(Boolean)
      .map((row, index) => {
        const normalized = row.replace(/\s+/g, ' ');
        const parts = normalized.split(/[:：]/);
        if (parts.length >= 2) {
          return {
            session: parts[0].trim() || `时段 ${index + 1}`,
            days: '交易日',
            time: parts.slice(1).join(':').trim(),
          };
        }

        const timeMatch = normalized.match(/(\d{1,2}:\d{2}\s*[-~至]\s*\d{1,2}:\d{2}.*)$/);
        if (timeMatch) {
          return {
            session: normalized.replace(timeMatch[0], '').trim() || `时段 ${index + 1}`,
            days: '交易日',
            time: timeMatch[0],
          };
        }

        return {
          session: `时段 ${index + 1}`,
          days: '交易日',
          time: normalized,
        };
      });
  };

  const rows = parseTradingHours(tradingHoursText);

  return (
    <>
      {/* Separator */}
      <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

      <div className="px-5 py-4 pb-12">
        <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-white">
          <div className="w-1 h-4 bg-[#f7931a] rounded-full"></div>
          交易时间
        </h3>
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#14141c]">
          <div className="grid grid-cols-[1fr_1fr_1.5fr] bg-white/[0.03] px-4 py-3 text-[11px] font-medium text-[#8a8a93]">
            <span>时段</span>
            <span>日期</span>
            <span className="text-right">时间</span>
          </div>
          {rows.map((row, index) => (
            <div
              key={`${row.session}-${index}`}
              className="grid grid-cols-[1fr_1fr_1.5fr] items-center border-t border-white/5 px-4 py-3 text-[12px]"
            >
              <span className="font-medium text-white">{row.session}</span>
              <span className="text-[#8a8a93]">{row.days}</span>
              <span className="text-right font-mono text-white">{row.time}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#8a8a93] mt-3 opacity-60">
          以上交易时间并未考虑节假日或市场特殊情况调整的影响。
        </p>
      </div>
    </>
  );
}
