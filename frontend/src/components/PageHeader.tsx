import { useNavigate } from 'react-router-dom';
import { useAccount } from '../contexts/AccountContext';
import { AccountSelector } from './AccountSelector';
import { DepositButton } from './DepositButton';

export function PageHeader() {
  const navigate = useNavigate();
  const { accountType, setAccountType } = useAccount();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c] flex items-center justify-between px-6 pt-12 pb-6">
      <AccountSelector
        accountType={accountType}
        onAccountSwitch={setAccountType}
      />
      <DepositButton onClick={() => navigate('/deposit')} />
    </div>
  );
}
