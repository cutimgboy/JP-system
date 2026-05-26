import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../../utils/api';
import { tx } from "../../../i18n/text";
import {
  getFallbackProductInfo,
  getLocalizedDescription,
  getLocalizedProductName,
  mergeProductInfo,
  type ProductInfo,
} from '../productInfo';
interface CoinIntroductionProps {
  stockCode: string;
}
export function CoinIntroduction({
  stockCode
}: CoinIntroductionProps) {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(() => getFallbackProductInfo(stockCode));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/products/${stockCode}`);
        const productData = extractData(response);
        setProductInfo(mergeProductInfo(stockCode, productData));
      } catch (error) {
        console.error(tx("获取产品信息失败:"), error);
        setProductInfo(mergeProductInfo(stockCode));
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
  const productType = productInfo?.type || '';
  const isStock = productType === '股票';
  const isCrypto = productType === 'Crypto' || productType === '数字货币';
  const productName = getLocalizedProductName(productInfo, stockCode);
  const displayText = getLocalizedDescription(productInfo) || tx('标的简介默认文案', { name: productName || stockCode });
  const title = isStock ? tx("公司简介") : isCrypto ? tx("币种简介") : tx("产品简介");
  const accentClass = isStock ? 'bg-[#3b82f6]' : isCrypto ? 'bg-[#f7931a]' : 'bg-[#10b981]';
  return <>
      {/* Separator */}
      <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

      <div className="px-5 py-4">
        <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-white">
          <div className={`w-1 h-4 ${accentClass} rounded-full`}></div>{title}</h3>
        <div className="whitespace-pre-line text-justify text-[13px] leading-relaxed text-[#8a8a93]">
          {displayText}
        </div>
      </div>
    </>;
}
