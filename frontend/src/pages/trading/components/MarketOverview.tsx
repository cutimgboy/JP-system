import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../../utils/api';
import { tx } from "../../../i18n/text";
import { getLocalizedCountry, getLocalizedMarket, getLocalizedProductName, mergeProductInfo, type ProductInfo } from '../productInfo';
interface MarketOverviewProps {
  stockCode: string;
}
export function MarketOverview({
  stockCode
}: MarketOverviewProps) {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
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
  const formatValue = (value: unknown) => {
    if (value === undefined || value === null || value === '') {
      return '-';
    }
    return String(value);
  };
  const productType = productInfo?.type || '';
  const isStock = productType === '股票';
  const isCrypto = productType === 'Crypto' || productType === '数字货币';
  if (!isStock && !isCrypto) {
    return null;
  }
  const sectionTitle = isStock ? tx("公司信息") : isCrypto ? tx("币种信息") : tx("产品概况");
  const sectionAccent = isStock ? 'bg-[#3b82f6]' : isCrypto ? 'bg-[#f7931a]' : 'bg-[#6c48f5]';
  const generalItems = [{
    label: tx("标的类型"),
    value: formatValue(productType)
  }, {
    label: tx("交易代码"),
    value: formatValue(productInfo?.tradeCode || productInfo?.code || stockCode)
  }, {
    label: tx("名称"),
    value: formatValue(getLocalizedProductName(productInfo, stockCode))
  }, {
    label: tx("货币类型"),
    value: formatValue(productInfo?.currencyType)
  }, {
    label: tx("保证金货币"),
    value: formatValue(productInfo?.marginCurrency)
  }, {
    label: tx("合约量"),
    value: formatValue(productInfo?.contractSize)
  }, {
    label: tx("价差"),
    value: formatValue(productInfo?.spread)
  }, {
    label: tx("最小变动"),
    value: formatValue(productInfo?.minPriceChange)
  }, {
    label: tx("固定杠杆"),
    value: formatValue(productInfo?.fixedLeverage)
  }];
  const stockItems = [{
    label: tx("公司名称"),
    value: formatValue(productInfo?.companyName || productInfo?.nameCn)
  }, {
    label: tx("上市日期"),
    value: formatValue(productInfo?.listingDate)
  }, {
    label: tx("发行价格"),
    value: formatValue(productInfo?.issuePrice)
  }, {
    label: tx("ISIN代码"),
    value: formatValue(productInfo?.isinCode)
  }, {
    label: tx("成立日期"),
    value: formatValue(productInfo?.foundedYear)
  }, {
    label: tx("CEO"),
    value: formatValue(productInfo?.ceo)
  }, {
    label: tx("所属市场"),
    value: formatValue(getLocalizedMarket(productInfo))
  }, {
    label: tx("员工数量"),
    value: formatValue(productInfo?.employees)
  }, {
    label: tx("国家"),
    value: formatValue(getLocalizedCountry(productInfo))
  }, {
    label: tx("网址"),
    value: formatValue(productInfo?.website)
  }];
  const cryptoItems = [{
    label: tx("市值排名"),
    value: productInfo?.marketCapRank ? `NO.${productInfo.marketCapRank}` : '-'
  }, {
    label: tx("市值"),
    value: formatValue(productInfo?.marketCap)
  }, {
    label: tx("完全稀释市值"),
    value: formatValue(productInfo?.fullyDilutedMarketCap)
  }, {
    label: tx("流通数量"),
    value: formatValue(productInfo?.circulatingSupply)
  }, {
    label: tx("最大供给量"),
    value: formatValue(productInfo?.maxSupply)
  }, {
    label: tx("总量"),
    value: formatValue(productInfo?.totalSupply)
  }, {
    label: tx("发行日期"),
    value: formatValue(productInfo?.issueDate)
  }, {
    label: tx("历史最高价"),
    value: formatValue(productInfo?.allTimeHigh)
  }, {
    label: tx("历史最低价"),
    value: formatValue(productInfo?.allTimeLow)
  }];
  const overviewItems = (isStock ? stockItems : isCrypto ? cryptoItems : generalItems).filter(item => item.value !== '-').slice(0, 10);
  if (overviewItems.length === 0) {
    return null;
  }
  return <>
      {/* Separator */}
      <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

      <div className="px-5 py-4">
        <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-white">
          <div className={`w-1 h-4 ${sectionAccent} rounded-full`}></div>{sectionTitle}</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-white/5 bg-[#14141c] p-4">
          {overviewItems.map((item, i) => <div key={i} className="min-w-0">
              <div className="text-[11px] text-[#6a7282]">{item.label}</div>
              <div className="mt-1 truncate text-[13px] font-medium text-white">{item.value}</div>
            </div>)}
        </div>
      </div>
    </>;
}
