import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../../utils/api';

interface TradingHoursProps {
  stockCode: string;
}

export function TradingHours({ stockCode }: TradingHoursProps) {
  const [tradingHoursText, setTradingHoursText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/products/${stockCode}`);
        const productData = extractData(response);

        // 如果有交易时间，则显示
        if (productData?.tradingHours) {
          setTradingHoursText(productData.tradingHours);
          setHasData(true);
        } else {
          setHasData(false);
        }
      } catch (error) {
        console.error('获取产品信息失败:', error);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };

    if (stockCode) {
      fetchProductInfo();
    }
  }, [stockCode]);

  // 如果没有数据，不显示组件
  if (!loading && !hasData) {
    return null;
  }

  if (loading) {
    return null;
  }

  return (
    <>
      {/* Separator */}
      <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

      <div className="px-5 py-4 pb-12">
        <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-white">
          <div className="w-1 h-4 bg-[#f7931a] rounded-full"></div>
          交易时间
        </h3>
        <div className="flex flex-col gap-3 border border-white/5 rounded-2xl p-4 bg-[#14141c]">
          <div className="text-[13px] text-[#8a8a93] leading-relaxed whitespace-pre-line">
            {tradingHoursText}
          </div>
        </div>
        <p className="text-[11px] text-[#8a8a93] mt-3 opacity-60">
          以上交易时间并未考虑节假日或市场特殊情况调整的影响。
        </p>
      </div>
    </>
  );
}
