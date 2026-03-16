import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../../utils/api';

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
        const productData = extractData(response);

        // 如果有简体介绍，则显示
        if (productData?.descriptionCn) {
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
    <>
      {/* Separator */}
      <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

      <div className="px-5 py-4">
        <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-white">
          <div className="w-1 h-4 bg-[#10b981] rounded-full"></div>
          标的简介
        </h3>
        <p className="text-[13px] text-[#8a8a93] leading-relaxed text-justify">
          {introduction}
        </p>
      </div>
    </>
  );
}
