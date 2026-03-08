import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, extractData } from '../utils/api';

type AccountType = 'demo' | 'real';

interface Account {
  id: number;
  accountType: AccountType;
  balance: number;
  frozenBalance: number;
}

interface AccountContextType {
  accountType: AccountType;
  accountId: number | null;
  currentAccount: Account | null;
  setAccountType: (type: AccountType) => void;
  refreshAccount: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accountType, setAccountTypeState] = useState<AccountType>(() => {
    // 从 localStorage 读取保存的账户类型
    const saved = localStorage.getItem('accountType');
    return (saved === 'demo' || saved === 'real') ? saved : 'demo';
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);

  // 获取用户的所有账户
  const fetchAccounts = async () => {
    try {
      const response = await apiClient.get('/account/list');

      // 使用 extractData 自动处理数据格式
      let accountList = extractData(response) || [];

      // 确保 accountList 是数组
      if (!Array.isArray(accountList)) {
        console.warn('账户列表不是数组,使用空数组');
        accountList = [];
      }

      setAccounts(accountList);

      // 根据当前选择的账户类型，设置当前账户
      if (accountList.length > 0) {
        const account = accountList.find((acc: Account) => acc.accountType === accountType);
        setCurrentAccount(account || null);
      } else {
        setCurrentAccount(null);
      }
    } catch (error) {
      console.error('获取账户列表失败:', error);
      setAccounts([]);
      setCurrentAccount(null);
    }
  };

  // 刷新当前账户信息
  const refreshAccount = async () => {
    await fetchAccounts();
  };

  // 初始化时获取账户列表
  useEffect(() => {
    fetchAccounts();
  }, []);

  // 当账户类型改变时，更新当前账户
  useEffect(() => {
    const account = accounts.find(acc => acc.accountType === accountType);
    setCurrentAccount(account || null);
  }, [accountType, accounts]);

  // 当账户类型改变时，保存到 localStorage
  const setAccountType = (type: AccountType) => {
    setAccountTypeState(type);
    localStorage.setItem('accountType', type);
  };

  return (
    <AccountContext.Provider value={{
      accountType,
      accountId: currentAccount?.id || null,
      currentAccount,
      setAccountType,
      refreshAccount
    }}>
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
