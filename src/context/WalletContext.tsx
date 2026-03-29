import React, { createContext, useContext, useState, useEffect } from 'react';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  category: 'transfer' | 'bill' | 'ride' | 'stay' | 'express' | 'topup' | 'cashout';
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  addFunds: (amount: number, source: string) => Promise<void>;
  transferFunds: (amount: number, recipient: string) => Promise<void>;
  payBill: (amount: number, biller: string, category: string) => Promise<void>;
  payForService: (amount: number, service: string) => Promise<boolean>;
  cashOut: (amount: number, destination: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with some mock data for demonstration
  const [balance, setBalance] = useState<number>(150000);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-1',
      title: 'Ride to Airport',
      amount: 30000,
      type: 'debit',
      category: 'ride',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: 'tx-2',
      title: 'Wallet Top-up',
      amount: 100000,
      type: 'credit',
      category: 'topup',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: 'tx-3',
      title: 'Electricity Bill (IKEDC)',
      amount: 15000,
      type: 'debit',
      category: 'bill',
      date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ]);

  const addTransaction = (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'completed'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const addFunds = async (amount: number, source: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setBalance(prev => prev + amount);
    addTransaction({
      title: `Top-up via ${source}`,
      amount,
      type: 'credit',
      category: 'topup'
    });
  };

  const transferFunds = async (amount: number, recipient: string) => {
    if (balance < amount) throw new Error('Insufficient funds');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setBalance(prev => prev - amount);
    addTransaction({
      title: `Transfer to ${recipient}`,
      amount,
      type: 'debit',
      category: 'transfer'
    });
  };

  const payBill = async (amount: number, biller: string, category: string) => {
    if (balance < amount) throw new Error('Insufficient funds');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setBalance(prev => prev - amount);
    addTransaction({
      title: `${category} - ${biller}`,
      amount,
      type: 'debit',
      category: 'bill'
    });
  };

  const payForService = async (amount: number, service: string) => {
    if (balance < amount) return false;
    await new Promise(resolve => setTimeout(resolve, 500));
    setBalance(prev => prev - amount);
    addTransaction({
      title: `Payment for ${service}`,
      amount,
      type: 'debit',
      category: service as any
    });
    return true;
  };

  const cashOut = async (amount: number, destination: string) => {
    if (balance < amount) throw new Error('Insufficient funds');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setBalance(prev => prev - amount);
    addTransaction({
      title: `Cash-out to ${destination}`,
      amount,
      type: 'debit',
      category: 'cashout'
    });
  };

  return (
    <WalletContext.Provider value={{
      balance,
      transactions,
      addFunds,
      transferFunds,
      payBill,
      payForService,
      cashOut
    }}>
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
