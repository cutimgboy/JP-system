import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronLeft, DollarSign, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccount } from '../../contexts/AccountContext';
import apiClient, { extractData } from '../../utils/api';

interface SelectedBank {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

interface BalanceResponse {
  availableBalance?: number;
  balance?: number;
}

export function WithdrawAmount() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accountType } = useAccount();
  const bank = location.state?.bank as SelectedBank | undefined;
  const [amount, setAmount] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const minAmount = 100;

  useEffect(() => {
    if (!bank) {
      navigate('/withdraw', { replace: true });
    }
  }, [bank, navigate]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoadingBalance(true);
        const response = await apiClient.get('/account/balance', {
          params: { accountType },
        });
        const balance = extractData<BalanceResponse>(response);
        setAvailableBalance(Number(balance?.availableBalance ?? balance?.balance ?? 0));
      } catch (error) {
        console.error('获取可提现余额失败:', error);
        setAvailableBalance(0);
      } finally {
        setLoadingBalance(false);
      }
    };

    void fetchBalance();
  }, [accountType]);

  const error = useMemo(() => {
    if (!amount) return '';
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return '请输入有效的金额';
    if (numericAmount < minAmount) return '因银行监管需求，单次出金申请的最低金额为100USD，在您提交出金申请后，相应金额会从您账户余额中扣除。';
    if (numericAmount > availableBalance) return '超出可出金额上限';
    return '';
  }, [amount, availableBalance]);

  const isValid = Boolean(amount) && !error && Number(amount) > 0;
  const last4 = bank?.accountNumber?.slice(-4) || '0000';

  const handleNext = () => {
    if (!isValid || !bank) return;
    navigate('/withdraw/identity', {
      state: {
        bank,
        amount: Number(amount),
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">输入出金金额</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-32 pt-6">
        <div className="mb-8">
          <label className="mb-3 block text-[14px] text-[#8a8a93]">出金账户</label>
          <div className="flex items-center justify-between rounded-[16px] border border-white/5 bg-[#14141c] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Landmark size={20} className="text-[#6c48f5]" />
              </div>
              <div>
                <div className="text-[15px] font-medium text-white">{bank?.bankName || '银行卡'}</div>
                <div className="text-[12px] text-white/50">
                  {bank?.accountName || '账户'} | 尾号 {last4}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/withdraw')}
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-[#6c48f5] transition-colors hover:bg-[#6c48f5]/10"
            >
              更换
            </button>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-end justify-between gap-3">
            <label className="text-[14px] text-[#8a8a93]">出金金额 (USD)</label>
            <div className="text-right text-[13px] text-white/60">
              可出金余额:{' '}
              <span className="font-medium text-white">
                {loadingBalance ? '加载中' : `$${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>

          <div className={`relative overflow-hidden rounded-[16px] border bg-[#14141c] transition-colors ${error ? 'border-[#ef4444]' : 'border-white/10'}`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              <DollarSign size={24} />
            </div>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="h-[64px] w-full bg-transparent pl-12 pr-20 text-[28px] font-bold text-white outline-none placeholder:text-white/20"
            />
            <button
              onClick={() => setAmount(String(Math.floor(availableBalance)))}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#6c48f5] transition-colors hover:text-[#8c6bff]"
            >
              全部
            </button>
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: error ? 1 : 0, height: error ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-[#ef4444]">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent p-5 pt-10">
        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`flex h-[52px] w-full items-center justify-center rounded-[16px] text-[16px] font-medium transition-all ${
            isValid
              ? 'bg-[#6c48f5] text-white shadow-[0_4px_16px_rgba(108,72,245,0.3)] hover:bg-[#5a3be0]'
              : 'cursor-not-allowed bg-[#1a1a24] text-white/30'
          }`}
        >
          立即出金
        </button>
      </div>
    </div>
  );
}
