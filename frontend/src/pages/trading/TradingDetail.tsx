import { useState, useEffect } from 'react';
import { NavigationHeader } from './components/NavigationHeader';
import { TradingChart } from './components/TradingChart';
import { TradingControls } from './components/TradingControls';
import { MarketOverview } from './components/MarketOverview';
import { CoinIntroduction } from './components/CoinIntroduction';
import { TradingHours } from './components/TradingHours';
import { TimeSelector } from './components/TimeSelector';
import { AlertDialog } from '../../components/AlertDialog';
import { apiClient, extractData } from '../../utils/api';
import { useAccount } from '../../contexts/AccountContext';
import { AnimatePresence, motion } from 'framer-motion';

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
  const { accountId, accountType } = useAccount(); // 从 context 获取 accountId
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [selectedTime, setSelectedTime] = useState('00:30');
  const [tempSelectedTime, setTempSelectedTime] = useState('00:30');
  const [investmentAmount, setInvestmentAmount] = useState('100000');
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'bull' | 'bear' | 'completed'>('idle');
  const [countdown, setCountdown] = useState(0);
  const [selectedStock, setSelectedStock] = useState(initialStock);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [actualProfitLoss, setActualProfitLoss] = useState(0);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '' });
  const [entryPrice, setEntryPrice] = useState<number | undefined>(undefined);
  const [entryTime, setEntryTime] = useState<number | undefined>(undefined);
  const [targetTime, setTargetTime] = useState<number | null>(null); // 目标时间（秒）
  const [latestPrice, setLatestPrice] = useState<number>(0); // 最新价格
  const [latestTime, setLatestTime] = useState<number>(0); // 最新时间
  const [guideStep, setGuideStep] = useState(() => {
    if (initialOrderId || localStorage.getItem('tradeGuideCompleted') === 'true') {
      return -1;
    }
    return 0;
  });

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

  // 当进入交易页时，自动检查是否有进行中的订单
  useEffect(() => {
    const checkAndRestoreActiveOrder = async () => {
      // 如果已经有 initialOrderId，说明是从持仓页点击进来的，不需要再检查
      if (initialOrderId) return;

      // 如果没有 accountId，等待账户加载
      if (!accountId) return;

      try {
        // 获取当前账户类型的进行中订单
        const response = await apiClient.get('/trade/orders/open', {
          params: { accountType }
        });
        const openOrders = extractData(response) || [];

        // 如果有进行中的订单，自动恢复第一个
        if (openOrders && openOrders.length > 0) {
          setGuideStep(-1);
          const activeOrder = openOrders[0];
          loadOrderAndRestoreState(activeOrder.id);
        }
      } catch (error) {
        console.error('检查进行中订单失败:', error);
      }
    };

    checkAndRestoreActiveOrder();
  }, [accountId, accountType, initialOrderId]);

  useEffect(() => {
    const handleStartGuide = () => {
      if (tradeStatus === 'idle') {
        setGuideStep(0);
      }
    };

    window.addEventListener('start-trade-guide', handleStartGuide);
    return () => window.removeEventListener('start-trade-guide', handleStartGuide);
  }, [tradeStatus]);

  // 加载订单详情并恢复交易状态
  const loadOrderAndRestoreState = async (orderId: number) => {
    try {
      const response = await apiClient.get(`/trade/order/${orderId}`);
      const orderData = extractData(response);

      // 检查订单是否还在进行中
      if (orderData.status === 'open') {
        // 恢复交易状态
        setCurrentOrderId(orderData.id);
        setTradeStatus(orderData.tradeType); // 'bull' 或 'bear'
        setInvestmentAmount(orderData.investmentAmount.toString());
        setEntryPrice(orderData.openPrice);
        setEntryTime(new Date(orderData.openTime).getTime() / 1000);

        // 计算剩余时间
        const expectedCloseTime = new Date(orderData.expectedCloseTime).getTime() / 1000;
        setTargetTime(expectedCloseTime);

        const now = Date.now() / 1000;
        const remaining = Math.max(0, Math.ceil(expectedCloseTime - now));
        setCountdown(remaining);

        // 恢复选择的时间
        const durationSeconds = orderData.durationSeconds;
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;
        setSelectedTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    } catch (error) {
      console.error('加载订单详情失败:', error);
    }
  };

  const timeOptions = [
    { value: '00:30', label: '30S' },
    { value: '01:00', label: '1min(60s)' },
    { value: '03:00', label: '3min(180s)' },
    { value: '05:00', label: '5min(300s)' },
  ];

  // 获取账户余额
  const fetchBalance = async () => {
    try {
      const response = await apiClient.get('/account/balance', {
        params: { accountType }
      });
      const balanceData = extractData(response);
      setBalance(balanceData?.balance || 0);
      setBalanceLoading(false);
    } catch (error) {
      console.error('获取余额失败:', error);
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
      setAlertDialog({ isOpen: true, title: '提示', message: '正在加载账户信息，请稍候' });
      return;
    }

    if (!accountId) {
      setAlertDialog({ isOpen: true, title: '提示', message: '账户信息加载中，请稍候' });
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setAlertDialog({ isOpen: true, title: '提示', message: '请输入有效的投资金额' });
      return;
    }

    if (balance <= 0) {
      setAlertDialog({ isOpen: true, title: '余额不足', message: '账户余额不足，请先充值' });
      return;
    }

    if (amount > balance) {
      setAlertDialog({
        isOpen: true,
        title: '余额不足',
        message: `账户余额不足，当前余额：${balance.toLocaleString()} VND`
      });
      return;
    }

    // 检查是否已有进行中的交易
    if (tradeStatus !== 'idle') {
      setAlertDialog({
        isOpen: true,
        title: '提示',
        message: '您已有进行中的交易，请等待当前交易完成'
      });
      return;
    }

    try {
      const response = await apiClient.post('/trade/order', {
        stockCode: selectedStock,
        stockName: selectedStock,
        tradeType: 'bull',
        investmentAmount: amount,
        durationSeconds: seconds,
        accountId, // 使用 accountId 而不是 accountType
      });

      const orderData = extractData(response);
      setCurrentOrderId(orderData.id);
      setCountdown(seconds);
      setTradeStatus('bull');
      // 保存买入价和买入时间 - 使用K线图的最新价格和时间
      setEntryPrice(latestPrice || orderData.openPrice);
      setEntryTime(latestTime || Date.now() / 1000);
      // 设置目标时间
      setTargetTime((latestTime || Date.now() / 1000) + seconds);
      if (guideStep === 3) {
        setGuideStep(4);
      }
      fetchBalance(); // 刷新余额
    } catch (error: any) {
      console.error('创建订单失败:', error);
      setAlertDialog({
        isOpen: true,
        title: '创建订单失败',
        message: error.response?.data?.message || '创建订单失败，请稍后重试'
      });
    }
  };

  const handleBearTrade = async () => {
    const seconds = parseInt(selectedTime.split(':')[0]) * 60 + parseInt(selectedTime.split(':')[1]);
    const amount = parseInt(investmentAmount);

    if (balanceLoading) {
      setAlertDialog({ isOpen: true, title: '提示', message: '正在加载账户信息，请稍候' });
      return;
    }

    if (!accountId) {
      setAlertDialog({ isOpen: true, title: '提示', message: '账户信息加载中，请稍候' });
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setAlertDialog({ isOpen: true, title: '提示', message: '请输入有效的投资金额' });
      return;
    }

    if (balance <= 0) {
      setAlertDialog({ isOpen: true, title: '余额不足', message: '账户余额不足，请先充值' });
      return;
    }

    if (amount > balance) {
      setAlertDialog({
        isOpen: true,
        title: '余额不足',
        message: `账户余额不足，当前余额：${balance.toLocaleString()} VND`
      });
      return;
    }

    // 检查是否已有进行中的交易
    if (tradeStatus !== 'idle') {
      setAlertDialog({
        isOpen: true,
        title: '提示',
        message: '您已有进行中的交易，请等待当前交易完成'
      });
      return;
    }

    try {
      const response = await apiClient.post('/trade/order', {
        stockCode: selectedStock,
        stockName: selectedStock,
        tradeType: 'bear',
        investmentAmount: amount,
        durationSeconds: seconds,
        accountId, // 使用 accountId 而不是 accountType
      });

      const orderData = extractData(response);
      setCurrentOrderId(orderData.id);
      setCountdown(seconds);
      setTradeStatus('bear');
      // 保存买入价和买入时间 - 使用K线图的最新价格和时间
      setEntryPrice(latestPrice || orderData.openPrice);
      setEntryTime(latestTime || Date.now() / 1000);
      // 设置目标时间
      setTargetTime((latestTime || Date.now() / 1000) + seconds);
      if (guideStep === 3) {
        setGuideStep(4);
      }
      fetchBalance(); // 刷新余额
    } catch (error: any) {
      console.error('创建订单失败:', error);
      setAlertDialog({
        isOpen: true,
        title: '创建订单失败',
        message: error.response?.data?.message || '创建订单失败，请稍后重试'
      });
    }
  };

  const handleResetTrade = () => {
    setTradeStatus('idle');
    setCountdown(0);
    setCurrentOrderId(null);
    setActualProfitLoss(0);
    setEntryPrice(undefined);
    setEntryTime(undefined);
    setTargetTime(null);
    fetchBalance(); // 刷新余额
  };

  // 获取订单详情
  const fetchOrderDetail = async (orderId: number) => {
    try {
      const response = await apiClient.get(`/trade/order/${orderId}`);
      const orderData = extractData(response);
      setActualProfitLoss(orderData.profitLoss || 0);

      // 如果订单还是open状态，说明还没有平仓，继续轮询
      if (orderData.status === 'open') {
        setTimeout(() => fetchOrderDetail(orderId), 1000);
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
    }
  };

  // Countdown effect - 使用实时计算而不是递减
  useEffect(() => {
    if (targetTime && (tradeStatus === 'bull' || tradeStatus === 'bear')) {
      const timer = setInterval(() => {
        const now = Date.now() / 1000;
        const remaining = Math.max(0, Math.ceil(targetTime - now));

        setCountdown(remaining);

        if (remaining <= 0) {
          setTradeStatus('completed');
          // 订单完成后获取实际盈亏和刷新余额
          if (currentOrderId) {
            setTimeout(() => {
              fetchOrderDetail(currentOrderId);
              fetchBalance();
            }, 1000);
          }
        }
      }, 250); // 降低刷新频率，减少交易页整体重渲染压力

      return () => clearInterval(timer);
    }
  }, [targetTime, tradeStatus, currentOrderId]);

  // 计算预期收益
  const expectedProfit = Math.floor(parseInt(investmentAmount || '0') * 0.92);
  const profitRate = 92;

  // 根据交易状态决定显示的收益
  const displayProfit = tradeStatus === 'idle' ? actualProfitLoss :
                        (tradeStatus === 'completed' ? actualProfitLoss : expectedProfit);

  return (
    <div className="min-h-screen bg-[#09090b] pb-[280px]">
      <NavigationHeader
        selectedStock={selectedStock}
        onStockChange={setSelectedStock}
      />
      <TradingChart
        countdown={countdown}
        stockCode={selectedStock}
        entryPrice={entryPrice}
        entryTime={entryTime}
        tradeType={tradeStatus === 'bull' || tradeStatus === 'bear' ? tradeStatus : null}
        onPriceUpdate={(price, time) => {
          setLatestPrice(price);
          setLatestTime(time);
        }}
        profitLoss={actualProfitLoss}
        showProfit={tradeStatus === 'completed'}
      />

      <TradingControls
        selectedTime={selectedTime}
        investmentAmount={investmentAmount}
        tradeStatus={tradeStatus}
        countdown={countdown}
        balance={balance}
        expectedProfit={displayProfit}
        profitRate={profitRate}
        actualProfitLoss={actualProfitLoss}
        onTimeClick={() => {
          if (tradeStatus === 'idle') {
            setTempSelectedTime(selectedTime);
            setShowTimeSelector(true);
          }
        }}
        onInvestmentChange={setInvestmentAmount}
        onBullTrade={handleBullTrade}
        onBearTrade={handleBearTrade}
        onResetTrade={handleResetTrade}
        guideStep={guideStep}
        onGuideStepChange={setGuideStep}
      />

      <CoinIntroduction stockCode={selectedStock} />
      <TradingHours stockCode={selectedStock} />

      <TimeSelector
        isOpen={showTimeSelector}
        selectedTime={selectedTime}
        tempSelectedTime={tempSelectedTime}
        timeOptions={timeOptions}
        onClose={() => setShowTimeSelector(false)}
        onSelectTime={setTempSelectedTime}
        onConfirm={handleConfirmTime}
      />

      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        onClose={() => setAlertDialog({ isOpen: false, title: '', message: '' })}
      />

      <AnimatePresence>
        {[1, 2, 3].includes(guideStep) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[35] bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {guideStep === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-8 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="flex w-full max-w-[320px] flex-col items-center rounded-[24px] bg-white p-6 text-center shadow-2xl"
            >
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
              <h3 className="mb-2 text-[18px] font-bold text-black">欢迎来到交易世界</h3>
              <p className="mb-6 text-center text-[16px] font-bold leading-relaxed text-black/80">
                30 秒带你体验一笔交易<br />准备好了么？
              </p>
              <button
                onClick={() => setGuideStep(1)}
                className="h-[48px] w-full rounded-[12px] bg-[#10b981] text-[16px] font-bold text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-colors hover:bg-[#059669]"
              >
                开始引导
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('tradeGuideCompleted', 'true');
                  setGuideStep(-1);
                }}
                className="mt-3 text-[13px] text-black/45"
              >
                暂时跳过
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {guideStep === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="flex w-full max-w-[320px] flex-col items-center rounded-[24px] border border-white/10 bg-[#1c1c24] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#10b981]/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-3 text-[20px] font-bold text-white">下单成功</h3>
              <p className="mb-8 text-[15px] leading-relaxed text-white/70">
                恭喜你，完成了第一笔交易。<br />
                现在只需等待到期结算，中途涨跌不用管。
              </p>
              <button
                onClick={() => {
                  localStorage.setItem('tradeGuideCompleted', 'true');
                  setGuideStep(-1);
                }}
                className="h-[52px] w-full rounded-full bg-white text-[16px] font-bold text-black shadow-[0_4px_15px_rgba(255,255,255,0.2)] transition-colors hover:bg-gray-200"
              >
                知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
