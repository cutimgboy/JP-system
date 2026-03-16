import { useState, useEffect } from 'react';
import { MarketItem } from './MarketItem';
import { BottomNav } from '../../components/BottomNav';
import { PageHeader } from '../../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
import apiClient, { extractData } from '../../utils/api';

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

export default function MarketPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('股票');
  const { accountType } = useAccount();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['指数', '股票', '商品', '数字货币', '外汇'];

  // 将前端显示的分类名称映射到后端的类型值
  const getCategoryType = (category: string) => {
    const typeMap: Record<string, string> = {
      '数字货币': 'Crypto',
      '指数': '指数',
      '股票': '股票',
      '商品': '商品',
      '外汇': '外汇',
    };
    return typeMap[category] || category;
  };

  // 获取产品列表（仅在页面加载或切换分类时获取一次）
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        // 使用新的产品行情 API，按类型筛选
        const response = await apiClient.get('/api/products/quotes', {
          params: { type: getCategoryType(activeTab) }
        });
        let quotesData = extractData(response) || [];

        // 确保是数组
        if (!Array.isArray(quotesData)) {
          console.warn('行情数据不是数组:', quotesData);
          quotesData = [];
        }

        const marketData: Market[] = quotesData.map((quote: any) => {
          // 外汇使用 png 格式，其他使用 svg 格式
          const iconExtension = getCategoryType(activeTab) === '外汇' ? 'png' : 'svg';

          return {
            code: quote.code,
            icon: `/logo/${quote.code}.${iconExtension}`,
            symbol: quote.code,
            name: quote.name,
            nameCn: quote.nameCn,
            price: quote.price.toFixed(2),
            change: quote.change,
            changePercent: `${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%`,
            buy_price: quote.bidPrice,
            sale_price: quote.askPrice,
          };
        });

        setMarkets(marketData);
      } catch (error) {
        console.error('获取市场数据失败:', error);
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [activeTab]); // 切换分类时重新获取数据

  return (
    <div className="min-h-screen bg-[#0a0a0c] pb-28 relative">
      {/* Header - Fixed */}
      <PageHeader />

      {/* Content with top padding to account for fixed header */}
      <div className="pt-[120px]">
        {/* Title */}
        <div className="px-6 pb-6">
          <h1 className="text-white text-[30px] font-semibold leading-[36px] tracking-[0.4px]">
            你好 交易者~
          </h1>
        </div>

        {/* Banner */}
        <div className="px-6 pb-6">
        <button
          onClick={() => navigate('/promotion')}
          className="relative overflow-hidden h-[156px] w-full rounded-[32px] border border-white/5 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:scale-[1.02]"
        >
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-[#0f0f1a]">
            {/* Decorative blur */}
            <div className="absolute left-[120px] top-[2px] w-[256px] h-[152px] bg-[#6c48f5] opacity-40 rounded-full blur-[100px]" />
          </div>

          {/* Content */}
          <div className="absolute left-6 top-6 bottom-6 flex flex-col justify-between z-10">
            <div className="flex flex-col gap-1">
              <p className="text-[#99a1af] text-[12px] leading-[16px]">
                充值交易 可获得现金奖励
              </p>
              <h2 className="text-white text-[32px] font-bold leading-[48px] tracking-[-0.39px]">
                500.00%奖励
              </h2>
            </div>
            <div className="bg-white rounded-[20px] px-6 py-2 shadow-[0px_0px_20px_0px_rgba(255,255,255,0.3)] inline-flex self-start">
              <span className="text-black text-[12px] font-semibold leading-[16px]">
                立即参与
              </span>
            </div>
          </div>
        </button>
      </div>

        {/* Categories */}
        <div className="px-6 pb-4">
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`flex shrink-0 items-center justify-center rounded-[20px] px-[18px] py-2 transition-all duration-200 ${
                activeTab === category
                  ? 'bg-[#1a1a24] text-white border border-white/10 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.2)]'
                  : 'bg-transparent text-[#6a7282] border border-transparent hover:text-white'
              }`}
            >
              <span className="text-[14px] font-medium whitespace-nowrap">
                {category}
              </span>
            </button>
          ))}
        </div>
      </div>

        {/* Market List */}
        <div className="px-6 pt-2 pb-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-[#8a8a93]">加载中...</div>
        ) : markets.length === 0 ? (
          <div className="text-center py-12 text-[#8a8a93]">暂无数据</div>
        ) : (
          markets.map((market, index) => (
            <MarketItem
              key={`${market.code}-${index}`}
              {...market}
              onClick={() => navigate(`/trading?stock=${market.code}`)}
            />
          ))
        )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
