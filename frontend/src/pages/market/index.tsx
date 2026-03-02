import { useState, useEffect } from 'react';
import { MarketItem } from './MarketItem';
import { BottomNav } from '../../components/BottomNav';
import { AccountHeader } from '../../components/AccountHeader';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
import apiClient from '../../utils/api';

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
  const { accountType, setAccountType } = useAccount();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['指数', '股票', '商品', 'Crypto', '外汇'];

  // 获取产品列表（仅在页面加载或切换分类时获取一次）
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        // 使用新的产品行情 API，按类型筛选
        const response = await apiClient.get('/api/products/quotes', {
          params: { type: activeTab }
        });
        const quotesData = response.data.data || [];

        const marketData: Market[] = quotesData.map((quote: any) => {
          return {
            code: quote.code,
            icon: quote.nameCn?.charAt(0) || quote.code.charAt(0),
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
    <div className="min-h-screen bg-[#1a1f2e] pb-16">
      {/* Header */}
      <AccountHeader
        accountType={accountType}
        onAccountSwitch={setAccountType}
      />

      {/* Banner */}
      <div>
        <button
          onClick={() => navigate('/promotion')}
          className="relative overflow-hidden h-28 w-full block bg-gradient-to-r from-indigo-600 to-blue-600"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xl font-semibold">活动优惠</span>
          </div>
        </button>
      </div>

      {/* Categories */}
      <div className="bg-[#1a1f2e] px-4 py-4 sticky top-0 z-10">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`py-2 px-4 text-sm whitespace-nowrap transition-all rounded-full ${
                activeTab === category
                  ? 'bg-blue-600 !text-white shadow-sm'
                  : 'bg-gray-700/50 !text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Market List */}
      <div className="px-4 pt-2 pb-4 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : markets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暂无数据</div>
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

      <BottomNav />
    </div>
  );
}
