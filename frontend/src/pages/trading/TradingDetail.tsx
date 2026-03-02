import { useState, useEffect } from 'react';
import { NavigationHeader } from './components/NavigationHeader';
import { TradingChart } from './components/TradingChart';
import { TradingControls } from './components/TradingControls';
import { MarketOverview } from './components/MarketOverview';
import { CoinIntroduction } from './components/CoinIntroduction';
import { TradingHours } from './components/TradingHours';
import { TimeSelector } from './components/TimeSelector';
import { AlertDialog } from '../../components/AlertDialog';
import { apiClient } from '../../utils/api';

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
  accountType = 'demo'
}: TradingDetailProps) {
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

  // 加载订单详情并恢复交易状态
  const loadOrderAndRestoreState = async (orderId: number) => {
    try {
      const response = await apiClient.get(`/trade/order/${orderId}`);
      const orderData = response.data.data || response.data;

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
      // 注意：API返回的数据结构是双层嵌套的 response.data.data
      const balanceData = response.data.data || response.data;
      setBalance(balanceData.balance || 0);
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
  };

  const handleBullTrade = async () => {
    const seconds = parseInt(selectedTime.split(':')[0]) * 60 + parseInt(selectedTime.split(':')[1]);
    const amount = parseInt(investmentAmount);

    if (balanceLoading) {
      setAlertDialog({ isOpen: true, title: '提示', message: '正在加载账户信息，请稍候' });
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

    try {
      const response = await apiClient.post('/trade/order', {
        stockCode: selectedStock,
        stockName: selectedStock,
        tradeType: 'bull',
        investmentAmount: amount,
        durationSeconds: seconds,
        accountType,
      });

      const orderData = response.data.data || response.data;
      setCurrentOrderId(orderData.id);
      setCountdown(seconds);
      setTradeStatus('bull');
      // 保存买入价和买入时间
      setEntryPrice(orderData.openPrice);
      setEntryTime(new Date(orderData.openTime).getTime() / 1000); // 转换为秒
      // 设置目标时间
      setTargetTime(new Date(orderData.openTime).getTime() / 1000 + seconds);
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

    try {
      const response = await apiClient.post('/trade/order', {
        stockCode: selectedStock,
        stockName: selectedStock,
        tradeType: 'bear',
        investmentAmount: amount,
        durationSeconds: seconds,
        accountType,
      });

      const orderData = response.data.data || response.data;
      setCurrentOrderId(orderData.id);
      setCountdown(seconds);
      setTradeStatus('bear');
      // 保存买入价和买入时间
      setEntryPrice(orderData.openPrice);
      setEntryTime(new Date(orderData.openTime).getTime() / 1000); // 转换为秒
      // 设置目标时间
      setTargetTime(new Date(orderData.openTime).getTime() / 1000 + seconds);
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
      const orderData = response.data.data || response.data;
      setActualProfitLoss(orderData.profitLoss || 0);
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
      }, 100); // 每100ms更新一次，确保更准确

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
    <div className="min-h-screen bg-[#1a1f2e] pb-[280px]">
      <NavigationHeader
        selectedStock={selectedStock}
        onStockChange={setSelectedStock}
      />
      <TradingChart
        countdown={countdown}
        stockCode={selectedStock}
        entryPrice={entryPrice}
        entryTime={entryTime}
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
      />

      <MarketOverview stockCode={selectedStock} />
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
    </div>
  );
}
