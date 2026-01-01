// Global Account State Management
import React, { createContext, useState, useEffect, useContext } from 'react';
import { accountAPI } from '../api/accountAPI';
import { useAuth } from './AuthContext';

const AccountContext = createContext();

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccountContext must be used within AccountProvider');
  }
  return context;
};

export const AccountProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [netWorth, setNetWorth] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    }
  }, [isAuthenticated]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountAPI.getAll();
      setAccounts(response.data);
      calculateTotals(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (accountList) => {
    let assets = 0;
    let liabilities = 0;

    accountList.forEach(account => {
      if (!account.includeInTotal || !account.isActive) return;

      if (account.type === 'ASSET') {
        assets += account.balance;
      } else if (account.type === 'LIABILITY') {
        liabilities += account.balance;
      }
    });

    setTotalAssets(assets);
    setTotalLiabilities(liabilities);
    setNetWorth(assets - liabilities);
  };

  const refreshAccounts = () => {
    fetchAccounts();
  };

  const getAccountById = (id) => {
    return accounts.find(acc => acc._id === id);
  };

  const getAccountsByType = (type) => {
    return accounts.filter(acc => acc.type === type && acc.isActive);
  };

  const value = {
    accounts,
    loading,
    totalAssets,
    totalLiabilities,
    netWorth,
    refreshAccounts,
    getAccountById,
    getAccountsByType
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};
export default AccountProvider;