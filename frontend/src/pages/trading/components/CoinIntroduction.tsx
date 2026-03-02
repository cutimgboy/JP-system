import { useState, useEffect } from 'react';
import { apiClient } from '../../../utils/api';

interface CoinIntroductionProps {
  stockCode: string;
}

export function CoinIntroduction({ stockCode }: CoinIntroductionProps) {
  const [introduction, setIntroduction] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/products/${stockCode}`);
        const productData = response.data.data || response.data;

        // 如果有简体介绍，则显示
        if (productData.descriptionCn) {
          setIntroduction(productData.descriptionCn);
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
    <div className="bg-[#1f2633] px-4 py-4 mt-2 border border-gray-700/30 rounded-lg mx-4">
      <h2 className="text-white mb-3">币种介绍</h2>
      <div className="text-sm text-gray-400 leading-relaxed space-y-3">
        {introduction.split('\n').map((paragraph, index) => (
          paragraph.trim() && <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
