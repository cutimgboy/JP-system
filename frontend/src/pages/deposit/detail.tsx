import { useEffect, useState } from 'react';
import { ChevronLeft, Clock3, XCircle, CheckCircle2 } from 'lucide-react';
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
    return new Date(dateString).toLocaleString('zh-CN');
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
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">入金详情</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-10 pt-8">
        <div className="relative mb-5 overflow-hidden rounded-[28px] border border-white/10 bg-[#14141c] p-6 text-center shadow-[0_20px_48px_rgba(0,0,0,0.35)]">
          <div className={`pointer-events-none absolute left-1/2 top-0 h-28 w-44 -translate-x-1/2 rounded-full ${status.glow} blur-[36px]`} />
          <div className={`relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${status.bg}`}>
            <StatusIcon size={30} className={status.text} />
          </div>
          <p className="relative text-[13px] text-[#8a8a93]">通知存入金额</p>
          <div className="relative mt-2 font-mono text-[30px] font-bold tracking-tight text-white">
            {Number(deposit.amount).toLocaleString()} VND
          </div>
          <div className={`relative mx-auto mt-4 inline-flex rounded-full border px-3 py-1 text-[13px] ${status.badge}`}>
            {status.label}
          </div>
        </div>

        {deposit.status === 2 && deposit.remark ? (
          <div className="mb-5 rounded-[18px] border border-[#ef4444]/20 bg-[#ef4444]/10 p-4 text-[13px] leading-6 text-[#fca5a5]">
            拒绝原因：{deposit.remark}
          </div>
        ) : null}

        <div className="rounded-[22px] border border-white/5 bg-[#14141c] px-4 py-2">
          <DetailRow label="提交时间" value={formatDate(deposit.createTime)} />
          <DetailRow label="汇款银行" value={deposit.userBankName} />
          <DetailRow label="汇款户名" value={deposit.userAccountName} />
          <DetailRow label="收款银行" value={deposit.systemBankName} />
          <DetailRow label="到账金额" value={deposit.status === 1 ? `${Number(deposit.amount).toLocaleString()} VND` : '——'} />
          <DetailRow label="到账时间" value={deposit.status === 1 ? formatDate(deposit.reviewTime) : '——'} noBorder />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, noBorder = false }: { label: string; value: string; noBorder?: boolean }) {
  return (
    <div className={`-mx-4 flex items-center justify-between gap-4 px-4 py-4 ${noBorder ? '' : 'border-b border-white/5'}`}>
      <span className="shrink-0 text-[14px] text-[#8a8a93]">{label}</span>
      <span className="min-w-0 truncate text-right text-[14px] text-white">{value}</span>
    </div>
  );
}

function getStatus(status: number) {
  if (status === 1) {
    return {
      label: '已到账',
      icon: CheckCircle2,
      bg: 'bg-[#10b981]/10',
      text: 'text-[#10b981]',
      glow: 'bg-[#10b981]/20',
      badge: 'border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]',
    };
  }

  if (status === 2) {
    return {
      label: '已拒绝',
      icon: XCircle,
      bg: 'bg-[#ef4444]/10',
      text: 'text-[#ef4444]',
      glow: 'bg-[#ef4444]/20',
      badge: 'border-[#ef4444]/20 bg-[#ef4444]/10 text-[#fca5a5]',
    };
  }

  return {
    label: '审核中',
    icon: Clock3,
    bg: 'bg-[#f59e0b]/10',
    text: 'text-[#fbbf24]',
    glow: 'bg-[#f59e0b]/20',
    badge: 'border-[#f59e0b]/20 bg-[#f59e0b]/10 text-[#fbbf24]',
  };
}
