import { useState, useEffect } from 'react';
import { MarketItem } from './MarketItem';
import { BottomNav } from '../../components/BottomNav';
import { PageHeader } from '../../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
import apiClient, { extractData } from '../../utils/api';
import { tx } from "../../i18n/text";
interface Market {
  code: string;
  icon: string;
  symbol: string;
  name: string;
  nameCn: string;
  price: string;
  change: number;
  changePercent: string;
  buy_price?: number;
  sale_price?: number;
}

type CategoryKey = 'index' | 'stock' | 'commodity' | 'crypto' | 'forex';

const categoryOptions: Array<{ key: CategoryKey; labelKey: string; apiType: string; iconExtension: 'svg' | 'png' }> = [
  { key: 'index', labelKey: '指数', apiType: '指数', iconExtension: 'svg' },
  { key: 'stock', labelKey: '股票', apiType: '股票', iconExtension: 'svg' },
  { key: 'commodity', labelKey: '商品', apiType: '商品', iconExtension: 'svg' },
  { key: 'crypto', labelKey: '数字货币', apiType: 'Crypto', iconExtension: 'svg' },
  { key: 'forex', labelKey: '外汇', apiType: '外汇', iconExtension: 'png' },
];

export default function MarketPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CategoryKey>('crypto');
  const {
    accountType,
    setAccountType
  } = useAccount();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const activeCategory = categoryOptions.find(category => category.key === activeTab) ?? categoryOptions[0];

  // 获取产品列表（仅在页面加载或切换分类时获取一次）
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        // 使用新的产品行情 API，按类型筛选
        const response = await apiClient.get('/api/products/quotes', {
          params: {
            type: activeCategory.apiType
          }
        });
        let quotesData = extractData(response) || [];

        // 确保是数组
        if (!Array.isArray(quotesData)) {
          console.warn(tx("行情数据不是数组:"), quotesData);
          quotesData = [];
        }
        const marketData: Market[] = quotesData.map((quote: any) => {
          return {
            code: quote.code,
            icon: `/logo/${quote.code}.${activeCategory.iconExtension}`,
            symbol: quote.code,
            name: quote.name,
            nameCn: quote.nameCn,
            price: quote.price.toFixed(2),
            change: quote.change,
            changePercent: `${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%`,
            buy_price: quote.bidPrice,
            sale_price: quote.askPrice
          };
        });
        setMarkets(marketData);
      } catch (error) {
        console.error(tx("获取市场数据失败:"), error);
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, [activeCategory.apiType, activeCategory.iconExtension]);

  const promoCoins = [{
    name: 'Chainlink',
    symbol: 'LINK',
    logo: '/logo/LINK.svg',
    className: 'left-[31px] top-0 bg-[rgba(45,49,86,0.4)]'
  }, {
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: '/logo/BTC.svg',
    className: 'left-[11px] top-[34px] bg-[rgba(45,49,86,0.6)]'
  }, {
    name: 'Ethereum',
    symbol: 'ETH',
    logo: '/logo/ETH.svg',
    className: 'left-[-8px] top-[67px] bg-gradient-to-r from-[rgba(108,72,245,0.86)] to-[rgba(67,38,184,0.86)] shadow-[0px_8px_32px_0px_rgba(108,72,245,0.3)]'
  }];
  return <div className="min-h-screen bg-[#0a0a0c] pb-28 relative">
      {/* Header - Fixed */}
      <PageHeader accountType={accountType} onAccountSwitch={setAccountType} className="pt-6 pb-4" />

      {/* Content with top padding to account for fixed header */}
      <div className="pt-[92px]">
        {/* Title */}
        <div className="px-6 pb-4">
          <h1 className="text-white text-[30px] font-semibold leading-[36px] tracking-[0.4px]">{tx("你好 交易者~")}</h1>
        </div>

        {/* Banner */}
        <div className="px-6 pb-6">
        <button onClick={() => navigate('/promotion')} className="relative overflow-hidden h-[156px] w-full rounded-[32px] border border-white/5 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:scale-[1.02]">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-[#0f0f1a]">
            <img src="/market-promo-bg.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
            {/* Decorative blur */}
            <div className="absolute left-[120px] top-[2px] w-[256px] h-[152px] bg-[#6c48f5] opacity-40 rounded-full blur-[100px]" />
          </div>

          {/* Content */}
          <div className="absolute left-6 top-6 bottom-6 flex flex-col justify-between z-10">
            <div className="flex flex-col gap-1">
              <p className="text-[#99a1af] text-[12px] leading-[16px]">{tx("充值交易 可获得现金奖励")}</p>
              <h2 className="text-white text-[28px] font-bold leading-[42px] tracking-[-0.39px]">{tx("500.00%奖励")}</h2>
            </div>
            <div className="bg-white rounded-[20px] px-6 py-2 shadow-[0px_0px_20px_0px_rgba(255,255,255,0.3)] inline-flex self-start">
              <span className="text-black text-[12px] font-semibold leading-[16px]">{tx("立即参与")}</span>
            </div>
          </div>

          <div className="absolute right-[-35px] top-8 h-[137px] w-[180px] sm:right-[-18px]">
            {promoCoins.map(coin => <div key={coin.symbol} className={`absolute flex h-[46px] w-[180px] items-center gap-2 rounded-[16px] border border-white/10 px-3 py-1 shadow-[0px_10px_15px_0px_rgba(0,0,0,0.12)] ${coin.className}`}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <img src={coin.logo} alt="" className="h-full w-full rounded-full object-cover" />
                </span>
                <span className="text-[12px] font-semibold leading-4 text-white">
                  {coin.name}
                </span>
              </div>)}
          </div>
        </button>
      </div>

        {/* Categories */}
        <div className="px-6 pb-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {categoryOptions.map(category => <button key={category.key} onClick={() => setActiveTab(category.key)} className={`flex shrink-0 items-center justify-center rounded-[20px] px-2.5 py-2 transition-all duration-200 ${activeTab === category.key ? 'bg-[#1a1a24] text-white border border-white/10 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.2)]' : 'bg-transparent text-[#6a7282] border border-transparent hover:text-white'}`}>
              <span className="text-[13px] font-medium whitespace-nowrap">
                {tx(category.labelKey)}
              </span>
            </button>)}
        </div>
      </div>

        {/* Market List */}
        <div className="px-6 pt-2 pb-4 space-y-3">
        {loading ? <div className="text-center py-12 text-[#8a8a93]">{tx("加载中...")}</div> : markets.length === 0 ? <div className="text-center py-12 text-[#8a8a93]">{tx("暂无数据")}</div> : markets.map((market, index) => <MarketItem key={`${market.code}-${index}`} {...market} onClick={() => navigate(`/trading?stock=${market.code}`)} />)}
        </div>
      </div>

      <BottomNav />
    </div>;
}
