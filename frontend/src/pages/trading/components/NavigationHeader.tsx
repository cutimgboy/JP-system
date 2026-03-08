import { useState, useEffect, useRef } from 'react';
import api from '../../../utils/api';

interface NavigationHeaderProps {
  selectedStock: string;
  onStockChange: (stockCode: string) => void;
}

interface Product {
  code: string;
  tradeCode: string;
  nameCn: string;
  type: string;
  descriptionCn?: string;
  descriptionVn?: string;
}

export function NavigationHeader({ selectedStock, onStockChange }: NavigationHeaderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);

  // 获取所有产品列表
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/products/quotes');
        const quotesData = response.data.data || [];
        setProducts(quotesData);

        // 如果当前选中的股票是默认值且产品列表不为空，自动选择第一个产品
        if (quotesData.length > 0 && (selectedStock === 'AAPL.US' || !quotesData.find((p: Product) => p.code === selectedStock))) {
          onStockChange(quotesData[0].code);
        }
      } catch (error) {
        console.error('获取产品列表失败:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 当选中的股票变化时，自动滚动到可见范围
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedButtonRef.current && scrollContainerRef.current && products.length > 0) {
        const button = selectedButtonRef.current;
        const container = scrollContainerRef.current;

        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        const containerWidth = container.offsetWidth;

        const targetScrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;

        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedStock, products]);

  // 向左滚动
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  // 向右滚动
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#141820] border-b border-gray-700/50">
      {/* 产品列表 */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={scrollLeft}
            className="w-9 h-9 flex items-center justify-center bg-gray-700/50 hover:bg-gray-700 rounded-full transition-colors"
            disabled={loading}
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-2.5 overflow-x-auto scrollbar-hide"
          >
            {loading ? (
              <div className="text-gray-400 text-sm">加载中...</div>
            ) : (
              products.map((product) => (
                <button
                  key={product.code}
                  ref={selectedStock === product.code ? selectedButtonRef : null}
                  onClick={() => onStockChange(product.code)}
                  className="flex flex-col items-center gap-1.5 transition-all"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all overflow-hidden ${
                    selectedStock === product.code
                      ? 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg'
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}>
                    <img src={`/logo/${product.code}.svg`} alt={product.code} className="w-7 h-7 object-contain" />
                  </div>
                  <div className={`text-[10px] whitespace-nowrap transition-colors ${
                    selectedStock === product.code ? 'text-blue-400 font-medium' : 'text-gray-400'
                  }`}>
                    {product.code}
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            onClick={scrollRight}
            className="w-9 h-9 flex items-center justify-center bg-gray-700/50 hover:bg-gray-700 rounded-full transition-colors"
            disabled={loading}
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
