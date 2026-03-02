import { useState, useEffect } from 'react';
import { apiClient } from '../../../utils/api';

interface MarketOverviewProps {
  stockCode: string;
}

export function MarketOverview({ stockCode }: MarketOverviewProps) {
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/products/${stockCode}`);
        const productData = response.data.data || response.data;

        // 检查是否有市值排名（只有加密货币有这个字段）
        if (productData.marketCapRank) {
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

  // 如果没有数据或正在加载，不显示组件
  if (loading || !hasData) {
    return null;
  }

  return null;
}
