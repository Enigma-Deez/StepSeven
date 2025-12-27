// Multi-Currency Support
// ============================================================

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState({
    code: 'NGN',
    symbol: '₦',
    subunitName: 'kobo',
    subunitToUnit: 100
  });

  useEffect(() => {
    if (user && user.currency) {
      setCurrency(user.currency);
    }
  }, [user]);

  const formatMoney = (amountInSubunits) => {
    const amount = amountInSubunits / currency.subunitToUnit;
    return `${currency.symbol}${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const toSubunits = (amount) => {
    return Math.round(amount * currency.subunitToUnit);
  };

  const fromSubunits = (amount) => {
    return amount / currency.subunitToUnit;
  };

  const value = {
    currency,
    formatMoney,
    toSubunits,
    fromSubunits
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export default CurrencyProvider;