import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../../utils/api';

interface MarketOverviewProps {
  stockCode: string;
}

interface ProductInfo {
  code?: string;
  tradeCode?: string;
  nameCn?: string;
  nameEn?: string;
  type?: string;
  currencyType?: string;
  marginCurrency?: string;
  market?: string;
  decimalPlaces?: number;
  contractSize?: number;
  spread?: number;
  minPriceChange?: number;
  fixedLeverage?: number;
  marketCapRank?: number;
  marketCap?: string;
  fullyDilutedMarketCap?: string;
  circulatingSupply?: string;
  maxSupply?: string;
  totalSupply?: string;
  issueDate?: string;
  allTimeHigh?: string;
  allTimeLow?: string;
}

export function MarketOverview({ stockCode }: MarketOverviewProps) {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/products/${stockCode}`);
        const productData = extractData(response);
        setProductInfo(productData || null);
      } catch (error) {
        console.error('获取产品信息失败:', error);
        setProductInfo(null);
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

  const formatValue = (value: unknown) => {
    if (value === undefined || value === null || value === '') {
      return '-';
    }
    return String(value);
  };

  const overviewItems = [
    { label: '标的类型', value: formatValue(productInfo?.type) },
    { label: '交易代码', value: formatValue(productInfo?.tradeCode || productInfo?.code || stockCode) },
    { label: '名称', value: formatValue(productInfo?.nameCn || productInfo?.nameEn) },
    { label: '所属市场', value: formatValue(productInfo?.market) },
    { label: '货币类型', value: formatValue(productInfo?.currencyType) },
    { label: '保证金货币', value: formatValue(productInfo?.marginCurrency) },
    { label: '合约量', value: formatValue(productInfo?.contractSize) },
    { label: '价差', value: formatValue(productInfo?.spread) },
    { label: '最小变动', value: formatValue(productInfo?.minPriceChange) },
    { label: '固定杠杆', value: formatValue(productInfo?.fixedLeverage) },
    { label: '市值排名', value: productInfo?.marketCapRank ? `NO.${productInfo.marketCapRank}` : '-' },
    { label: '市值', value: formatValue(productInfo?.marketCap) },
    { label: '完全稀释市值', value: formatValue(productInfo?.fullyDilutedMarketCap) },
    { label: '流通数量', value: formatValue(productInfo?.circulatingSupply) },
    { label: '最大供给量', value: formatValue(productInfo?.maxSupply) },
    { label: '总量', value: formatValue(productInfo?.totalSupply) },
    { label: '发行日期', value: formatValue(productInfo?.issueDate) },
    { label: '历史最高价', value: formatValue(productInfo?.allTimeHigh) },
    { label: '历史最低价', value: formatValue(productInfo?.allTimeLow) },
  ].filter((item) => item.value !== '-').slice(0, 10);

  return (
    <>
      {/* Separator */}
      <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

      <div className="px-5 py-4">
        <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-white">
          <div className="w-1 h-4 bg-[#6c48f5] rounded-full"></div>
          标的概况
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-white/5 bg-[#14141c] p-4">
          {overviewItems.map((item, i) => (
            <div key={i} className="min-w-0">
              <div className="text-[11px] text-[#6a7282]">{item.label}</div>
              <div className="mt-1 truncate text-[13px] font-medium text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
