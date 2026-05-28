import { useRef, useState, useEffect } from 'react';
import { NavigationHeader } from './components/NavigationHeader';
import type { Product } from './components/NavigationHeader';
import { TradingChart, type TradingQuoteSummary } from './components/TradingChart';
import { TradingControls } from './components/TradingControls';
import { MarketOverview } from './components/MarketOverview';
import { CoinIntroduction } from './components/CoinIntroduction';
import { TradingHours } from './components/TradingHours';
import { TimeSelector } from './components/TimeSelector';
import { AlertDialog } from '../../components/AlertDialog';
import { apiClient, extractData } from '../../utils/api';
import { useAccount } from '../../contexts/AccountContext';
import { AnimatePresence, motion } from 'framer-motion';
import { tx } from "../../i18n/text";
import { getFallbackProductInfo, getLocalizedProductName } from './productInfo';
const TRADE_GUIDE_COMPLETED_KEY = 'tradeGuideCompleted';
type ActiveTradeStatus = 'bull' | 'bear';
type TradeStatus = 'idle' | ActiveTradeStatus | 'completed';
const hasTriggeredTradeGuide = () => {
  try {
    return localStorage.getItem(TRADE_GUIDE_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
};
const markTradeGuideTriggered = () => {
  try {
    localStorage.setItem(TRADE_GUIDE_COMPLETED_KEY, 'true');
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
};
interface TradingDetailProps {
  onBack: () => void;
  initialStock?: string;
  initialOrderId?: string | null;
  accountType?: 'demo' | 'real';
}
export function TradingDetail({
  onBack,
  initialStock = 'AAPL.US',
  initialOrderId = null,
  accountType: _accountType = 'demo' // 保留参数但不使用
}: TradingDetailProps) {
  const {
    accountId,
    accountType
  } = useAccount(); // 从 context 获取 accountId
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [selectedTime, setSelectedTime] = useState('00:30');
  const [tempSelectedTime, setTempSelectedTime] = useState('00:30');
  const [investmentAmount, setInvestmentAmount] = useState('100000');
  const [tradeStatus, setTradeStatus] = useState<TradeStatus>('idle');
  const [countdown, setCountdown] = useState(0);
  const [selectedStock, setSelectedStock] = useState(initialStock);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [actualProfitLoss, setActualProfitLoss] = useState(0);
  const [isSettling, setIsSettling] = useState(false);
  const [completedTradeType, setCompletedTradeType] = useState<'bull' | 'bear' | null>(null);
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    message: ''
  });
  const [entryPrice, setEntryPrice] = useState<number | undefined>(undefined);
  const [entryTime, setEntryTime] = useState<number | undefined>(undefined);
  const [entryPointSequence, setEntryPointSequence] = useState<number | undefined>(undefined);
  const [targetTime, setTargetTime] = useState<number | null>(null); // 目标时间（秒）
  const [latestPrice, setLatestPrice] = useState<number>(0); // 最新价格
  const [latestTime, setLatestTime] = useState<number>(0); // 最新时间
  const [latestPointSequence, setLatestPointSequence] = useState<number | undefined>(undefined);
  const latestPointRef = useRef<{
    price: number;
    time: number;
    sequence?: number;
  } | null>(null);
  const [guideStep, setGuideStep] = useState(() => {
    if (initialOrderId || hasTriggeredTradeGuide()) {
      return -1;
    }
    return 0;
  });
  const closeTriggeredRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeOrderByStock, setActiveOrderByStock] = useState<Record<string, any>>({});
  const [quoteSummary, setQuoteSummary] = useState<TradingQuoteSummary | null>(null);
  const [showStickyQuote, setShowStickyQuote] = useState(false);
  const selectedProduct = products.find(product => product.code === selectedStock);
  const selectedFallbackProduct = getFallbackProductInfo(selectedStock);
  const selectedName = getLocalizedProductName(selectedProduct || selectedFallbackProduct, selectedStock);
  const activeTradeType = tradeStatus === 'bull' || tradeStatus === 'bear'
    ? tradeStatus
    : tradeStatus === 'completed'
      ? completedTradeType
      : null;
  const displayQuote = quoteSummary || {
    price: selectedProduct?.price || latestPrice || 0,
    change: selectedProduct?.change || 0,
    changePercent: selectedProduct?.changePercent || 0,
    isUpTrend: (selectedProduct?.change || 0) >= 0,
    time: latestTime || 0
  };
  const profitRate = 92;
  const latestSettlementRef = useRef<{
    latestPrice: number;
    entryPrice?: number;
    investmentAmount: string;
    tradeStatus: TradeStatus;
    selectedStock: string;
    productPrice?: number;
  }>({
    latestPrice: 0,
    entryPrice: undefined,
    investmentAmount: '100000',
    tradeStatus: 'idle',
    selectedStock: initialStock,
    productPrice: undefined
  });
  latestSettlementRef.current = {
    latestPrice,
    entryPrice,
    investmentAmount,
    tradeStatus,
    selectedStock,
    productPrice: selectedProduct?.price
  };

  // 当 initialStock 变化时更新 selectedStock
  useEffect(() => {
    setSelectedStock(initialStock);
  }, [initialStock]);

  // 当有 initialOrderId 时，加载订单详情并恢复交易状态
  useEffect(() => {
    if (initialOrderId) {
      loadOrderAndRestoreState(parseInt(initialOrderId));
    }
  }, [initialOrderId]);
  const resetTradeState = () => {
    setTradeStatus('idle');
    setCountdown(0);
    setCurrentOrderId(null);
    setActualProfitLoss(0);
    closeTriggeredRef.current = false;
    setIsSettling(false);
    setCompletedTradeType(null);
    setEntryPrice(undefined);
    setEntryTime(undefined);
    setEntryPointSequence(undefined);
    setTargetTime(null);
  };
  const applyOpenOrderState = (orderData: any) => {
    setGuideStep(-1);
    setCurrentOrderId(orderData.id);
    setTradeStatus(orderData.tradeType);
    setInvestmentAmount(orderData.investmentAmount.toString());
    setEntryPrice(orderData.openPrice);
    setEntryTime(new Date(orderData.openTime).getTime() / 1000);
    setEntryPointSequence(undefined);
    const expectedCloseTime = new Date(orderData.expectedCloseTime).getTime() / 1000;
    setTargetTime(expectedCloseTime);
    const now = Date.now() / 1000;
    const remaining = Math.max(0, Math.ceil(expectedCloseTime - now));
    setCountdown(remaining);
    const durationSeconds = orderData.durationSeconds;
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    setSelectedTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  };

  // 当进入交易页时，按品种缓存进行中的订单
  useEffect(() => {
    const checkAndRestoreActiveOrder = async () => {
      // 如果已经有 initialOrderId，说明是从持仓页点击进来的，不需要再检查
      if (initialOrderId) return;

      // 如果没有 accountId，等待账户加载
      if (!accountId) return;
      try {
        // 获取当前账户类型的进行中订单
        const response = await apiClient.get('/trade/orders/open', {
          params: {
            accountType
          }
        });
        const openOrders = extractData(response) || [];

        // 如果有进行中的订单，自动恢复第一个
        if (openOrders && openOrders.length > 0) {
          const orderMap = openOrders.reduce((map: Record<string, any>, order: any) => {
            map[order.stockCode] = order;
            return map;
          }, {});
          setActiveOrderByStock(orderMap);
          if (orderMap[selectedStock]) {
            applyOpenOrderState(orderMap[selectedStock]);
          }
        }
      } catch (error) {
        console.error(tx("检查进行中订单失败:"), error);
      }
    };
    checkAndRestoreActiveOrder();
  }, [accountId, accountType, initialOrderId]);
  useEffect(() => {
    if (initialOrderId) {
      return;
    }
    const activeOrder = activeOrderByStock[selectedStock];
    if (activeOrder) {
      applyOpenOrderState(activeOrder);
    } else if (tradeStatus !== 'idle') {
      // Clear entry markers when switching to a product without active order
      resetTradeState();
    }
  }, [selectedStock, activeOrderByStock, initialOrderId, tradeStatus]);
  useEffect(() => {
    latestPointRef.current = null;
    setLatestPrice(0);
    setLatestTime(0);
    setLatestPointSequence(undefined);
    setQuoteSummary(null);
  }, [selectedStock]);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    const handleScroll = () => {
      setShowStickyQuote(container.scrollTop > 105);
    };
    handleScroll();
    container.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    const handleStartGuide = () => {
      if (tradeStatus === 'idle' && !hasTriggeredTradeGuide()) {
        setGuideStep(0);
      }
    };
    window.addEventListener('start-trade-guide', handleStartGuide);
    return () => window.removeEventListener('start-trade-guide', handleStartGuide);
  }, [tradeStatus]);
  useEffect(() => {
    if (guideStep === 0) {
      markTradeGuideTriggered();
    }
  }, [guideStep]);

  // 加载订单详情并恢复交易状态
  const loadOrderAndRestoreState = async (orderId: number) => {
    const requestedEntryPoint = latestPointRef.current
      ? { ...latestPointRef.current }
      : latestPrice && latestTime
        ? {
          price: latestPrice,
          time: latestTime,
          sequence: latestPointSequence
        }
        : null;
    try {
      const response = await apiClient.get(`/trade/order/${orderId}`);
      const orderData = extractData(response);

      // 检查订单是否还在进行中
      if (orderData.status === 'open') {
        setSelectedStock(orderData.stockCode);
        setActiveOrderByStock(prev => ({
          ...prev,
          [orderData.stockCode]: orderData
        }));
        applyOpenOrderState(orderData);
      }
    } catch (error) {
      console.error(tx("加载订单详情失败:"), error);
    }
  };
  const timeOptions = [{
    value: '00:30',
    label: '30S'
  }, {
    value: '01:00',
    label: '1min(60s)'
  }, {
    value: '03:00',
    label: '3min(180s)'
  }, {
    value: '05:00',
    label: '5min(300s)'
  }];

  // 获取账户余额
  const fetchBalance = async () => {
    try {
      const response = await apiClient.get('/account/balance', {
        params: {
          accountType
        }
      });
      const balanceData = extractData(response);
      setBalance(balanceData?.balance || 0);
      setBalanceLoading(false);
    } catch (error) {
      console.error(tx("获取余额失败:"), error);
      setBalanceLoading(false);
    }
  };

  // 初始化时获取余额
  useEffect(() => {
    fetchBalance();
    // 每5秒刷新一次余额
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, []);
  const handleConfirmTime = () => {
    setSelectedTime(tempSelectedTime);
    setShowTimeSelector(false);
    if (guideStep === 1) {
      setGuideStep(2);
    }
  };
  const handleBullTrade = async () => {
    const seconds = parseInt(selectedTime.split(':')[0]) * 60 + parseInt(selectedTime.split(':')[1]);
    const amount = parseInt(investmentAmount);
    if (balanceLoading) {
      setAlertDialog({
        isOpen: true,
        title: tx("提示"),
        message: tx("正在加载账户信息，请稍候")
      });
      return;
    }
    if (!accountId) {
      setAlertDialog({
        isOpen: true,
        title: tx("提示"),
        message: tx("账户信息加载中，请稍候")
      });
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setAlertDialog({
        isOpen: true,
        title: tx("提示"),
        message: tx("请输入有效的投资金额")
      });
      return;
    }
    if (balance <= 0) {
      setAlertDialog({
        isOpen: true,
        title: tx("余额不足"),
        message: tx("账户余额不足，请先充值")
      });
      return;
    }
    if (amount > balance) {
      setAlertDialog({
        isOpen: true,
        title: tx("余额不足"),
        message: tx('账户余额不足，当前余额：{{balance}} VND', { balance: balance.toLocaleString() })
      });
      return;
    }

    // 检查是否已有进行中的交易
    if (tradeStatus !== 'idle') {
      setAlertDialog({
        isOpen: true,
        title: tx("提示"),
        message: tx("您已有进行中的交易，请等待当前交易完成")
      });
      return;
    }
    const requestedEntryPoint = latestPointRef.current
      ? { ...latestPointRef.current }
      : latestPrice && latestTime
        ? {
          price: latestPrice,
          time: latestTime,
          sequence: latestPointSequence
        }
        : null;
    try {
      const response = await apiClient.post('/trade/order', {
        stockCode: selectedStock,
        stockName: selectedName,
        tradeType: 'bull',
        investmentAmount: amount,
        durationSeconds: seconds,
        accountId // 使用 accountId 而不是 accountType
      });
      const orderData = extractData(response);
      const nextOrder = {
        ...orderData,
        stockCode: selectedStock,
        stockName: selectedName,
        tradeType: 'bull'
      };
      setCurrentOrderId(orderData.id);
      setActiveOrderByStock(prev => ({
        ...prev,
        [selectedStock]: nextOrder
      }));
      closeTriggeredRef.current = false;
      setIsSettling(false);
      setCompletedTradeType(null);
      setCountdown(seconds);
      setTradeStatus('bull');
      // 保存买入价和买入时间 - 使用K线图的最新价格和时间
      const entryPoint = requestedEntryPoint;
      setEntryPrice(entryPoint?.price || latestPrice || orderData.openPrice);
      setEntryTime(entryPoint?.time || latestTime || Date.now() / 1000);
      setEntryPointSequence(entryPoint?.sequence ?? latestPointSequence);
      // 设置目标时间
      setTargetTime(new Date(orderData.expectedCloseTime).getTime() / 1000);
      if (guideStep === 3) {
        setGuideStep(4);
      }
      fetchBalance(); // 刷新余额
    } catch (error: any) {
      console.error(tx("创建订单失败:"), error);
      setAlertDialog({
        isOpen: true,
        title: tx("创建订单失败"),
        message: error.response?.data?.message || tx("创建订单失败，请稍后重试")
      });
    }
  };
  const handleBearTrade = async () => {
    const seconds = parseInt(selectedTime.split(':')[0]) * 60 + parseInt(selectedTime.split(':')[1]);
    const amount = parseInt(investmentAmount);
    if (balanceLoading) {
      setAlertDialog({
        isOpen: true,
        title: tx("提示"),
        message: tx("正在加载账户信息，请稍候")
      });
      return;
    }
    if (!accountId) {
      setAlertDialog({
        isOpen: true,
        title: tx("提示"),
        message: tx("账户信息加载中，请稍候")
      });
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setAlertDialog({
        isOpen: true,
        title: tx("提示"),
        message: tx("请输入有效的投资金额")
      });
      return;
    }
    if (balance <= 0) {
      setAlertDialog({
        isOpen: true,
        title: tx("余额不足"),
        message: tx("账户余额不足，请先充值")
      });
      return;
    }
    if (amount > balance) {
      setAlertDialog({
        isOpen: true,
        title: tx("余额不足"),
        message: tx('账户余额不足，当前余额：{{balance}} VND', { balance: balance.toLocaleString() })
      });
      return;
    }

    // 检查是否已有进行中的交易
    if (tradeStatus !== 'idle') {
      setAlertDialog({
        isOpen: true,
        title: tx("提示"),
        message: tx("您已有进行中的交易，请等待当前交易完成")
      });
      return;
    }
    const requestedEntryPoint = latestPointRef.current
      ? { ...latestPointRef.current }
      : latestPrice && latestTime
        ? {
          price: latestPrice,
          time: latestTime,
          sequence: latestPointSequence
        }
        : null;
    try {
      const response = await apiClient.post('/trade/order', {
        stockCode: selectedStock,
        stockName: selectedName,
        tradeType: 'bear',
        investmentAmount: amount,
        durationSeconds: seconds,
        accountId // 使用 accountId 而不是 accountType
      });
      const orderData = extractData(response);
      const nextOrder = {
        ...orderData,
        stockCode: selectedStock,
        stockName: selectedName,
        tradeType: 'bear'
      };
      setCurrentOrderId(orderData.id);
      setActiveOrderByStock(prev => ({
        ...prev,
        [selectedStock]: nextOrder
      }));
      closeTriggeredRef.current = false;
      setIsSettling(false);
      setCompletedTradeType(null);
      setCountdown(seconds);
      setTradeStatus('bear');
      // 保存买入价和买入时间 - 使用K线图的最新价格和时间
      const entryPoint = requestedEntryPoint;
      setEntryPrice(entryPoint?.price || latestPrice || orderData.openPrice);
      setEntryTime(entryPoint?.time || latestTime || Date.now() / 1000);
      setEntryPointSequence(entryPoint?.sequence ?? latestPointSequence);
      // 设置目标时间
      setTargetTime(new Date(orderData.expectedCloseTime).getTime() / 1000);
      if (guideStep === 3) {
        setGuideStep(4);
      }
      fetchBalance(); // 刷新余额
    } catch (error: any) {
      console.error(tx("创建订单失败:"), error);
      setAlertDialog({
        isOpen: true,
        title: tx("创建订单失败"),
        message: error.response?.data?.message || tx("创建订单失败，请稍后重试")
      });
    }
  };
  const handleResetTrade = () => {
    resetTradeState();
    setActiveOrderByStock(prev => {
      const next = {
        ...prev
      };
      delete next[selectedStock];
      return next;
    });
    fetchBalance(); // 刷新余额
  };
  const calculateLocalProfitLoss = (type: ActiveTradeStatus, openPrice: number, closePrice: number, amount: number) => {
    const priceChange = closePrice - openPrice;
    if (priceChange === 0) {
      return 0;
    }
    const isWin = type === 'bull' ? priceChange > 0 : priceChange < 0;
    return isWin ? amount * (profitRate / 100) : -amount;
  };
  const applySettledOrder = (orderData: any, options: {
    refreshBalance?: boolean;
    adjustBalanceLocally?: boolean;
  } = {}) => {
    const profitLoss = Number(orderData?.profitLoss ?? 0);
    const settledAmount = Number(orderData?.investmentAmount ?? parseInt(investmentAmount || '0'));
    setActualProfitLoss(profitLoss);
    setCompletedTradeType(orderData?.tradeType || (tradeStatus === 'bull' || tradeStatus === 'bear' ? tradeStatus : null));
    setTradeStatus('completed');
    setIsSettling(false);
    setActiveOrderByStock(prev => {
      const next = {
        ...prev
      };
      delete next[orderData?.stockCode || selectedStock];
      return next;
    });
    if (options.adjustBalanceLocally) {
      const releasedAmount = profitLoss > 0 ? settledAmount + profitLoss : profitLoss === 0 ? settledAmount : 0;
      setBalance(prev => prev + releasedAmount);
    }
    if (options.refreshBalance !== false) {
      fetchBalance();
    }
  };
  const applyLocalSettledOrder = (orderId: number) => {
    const snapshot = latestSettlementRef.current;
    if (snapshot.tradeStatus !== 'bull' && snapshot.tradeStatus !== 'bear') {
      return;
    }
    const amount = parseInt(snapshot.investmentAmount || '0');
    const fallbackClosePrice = Number(snapshot.latestPrice || snapshot.productPrice || 0);
    const openPrice = Number(snapshot.entryPrice || fallbackClosePrice);
    const closePrice = fallbackClosePrice || openPrice;
    const profitLoss = calculateLocalProfitLoss(snapshot.tradeStatus, openPrice, closePrice, amount);
    applySettledOrder({
      id: orderId,
      stockCode: snapshot.selectedStock,
      tradeType: snapshot.tradeStatus,
      investmentAmount: amount,
      profitRate,
      openPrice,
      closePrice,
      closeTime: new Date().toISOString(),
      status: 'closed',
      profitLoss
    }, {
      refreshBalance: false,
      adjustBalanceLocally: true
    });
  };

  // 获取订单详情
  const fetchOrderDetail = async (orderId: number) => {
    try {
      const response = await apiClient.get(`/trade/order/${orderId}`);
      const orderData = extractData(response);
      setActualProfitLoss(Number(orderData?.profitLoss ?? 0));

      // 如果订单还是open状态，说明还没有平仓，继续轮询
      if (orderData.status === 'open') {
        setTimeout(() => fetchOrderDetail(orderId), 1000);
      } else {
        applySettledOrder(orderData);
      }
    } catch (error) {
      console.error(tx("获取订单详情失败:"), error);
    }
  };
  const settleOrder = async (orderId: number, attempt = 0) => {
    try {
      const response = await apiClient.post(`/trade/order/${orderId}/close`);
      const orderData = extractData(response);
      applySettledOrder(orderData);
    } catch (error: any) {
      console.error(tx("订单结算失败:"), error.response?.data || error);
      try {
        const detailResponse = await apiClient.get(`/trade/order/${orderId}`);
        const orderData = extractData(detailResponse);
        if (orderData?.status === 'closed') {
          applySettledOrder(orderData);
          return;
        }
      } catch (detailError) {
        console.error(tx("获取结算订单详情失败:"), detailError);
      }
      if (attempt < 8) {
        window.setTimeout(() => settleOrder(orderId, attempt + 1), attempt < 2 ? 600 : 1000);
        return;
      }
      console.warn(tx("订单后台结算仍未完成，已先展示本地计算结果"));
    }
  };

  // Countdown effect - 使用实时计算而不是递减
  useEffect(() => {
    if (targetTime && (tradeStatus === 'bull' || tradeStatus === 'bear')) {
      const timer = setInterval(() => {
        const now = Date.now() / 1000;
        const remaining = Math.max(0, Math.ceil(targetTime - now));
        setCountdown(remaining);
        if (remaining <= 0 && currentOrderId && !closeTriggeredRef.current) {
          closeTriggeredRef.current = true;
          applyLocalSettledOrder(currentOrderId);
          window.setTimeout(() => settleOrder(currentOrderId), 600);
        }
      }, 250); // 降低刷新频率，减少交易页整体重渲染压力

      return () => clearInterval(timer);
    }
  }, [targetTime, tradeStatus, currentOrderId]);

  // 计算预期收益
  const expectedProfit = Math.floor(parseInt(investmentAmount || '0') * 0.92);
  // 根据交易状态决定显示的收益
  const displayProfit = tradeStatus === 'idle' ? actualProfitLoss : tradeStatus === 'completed' ? actualProfitLoss : expectedProfit;
  const changeSign = displayQuote.change >= 0 ? '+' : '';
  const switchStockByOffset = (offset: number) => {
    if (products.length === 0) {
      return;
    }
    const currentIndex = products.findIndex(product => product.code === selectedStock);
    if (currentIndex < 0) {
      return;
    }
    const nextIndex = currentIndex + offset;
    if (nextIndex >= 0 && nextIndex < products.length) {
      setSelectedStock(products[nextIndex].code);
    }
  };
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };
  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }
    const dx = touchStartX.current - event.changedTouches[0].clientX;
    const dy = touchStartY.current - event.changedTouches[0].clientY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      switchStockByOffset(dx > 0 ? 1 : -1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };
  return <div ref={scrollContainerRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="h-screen overflow-y-auto bg-[#09090b] pb-[280px]">
      <div className={`fixed left-0 right-0 top-0 z-30 border-b border-white/5 bg-[#09090b]/94 px-4 py-3 backdrop-blur-xl transition-all duration-200 ${showStickyQuote ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 truncate text-[15px] font-bold text-white">{selectedName}</div>
          <div className="grid shrink-0 grid-cols-3 gap-3 text-right font-mono">
            <div className="text-[15px] font-bold text-white">{displayQuote.price.toFixed(2)}</div>
            <div className={`text-[13px] font-bold ${displayQuote.isUpTrend ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>{changeSign}{displayQuote.change.toFixed(2)}</div>
            <div className={`text-[13px] font-bold ${displayQuote.isUpTrend ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>{changeSign}{displayQuote.changePercent.toFixed(2)}%</div>
          </div>
        </div>
      </div>

      <NavigationHeader selectedStock={selectedStock} onStockChange={setSelectedStock} onProductsChange={setProducts} />
      <TradingChart countdown={countdown} stockCode={selectedStock} productName={selectedName} entryPrice={entryPrice} entryTime={entryTime} entryPointSequence={entryPointSequence} tradeType={activeTradeType} onPriceUpdate={(price, time, sequence) => {
      latestPointRef.current = {
        price,
        time,
        sequence
      };
      setLatestPrice(price);
      setLatestTime(time);
      setLatestPointSequence(sequence);
    }} onQuoteUpdate={setQuoteSummary} profitLoss={actualProfitLoss} showProfit={tradeStatus === 'completed' && !isSettling} />

      <TradingControls selectedTime={selectedTime} investmentAmount={investmentAmount} tradeStatus={tradeStatus} countdown={countdown} balance={balance} expectedProfit={displayProfit} profitRate={profitRate} actualProfitLoss={actualProfitLoss} onTimeClick={() => {
      if (tradeStatus === 'idle') {
        setTempSelectedTime(selectedTime);
        setShowTimeSelector(true);
      }
    }} onInvestmentChange={setInvestmentAmount} onBullTrade={handleBullTrade} onBearTrade={handleBearTrade} onResetTrade={handleResetTrade} guideStep={guideStep} onGuideStepChange={setGuideStep} />

      <MarketOverview stockCode={selectedStock} />
      <CoinIntroduction stockCode={selectedStock} />
      <TradingHours stockCode={selectedStock} />

      <TimeSelector isOpen={showTimeSelector} selectedTime={selectedTime} tempSelectedTime={tempSelectedTime} timeOptions={timeOptions} onClose={() => setShowTimeSelector(false)} onSelectTime={setTempSelectedTime} onConfirm={handleConfirmTime} />

      <AlertDialog isOpen={alertDialog.isOpen} title={alertDialog.title} message={alertDialog.message} onClose={() => setAlertDialog({
      isOpen: false,
      title: '',
      message: ''
    })} />

      <AnimatePresence>
        {[1, 2, 3].includes(guideStep) && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-[35] bg-black/60 backdrop-blur-sm" />}
      </AnimatePresence>

      <AnimatePresence>
        {guideStep === 0 && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-8 backdrop-blur-sm">
            <motion.div initial={{
          opacity: 0,
          scale: 0.95,
          y: 12
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.95,
          y: 12
        }} className="flex w-full max-w-[320px] flex-col items-center rounded-[24px] bg-white p-6 text-center shadow-2xl">
              <div className="relative mb-6 flex h-[88px] w-[88px] items-center justify-center">
                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-[#10b981] to-[#6c48f5] opacity-25 blur-xl" />
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[24px] border border-[#10b981]/30 bg-[#1c1c24] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_10px_30px_rgba(0,0,0,0.3)]">
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">
                    <path d="M3 17L9 11L13 15L21 7" stroke="url(#guideTrendGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 7H21V13" stroke="url(#guideTrendGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="guideTrendGrad" x1="3" y1="17" x2="21" y2="7" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6c48f5" />
                        <stop offset="1" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-[18px] font-bold text-black">{tx("欢迎来到交易世界")}</h3>
              <p className="mb-6 text-center text-[16px] font-bold leading-relaxed text-black/80">{tx("30 秒带你体验一笔交易")}<br />{tx("准备好了么？")}</p>
              <button onClick={() => {
            markTradeGuideTriggered();
            setGuideStep(1);
          }} className="h-[48px] w-full rounded-[12px] bg-[#10b981] text-[16px] font-bold text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-colors hover:bg-[#059669]">{tx("开始引导")}</button>
              <button onClick={() => {
            markTradeGuideTriggered();
            setGuideStep(-1);
          }} style={{
            color: '#000000',
            opacity: 1
          }} className="mt-3 text-[13px] font-medium !text-black">{tx("暂时跳过")}</button>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {guideStep === 4 && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
            <motion.div initial={{
          scale: 0.9,
          opacity: 0,
          y: 20
        }} animate={{
          scale: 1,
          opacity: 1,
          y: 0
        }} exit={{
          scale: 0.9,
          opacity: 0,
          y: 20
        }} className="flex w-full max-w-[320px] flex-col items-center rounded-[24px] border border-white/10 bg-[#1c1c24] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#10b981]/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-3 text-[20px] font-bold text-white">{tx("下单成功")}</h3>
              <p className="mb-8 text-[15px] leading-relaxed text-white/70">{tx("恭喜你，完成了第一笔交易。")}<br />{tx("现在只需等待到期结算，中途涨跌不用管。")}</p>
              <button onClick={() => {
            markTradeGuideTriggered();
            setGuideStep(-1);
          }} className="h-[52px] w-full rounded-full bg-[#10b981] text-[16px] font-bold text-white shadow-[0_4px_15px_rgba(16,185,129,0.35)] transition-colors hover:bg-[#059669]">{tx("知道了")}</button>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
