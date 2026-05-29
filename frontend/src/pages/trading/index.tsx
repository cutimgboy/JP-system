import { useState } from 'react';
import { TradingDetail } from './TradingDetail';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
import { goBackOrNavigate } from '../../utils/navigation';

export default function TradingPage() {
  const [showDetail] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stockCode = searchParams.get('stock') || 'AAPL.US';
  const orderId = searchParams.get('orderId');
  const { accountType } = useAccount();

  return (
    <div className="min-h-screen bg-[#09090b]">
      {showDetail && <TradingDetail onBack={() => goBackOrNavigate(navigate, '/market')} initialStock={stockCode} initialOrderId={orderId} accountType={accountType} />}
      <BottomNav />
    </div>
  );
}
