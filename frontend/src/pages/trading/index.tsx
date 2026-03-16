import { useState } from 'react';
import { TradingDetail } from './TradingDetail';
import { BottomNav } from '../../components/BottomNav';
import { useSearchParams } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';

export default function TradingPage() {
  const [showDetail] = useState(true);
  const [searchParams] = useSearchParams();
  const stockCode = searchParams.get('stock') || 'AAPL.US';
  const orderId = searchParams.get('orderId');
  const { accountType } = useAccount();

  return (
    <div className="min-h-screen bg-[#09090b]">
      {showDetail && <TradingDetail onBack={() => window.history.back()} initialStock={stockCode} initialOrderId={orderId} accountType={accountType} />}
      <BottomNav />
    </div>
  );
}
