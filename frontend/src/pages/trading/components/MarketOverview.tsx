import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../../utils/api';

interface MarketOverviewProps {
  stockCode: string;
}

interface ProductInfo {
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

        // 检查是否有市值排名（只有加密货币有这个字段）
        if (productData?.marketCapRank) {
          setProductInfo(productData);
        } else {
          setProductInfo(null);
        }
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

  // 如果没有数据或正在加载，不显示组件
  if (loading || !productInfo) {
    return null;
  }

  const overviewItems = [
    { label: '市值排名', value: productInfo.marketCapRank ? `NO.${productInfo.marketCapRank}` : '-' },
    { label: '市值', value: productInfo.marketCap || '-' },
    { label: '完全稀释市值', value: productInfo.fullyDilutedMarketCap || '-' },
    { label: '流通数量', value: productInfo.circulatingSupply || '-' },
    { label: '最大供给量', value: productInfo.maxSupply || '-' },
    { label: '总量', value: productInfo.totalSupply || '-' },
    { label: '发行日期', value: productInfo.issueDate || '-' },
    { label: '历史最高价', value: productInfo.allTimeHigh || '-' },
    { label: '历史最低价', value: productInfo.allTimeLow || '-' },
  ];

  return (
    <>
      {/* Separator */}
      <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

      <div className="px-5 py-4">
        <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-white">
          <div className="w-1 h-4 bg-[#6c48f5] rounded-full"></div>
          标的概况
        </h3>
        <div className="flex flex-col gap-3">
          {overviewItems.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-[13px]">
              <span className="text-[#8a8a93]">{item.label}</span>
              <span className="font-medium text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
