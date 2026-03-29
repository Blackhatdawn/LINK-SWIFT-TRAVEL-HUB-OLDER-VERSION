import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Transaction {
  _id?: string;
  id?: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  category: 'transfer' | 'bill' | 'ride' | 'stay' | 'express' | 'topup' | 'cashout' | 'miniapp';
  createdAt?: string;
  date?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  refreshWallet: () => Promise<void>;
  addFunds: (amount: number, source: string) => Promise<void>;
  transferFunds: (amount: number, recipient: string) => Promise<void>;
  payBill: (amount: number, biller: string, category: string) => Promise<void>;
  payForService: (amount: number, service: string, meta?: Record<string, unknown>) => Promise<boolean>;
  cashOut: (amount: number, destination: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();

  const refreshWallet = async () => {
    if (!user?.token) {
      setBalance(0);
      setTransactions([]);
      return;
    }

    const res = await fetch('/api/wallet', {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    const data = await res.json();
    if (data.success) {
      setBalance(data.data.balance || 0);
      setTransactions(data.data.transactions || []);
    }
  };

  useEffect(() => {
    void refreshWallet();
  }, [user?.token]);

  const addFunds = async (amount: number, source: string) => {
    const res = await fetch('/api/wallet/topup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ amount, source }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Top-up failed');
    await refreshWallet();
  };

  const transferFunds = async (amount: number, recipient: string) => {
    const res = await fetch('/api/wallet/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ amount, recipient }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Transfer failed');
    await refreshWallet();
  };

  const payBill = async (amount: number, biller: string, category: string) => {
    const res = await fetch('/api/wallet/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ amount, service: 'bill', title: `${category} - ${biller}` }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Bill payment failed');
    await refreshWallet();
  };

  const payForService = async (amount: number, service: string, meta?: Record<string, unknown>) => {
    const res = await fetch('/api/wallet/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ amount, service, metadata: meta }),
    });
    const data = await res.json();
    if (!data.success) return false;
    await refreshWallet();
    return true;
  };

  const cashOut = async (amount: number, destination: string) => {
    const res = await fetch('/api/wallet/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ amount, service: 'cashout', title: `Cash-out to ${destination}` }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Cash-out failed');
    await refreshWallet();
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        refreshWallet,
        addFunds,
        transferFunds,
        payBill,
        payForService,
        cashOut,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
