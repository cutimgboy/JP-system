import { useNavigate } from 'react-router-dom';
import { useAccount } from '../contexts/AccountContext';
import { AccountSelector } from './AccountSelector';
import { DepositButton } from './DepositButton';

interface PageHeaderProps {
  accountType?: 'demo' | 'real';
  onAccountSwitch?: (type: 'demo' | 'real') => void;
  className?: string;
}

export function PageHeader({
  accountType: accountTypeProp,
  onAccountSwitch,
  className = 'pt-6 pb-4',
}: PageHeaderProps = {}) {
  const navigate = useNavigate();
  const { accountType, setAccountType } = useAccount();
  const resolvedAccountType = accountTypeProp ?? accountType;
  const handleAccountSwitch = onAccountSwitch ?? setAccountType;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c] flex items-center justify-between px-6 ${className}`}>
      <AccountSelector
        accountType={resolvedAccountType}
        onAccountSwitch={handleAccountSwitch}
      />
      <DepositButton onClick={() => navigate('/deposit')} />
    </div>
  );
}
