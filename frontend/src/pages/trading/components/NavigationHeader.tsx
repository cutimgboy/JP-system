import { useState, useEffect, useRef } from 'react';
import api, { extractData } from '../../../utils/api';

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 检查滚动位置，更新左右箭头状态
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // 获取所有产品列表
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/products/quotes');
        let quotesData = extractData(response) || [];

        // 确保是数组
        if (!Array.isArray(quotesData)) {
          console.warn('产品列表不是数组:', quotesData);
          quotesData = [];
        }

        console.log('获取到的产品数量:', quotesData.length);
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

  // 监听产品列表变化，初始化滚动状态
  useEffect(() => {
    if (products.length > 0) {
      // 延迟检查，确保DOM已渲染
      setTimeout(checkScrollPosition, 100);
    }
  }, [products]);

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
      // 滚动后检查位置
      setTimeout(checkScrollPosition, 300);
    }
  };

  // 向右滚动
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      // 滚动后检查位置
      setTimeout(checkScrollPosition, 300);
    }
  };

  return (
    <div className="bg-[#09090b] pt-[48px] px-4">
      {/* 产品列表 */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={scrollLeft}
          className={`w-8 h-8 rounded-full bg-[#1a1a24] flex items-center justify-center shrink-0 transition-colors shadow-sm ${
            canScrollLeft && !loading
              ? 'text-[#8a8a93] hover:bg-[#2a2a36] cursor-pointer'
              : 'text-[#4a4a53] cursor-not-allowed opacity-50'
          }`}
          disabled={loading || !canScrollLeft}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto scrollbar-hide py-2"
          onScroll={checkScrollPosition}
        >
          <div className="flex justify-start gap-4">
            {loading ? (
              <div className="text-[#8a8a93] text-sm">加载中...</div>
            ) : (
              products.map((product) => {
                const isActive = selectedStock === product.code;
                // 判断是否为外汇类型（使用 PNG）
                const isPng = product.type === '外汇';
                const logoSrc = `/logo/${product.code}.${isPng ? 'png' : 'svg'}`;

                return (
                  <div
                    key={product.code}
                    ref={selectedStock === product.code ? selectedButtonRef : null}
                    onClick={() => onStockChange(product.code)}
                    className="relative flex items-center justify-center cursor-pointer transition-all duration-300 shrink-0"
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-white/20 blur-[10px] rounded-full" />
                    )}
                    <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 shadow-[0px_4px_10px_rgba(0,0,0,0.2)] border-2 transition-all duration-300 bg-gradient-to-br from-[#6c48f5] to-[#8c6bff] overflow-hidden ${
                      isActive ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                    }`}>
                      <img
                        src={logoSrc}
                        alt={product.code}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // 如果 SVG 加载失败，尝试 PNG
                          if (!isPng && target.src.endsWith('.svg')) {
                            target.src = `/logo/${product.code}.png`;
                          } else {
                            // 如果都失败，显示占位符
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-icon')) {
                              const div = document.createElement('div');
                              div.className = 'w-[20px] h-[20px] bg-white rounded-sm fallback-icon';
                              parent.appendChild(div);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <button
          onClick={scrollRight}
          className={`w-8 h-8 rounded-full bg-[#1a1a24] flex items-center justify-center shrink-0 transition-colors shadow-sm ${
            canScrollRight && !loading
              ? 'text-[#8a8a93] hover:bg-[#2a2a36] cursor-pointer'
              : 'text-[#4a4a53] cursor-not-allowed opacity-50'
          }`}
          disabled={loading || !canScrollRight}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
