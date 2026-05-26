import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../../utils/api';
import { tx } from "../../../i18n/text";
interface CoinIntroductionProps {
  stockCode: string;
}
export function CoinIntroduction({
  stockCode
}: CoinIntroductionProps) {
  const [introduction, setIntroduction] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState('');
  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/products/${stockCode}`);
        const productData = extractData(response);
        setProductName(productData?.nameCn || productData?.nameEn || stockCode);
        setIntroduction(productData?.descriptionCn || '');
      } catch (error) {
        console.error(tx("获取产品信息失败:"), error);
        setProductName(stockCode);
        setIntroduction('');
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
  const displayText = introduction || tx('标的简介默认文案', { name: productName || stockCode });
  return <>
      {/* Separator */}
      <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

      <div className="px-5 py-4">
        <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-white">
          <div className="w-1 h-4 bg-[#10b981] rounded-full"></div>{tx("标的简介")}</h3>
        <p className="text-[13px] text-[#8a8a93] leading-relaxed text-justify">
          {displayText}
        </p>
      </div>
    </>;
}
