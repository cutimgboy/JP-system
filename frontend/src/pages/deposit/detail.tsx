import { useEffect, useState } from 'react';
import { Check, CheckCircle2, ChevronLeft, Clock, Landmark, ShieldCheck, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient, extractData } from '../../utils/api';

interface DepositDetail {
  id: number;
  userId: number;
  amount: number;
  userBankName: string;
  userAccountName: string;
  userAccountNumber: string;
  systemBankName: string;
  systemAccountName: string;
  systemAccountNumber: string;
  receiptImages: string | null;
  status: number;
  remark: string | null;
  createTime: string;
  reviewTime: string | null;
}

export function DepositDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [deposit, setDeposit] = useState<DepositDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const depositId = location.state?.depositId;

  useEffect(() => {
    if (!depositId) {
      navigate('/deposit');
      return;
    }
    void fetchDepositDetail();
  }, [depositId, navigate]);

  const fetchDepositDetail = async () => {
    try {
      const response = await apiClient.get(`/deposit/${depositId}`);
      const depositData = extractData<DepositDetail>(response);
      if (depositData) {
        setDeposit(depositData);
      }
    } catch (error) {
      console.error('获取入金详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '——';
    return new Date(dateString)
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/\//g, '-');
  };

  const handleCopy = () => {
    const orderNo = getOrderNumber(deposit?.id);
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(orderNo);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="text-[#8a8a93]">加载中...</div>
      </div>
    );
  }

  if (!deposit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 text-center">
        <div className="text-[#8a8a93]">未找到入金记录</div>
      </div>
    );
  }

  const status = getStatus(deposit.status);
  const steps = getTimelineSteps(deposit, formatDate);
  const orderNumber = getOrderNumber(deposit.id);
  const bankLabel = `${deposit.userBankName || deposit.systemBankName || '银行卡'}${
    deposit.userAccountNumber ? ` (${deposit.userAccountNumber.slice(-4)})` : ''
  }`;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/80 px-4 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">入金详情</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-[100px] pt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 flex flex-col items-center justify-center"
        >
          <div className="mb-2 text-[14px] text-[#8a8a93]">入金金额 (VND)</div>
          <div className="font-mono text-[42px] font-bold tracking-tight text-[#10b981]">
            +{Number(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center justify-center">
            <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-medium ${status.badge}`}>
              <status.icon size={14} />
              {status.label}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5 rounded-[24px] border border-white/5 bg-[#14141c] p-6 shadow-sm"
        >
          <h3 className="mb-6 text-[15px] font-bold">资金流转状态</h3>
          <div className="ml-1">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
                {index !== steps.length - 1 && (
                  <div className={`absolute bottom-0 left-[11px] top-6 w-[2px] ${
                    step.status === 'completed' ? 'bg-[#6c48f5]' : 'bg-white/10'
                  }`}
                  />
                )}

                <div className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] ${step.color}`}>
                  {step.icon}
                </div>

                <div className="-mt-0.5 flex-1">
                  <div className={`mb-1 text-[15px] font-medium ${step.status === 'pending' ? 'text-white/50' : 'text-white'}`}>
                    {step.title}
                  </div>
                  <div className={`text-[13px] leading-snug ${step.status === 'failed' ? 'text-[#ef4444]' : 'text-[#8a8a93]'}`}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-5 rounded-[24px] border border-white/5 bg-[#14141c] p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 text-[14px] text-[#8a8a93]">订单编号</span>
            <div className="flex min-w-0 items-center gap-2">
              <span className="min-w-0 truncate font-mono text-[14px]">{orderNumber}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded p-1 text-[#6c48f5] transition-colors hover:bg-[#6c48f5]/10"
              >
                {copied ? <Check size={14} /> : <span className="text-[12px] font-medium">复制</span>}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[14px] text-[#8a8a93]">交易方式</span>
            <span className="text-[14px]">银行卡转账</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 text-[14px] text-[#8a8a93]">入金账户</span>
            <div className="flex min-w-0 items-center gap-1.5">
              <Landmark size={14} className="shrink-0 text-[#8a8a93]" />
              <span className="min-w-0 truncate text-[14px]">{bankLabel}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 text-[14px] text-[#8a8a93]">发起时间</span>
            <span className="font-mono text-[14px]">{formatDate(deposit.createTime)}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-start gap-2 rounded-[16px] border border-[#6c48f5]/10 bg-[#6c48f5]/5 p-4"
        >
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#6c48f5]" />
          <p className="text-[12px] leading-relaxed text-[#8a8a93]">
            若您的资金流转状态异常或长时间未到账，请及时联系在线客服。您的资金受严格的银行存管协议保护。
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function getStatus(status: number) {
  if (status === 1) {
    return {
      label: '交易成功',
      icon: CheckCircle2,
      badge: 'border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]',
    };
  }

  if (status === 2) {
    return {
      label: '交易失败',
      icon: XCircle,
      badge: 'border-[#ef4444]/20 bg-[#ef4444]/10 text-[#ef4444]',
    };
  }

  return {
    label: '处理中',
    icon: Clock,
    badge: 'border-[#f59e0b]/20 bg-[#f59e0b]/10 text-[#f59e0b]',
  };
}

function getOrderNumber(id?: number) {
  if (!id) return 'DEP-00000';
  return `DEP-${String(id).padStart(5, '0')}`;
}

function getTimelineSteps(deposit: DepositDetail, formatDate: (dateString?: string | null) => string) {
  const steps = [
    {
      title: '提交申请',
      desc: formatDate(deposit.createTime),
      icon: <Check size={14} />,
      status: 'completed',
      color: 'border-[#6c48f5] bg-[#6c48f5] text-white',
    },
  ];

  if (deposit.status === 1) {
    steps.push(
      {
        title: '系统处理中',
        desc: deposit.reviewTime ? formatDate(deposit.reviewTime) : '处理完成',
        icon: <Check size={14} />,
        status: 'completed',
        color: 'border-[#6c48f5] bg-[#6c48f5] text-white',
      },
      {
        title: '入金成功',
        desc: '资金已到账',
        icon: <CheckCircle2 size={14} />,
        status: 'completed',
        color: 'border-[#10b981] bg-[#10b981] text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]',
      },
    );
  } else if (deposit.status === 2) {
    steps.push(
      {
        title: '系统处理中',
        desc: deposit.reviewTime ? formatDate(deposit.reviewTime) : '处理失败',
        icon: <Check size={14} />,
        status: 'completed',
        color: 'border-[#6c48f5] bg-[#6c48f5] text-white',
      },
      {
        title: '入金失败',
        desc: deposit.remark || '审核未通过，请联系在线客服',
        icon: <XCircle size={14} />,
        status: 'failed',
        color: 'border-[#ef4444] bg-[#ef4444] text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]',
      },
    );
  } else {
    steps.push(
      {
        title: '系统处理中',
        desc: '预计将在 2 小时内处理完成',
        icon: <Clock size={14} />,
        status: 'active',
        color: 'border-[#f59e0b] bg-[#f59e0b] text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]',
      },
      {
        title: '预计到账',
        desc: '等待银行响应',
        icon: <div className="h-2 w-2 rounded-full bg-[#8a8a93]" />,
        status: 'pending',
        color: 'border-white/20 bg-[#14141c] text-[#8a8a93]',
      },
    );
  }

  return steps;
}
