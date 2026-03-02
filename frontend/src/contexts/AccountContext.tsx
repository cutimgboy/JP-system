import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AccountType = 'demo' | 'real';

interface AccountContextType {
  accountType: AccountType;
  setAccountType: (type: AccountType) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accountType, setAccountTypeState] = useState<AccountType>(() => {
    // 从 localStorage 读取保存的账户类型
    const saved = localStorage.getItem('accountType');
    return (saved === 'demo' || saved === 'real') ? saved : 'demo';
  });

  // 当账户类型改变时，保存到 localStorage
  const setAccountType = (type: AccountType) => {
    setAccountTypeState(type);
    localStorage.setItem('accountType', type);
  };

  return (
    <AccountContext.Provider value={{ accountType, setAccountType }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
