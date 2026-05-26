import { useNavigate, useParams } from 'react-router';
import { ChevronLeft, CheckCircle2, Clock, XCircle, ShieldCheck, Landmark, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

// Mock DB fetch based on ID
const getMockData = (id: string | undefined) => {
  if (id === 'DEP-99230') {
    return {
      type: 'deposit',
      title: '入金详情',
      amount: '10,000.00',
      status: 'failed',
      time: '2023-10-21 14:20:00',
      bank: '招商银行 (8888)',
      reason: '实名认证信息不匹配，已被系统驳回'
    };
  }
  if (id === 'WIT-88123') {
    return {
      type: 'withdrawal',
      title: '提现详情',
      amount: '1,200.00',
      status: 'pending',
      time: '2023-10-23 10:15:45',
      bank: '建设银行 (6666)',
      reason: ''
    };
  }
  // Default success deposit
  return {
    type: 'deposit',
    title: '入金详情',
    amount: '5,000.00',
    status: 'success',
    time: '2023-10-24 15:30:00',
    bank: '招商银行 (8888)',
    reason: ''
  };
};

export function TransferDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const data = getMockData(id);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDeposit = data.type === 'deposit';
  const amountColor = isDeposit ? 'text-[#10b981]' : 'text-white';
  const amountPrefix = isDeposit ? '+' : '-';

  // Build timeline steps based on status
  const steps = [
    {
      title: '提交申请',
      desc: data.time,
      icon: <Check size={14} />,
      status: 'completed',
      color: 'bg-[#6c48f5] text-white border-[#6c48f5]'
    }
  ];

  if (data.status === 'success') {
    steps.push({
      title: '系统处理中',
      desc: '处理完成',
      icon: <Check size={14} />,
      status: 'completed',
      color: 'bg-[#6c48f5] text-white border-[#6c48f5]'
    });
    steps.push({
      title: isDeposit ? '入金成功' : '提现成功',
      desc: '资金已到账',
      icon: <CheckCircle2 size={14} />,
      status: 'completed',
      color: 'bg-[#10b981] text-white border-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.4)]'
    });
  } else if (data.status === 'pending') {
    steps.push({
      title: '系统处理中',
      desc: '预计将在 2 小时内处理完成',
      icon: <Clock size={14} />,
      status: 'active',
      color: 'bg-[#f59e0b] text-white border-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.4)]'
    });
    steps.push({
      title: '预计到账',
      desc: '等待银行响应',
      icon: <div className="w-2 h-2 rounded-full bg-[#8a8a93]" />,
      status: 'pending',
      color: 'bg-[#14141c] text-[#8a8a93] border-white/20'
    });
  } else {
    // Failed
    steps.push({
      title: '系统处理中',
      desc: '处理失败',
      icon: <Check size={14} />,
      status: 'completed',
      color: 'bg-[#6c48f5] text-white border-[#6c48f5]'
    });
    steps.push({
      title: isDeposit ? '入金失败' : '提现失败',
      desc: data.reason,
      icon: <XCircle size={14} />,
      status: 'failed',
      color: 'bg-[#ef4444] text-white border-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.4)]'
    });
  }

  return (
    <div className="absolute inset-0 bg-[#09090b] flex flex-col overflow-hidden text-white z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[60px] shrink-0 border-b border-white/5 relative z-10 bg-[#09090b]/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-medium text-white absolute left-1/2 -translate-x-1/2">
          {data.title}
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[100px] px-5 pt-6">
        
        {/* Top Amount Display */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center mb-8"
        >
          <div className="text-[#8a8a93] text-[14px] mb-2">{isDeposit ? '入金金额 (VND)' : '提现金额 (VND)'}</div>
          <div className={`text-[42px] font-bold font-mono tracking-tight ${amountColor}`}>
            {amountPrefix}{data.amount}
          </div>
          <div className="mt-3 flex items-center justify-center">
            {data.status === 'success' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] text-[13px] font-medium border border-[#10b981]/20">
                <CheckCircle2 size={14} /> 交易成功
              </span>
            )}
            {data.status === 'pending' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-[13px] font-medium border border-[#f59e0b]/20">
                <Clock size={14} /> 处理中
              </span>
            )}
            {data.status === 'failed' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ef4444]/10 text-[#ef4444] text-[13px] font-medium border border-[#ef4444]/20">
                <XCircle size={14} /> 交易失败
              </span>
            )}
          </div>
        </motion.div>

        {/* Status Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#14141c] rounded-[24px] p-6 border border-white/5 shadow-sm mb-5"
        >
          <h3 className="text-[15px] font-bold mb-6">资金流转状态</h3>
          <div className="ml-1">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Connecting Line */}
                {idx !== steps.length - 1 && (
                  <div className={`absolute left-[11px] top-6 bottom-0 w-[2px] ${
                    step.status === 'completed' ? 'bg-[#6c48f5]' : 'bg-white/10'
                  }`} />
                )}
                
                {/* Icon Indicator */}
                <div className={`relative z-10 w-6 h-6 shrink-0 rounded-full border-[1.5px] flex items-center justify-center mt-0.5 ${step.color}`}>
                  {step.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 -mt-0.5">
                  <div className={`text-[15px] font-medium mb-1 ${
                    step.status === 'pending' ? 'text-white/50' : 'text-white'
                  }`}>
                    {step.title}
                  </div>
                  <div className={`text-[13px] ${
                    step.status === 'failed' ? 'text-[#ef4444]' : 'text-[#8a8a93]'
                  } leading-snug`}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Details List */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#14141c] rounded-[24px] p-5 border border-white/5 shadow-sm space-y-5"
        >
          <div className="flex justify-between items-center">
            <span className="text-[#8a8a93] text-[14px]">订单编号</span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-mono">{id}</span>
              <button onClick={handleCopy} className="text-[#6c48f5] p-1 hover:bg-[#6c48f5]/10 rounded transition-colors">
                {copied ? <Check size={14} /> : <span className="text-[12px] font-medium">复制</span>}
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[#8a8a93] text-[14px]">交易方式</span>
            <span className="text-[14px]">银行卡转账</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[#8a8a93] text-[14px]">{isDeposit ? '入金账户' : '提现账户'}</span>
            <div className="flex items-center gap-1.5">
              <Landmark size={14} className="text-[#8a8a93]" />
              <span className="text-[14px]">{data.bank}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[#8a8a93] text-[14px]">发起时间</span>
            <span className="text-[14px] font-mono">{data.time}</span>
          </div>
        </motion.div>

        {/* Security Prompt */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-start gap-2 p-4 bg-[#6c48f5]/5 rounded-[16px] border border-[#6c48f5]/10"
        >
          <ShieldCheck size={16} className="text-[#6c48f5] mt-0.5 shrink-0" />
          <p className="text-[#8a8a93] text-[12px] leading-relaxed">
            若您的资金流转状态异常或长时间未到账，请及时联系在线客服。您的资金受严格的银行存管协议保护。
          </p>
        </motion.div>

      </div>
    </div>
  );
}