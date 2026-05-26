import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft, Landmark, DollarSign, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function WithdrawAmountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const bank = location.state?.bank || { name: '未知银行', last4: '0000', accountName: '未知' };
  
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const availableBalance = 15200.50; // Mock balance
  const minAmount = 100;

  useEffect(() => {
    if (!amount) {
      setError(null);
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      setError('请输入有效的金额');
      return;
    }
    
    if (numAmount > availableBalance) {
      setError('超出可出金额上限');
    } else if (numAmount < minAmount) {
      setError('因银行监管需求，单次出金申请的最低金额为100USD，在您提交出金申请后，相应金额会从您账户余额中扣除。');
    } else {
      setError(null);
    }
  }, [amount, availableBalance, minAmount]);

  const isValid = amount && !error && parseFloat(amount) > 0;

  const handleNext = () => {
    if (isValid) {
      navigate('/withdraw/identity');
    }
  };

  return (
    <div className="absolute inset-0 bg-[#09090b] flex flex-col text-white z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[60px] shrink-0 border-b border-white/5 relative z-10 bg-[#09090b]/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-medium text-white absolute left-1/2 -translate-x-1/2">
          输入出金金额
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[120px]">
        {/* Selected Bank Card */}
        <div className="mb-8">
          <label className="text-[14px] text-[#8a8a93] mb-3 block">出金账户</label>
          <div className="bg-[#14141c] rounded-[16px] p-4 flex items-center justify-between border border-white/5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Landmark size={20} className="text-[#6c48f5]" />
              </div>
              <div>
                <div className="text-[15px] font-medium text-white">{bank.name}</div>
                <div className="text-[12px] text-white/50">{bank.accountName} | 尾号 {bank.last4}</div>
              </div>
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="text-[#6c48f5] text-[13px] font-medium px-3 py-1.5 rounded-full hover:bg-[#6c48f5]/10 transition-colors"
            >
              更换
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="text-[14px] text-[#8a8a93]">出金金额 (USD)</label>
            <div className="text-[13px] text-white/60">
              可出金余额: <span className="text-white font-medium">${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          <div className={`relative bg-[#14141c] rounded-[16px] border ${error ? 'border-[#ef4444]' : 'border-white/10'} overflow-hidden transition-colors`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              <DollarSign size={24} />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-[64px] bg-transparent pl-12 pr-20 text-[28px] font-bold text-white placeholder:text-white/20 outline-none"
            />
            <button 
              onClick={() => setAmount(availableBalance.toString())}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6c48f5] text-[14px] font-medium hover:text-[#8c6bff] transition-colors"
            >
              全部
            </button>
          </div>
          
          {/* Error Message */}
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: error ? 1 : 0, height: error ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-1.5 mt-3 text-[#ef4444] text-[12px] leading-relaxed">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pt-10">
        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`w-full h-[52px] rounded-[16px] font-medium text-[16px] transition-all flex items-center justify-center ${
            isValid 
              ? 'bg-[#6c48f5] hover:bg-[#5a3be0] text-white shadow-[0_4px_16px_rgba(108,72,245,0.3)]' 
              : 'bg-[#1a1a24] text-white/30 cursor-not-allowed'
          }`}
        >
          立即出金
        </button>
      </div>
    </div>
  );
}
