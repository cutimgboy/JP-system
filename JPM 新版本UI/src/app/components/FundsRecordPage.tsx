import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Download, Upload, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type RecordType = 'deposit' | 'withdrawal' | 'trade';
type StatusType = 'success' | 'pending' | 'failed' | 'settled';

interface FundRecord {
  id: string;
  type: RecordType;
  title: string;
  amount: string;
  time: string;
  status: StatusType;
  // Specific to trade
  direction?: 'up' | 'down';
  pnl?: string;
  asset?: string;
}

const mockRecords: FundRecord[] = [
  {
    id: 'TRD-10293',
    type: 'trade',
    title: 'BTC/USDT',
    asset: 'BTC/USDT',
    amount: '500.00', // Investment amount
    pnl: '+460.00',
    time: '2023-10-24 16:45:22',
    status: 'settled',
    direction: 'up',
  },
  {
    id: 'DEP-99231',
    type: 'deposit',
    title: '银行卡入金',
    amount: '+5,000.00',
    time: '2023-10-24 15:30:00',
    status: 'success',
  },
  {
    id: 'WIT-88123',
    type: 'withdrawal',
    title: '银行卡出金',
    amount: '-1,200.00',
    time: '2023-10-23 10:15:45',
    status: 'pending',
  },
  {
    id: 'TRD-10292',
    type: 'trade',
    title: 'ETH/USDT',
    asset: 'ETH/USDT',
    amount: '1000.00',
    pnl: '-1000.00',
    time: '2023-10-22 09:12:10',
    status: 'settled',
    direction: 'down',
  },
  {
    id: 'DEP-99230',
    type: 'deposit',
    title: '银行卡入金',
    amount: '+10,000.00',
    time: '2023-10-21 14:20:00',
    status: 'failed',
  }
];

export function FundsRecordPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'全部' | '入金' | '提现' | '交易'>('全部');

  const tabs = ['全部', '入金', '提现', '交易'];

  const filteredRecords = mockRecords.filter(record => {
    if (activeTab === '全部') return true;
    if (activeTab === '入金') return record.type === 'deposit';
    if (activeTab === '提现') return record.type === 'withdrawal';
    if (activeTab === '交易') return record.type === 'trade';
    return true;
  });

  const getStatusDisplay = (status: StatusType) => {
    switch (status) {
      case 'success':
        return <span className="flex items-center gap-1 text-[#10b981]"><CheckCircle2 size={12} /> 成功</span>;
      case 'pending':
        return <span className="flex items-center gap-1 text-[#f59e0b]"><Clock size={12} /> 处理中</span>;
      case 'failed':
        return <span className="flex items-center gap-1 text-[#ef4444]"><XCircle size={12} /> 失败</span>;
      case 'settled':
        return <span className="flex items-center gap-1 text-[#8a8a93]"><CheckCircle2 size={12} /> 已结算</span>;
      default:
        return null;
    }
  };

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
          资金记录
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 shrink-0 flex items-center gap-2 overflow-x-auto hide-scroll border-b border-white/5">
        <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 h-[32px] rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-[#6c48f5] text-white shadow-[0_2px_8px_rgba(108,72,245,0.3)]' 
                : 'bg-[#14141c] text-[#8a8a93] border border-white/5 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-[40px]">
        <AnimatePresence mode="popLayout">
          {filteredRecords.map((record) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                if (record.type === 'trade') {
                  navigate(`/order-detail/${record.id}`);
                } else {
                  navigate(`/transfer-detail/${record.id}`);
                }
              }}
              className={`p-4 rounded-[16px] bg-[#14141c] border border-white/5 flex items-center gap-3 relative overflow-hidden group cursor-pointer hover:bg-[#1a1a24] transition-colors`}
            >
              {/* Icon */}
              <div className={`w-[40px] h-[40px] shrink-0 rounded-full flex items-center justify-center ${
                record.type === 'deposit' ? 'bg-[#10b981]/10 text-[#10b981]' :
                record.type === 'withdrawal' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                record.direction === 'up' ? 'bg-[#10b981]/10 text-[#10b981]' :
                'bg-[#ef4444]/10 text-[#ef4444]'
              }`}>
                {record.type === 'deposit' && <Download size={20} />}
                {record.type === 'withdrawal' && <Upload size={20} />}
                {record.type === 'trade' && record.direction === 'up' && <TrendingUp size={20} />}
                {record.type === 'trade' && record.direction === 'down' && <TrendingDown size={20} />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[15px] font-medium text-white/90 truncate flex items-center gap-1.5">
                    {record.title}
                    {record.type === 'trade' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-[4px] font-medium ${
                        record.direction === 'up' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}>
                        买{record.direction === 'up' ? '涨' : '跌'}
                      </span>
                    )}
                  </span>
                  <span className={`text-[15px] font-bold font-mono ${
                    record.type === 'trade' 
                      ? (record.pnl?.startsWith('+') ? 'text-[#10b981]' : 'text-[#ef4444]')
                      : (record.amount.startsWith('+') ? 'text-[#10b981]' : 'text-white')
                  }`}>
                    {record.type === 'trade' ? record.pnl : record.amount}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[#8a8a93] text-[12px] font-mono">{record.time}</span>
                  <div className="text-[12px] flex items-center gap-2">
                    {getStatusDisplay(record.status)}
                    <ChevronRight size={14} className="text-[#8a8a93] opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRecords.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-[#8a8a93]">
            <Clock size={48} className="opacity-20 mb-4" />
            <p className="text-[14px]">暂无相关记录</p>
          </div>
        )}
      </div>
    </div>
  );
}