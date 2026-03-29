import { Request, Response } from 'express';
import WalletAccount from '../models/WalletAccount';
import WalletTransaction from '../models/WalletTransaction';
import crypto from 'crypto';

const ensureWallet = async (userId: string) => {
  let wallet = await WalletAccount.findOne({ user: userId });
  if (!wallet) {
    wallet = await WalletAccount.create({ user: userId, balance: 0 });
  }
  return wallet;
};

const createTx = async (userId: string, walletId: string, payload: any) => {
  return WalletTransaction.create({
    user: userId,
    wallet: walletId,
    reference: payload.reference || `LS-WALLET-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
    ...payload,
  });
};

export const getWalletSummary = async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const wallet = await ensureWallet(userId);
  const transactions = await WalletTransaction.find({ user: userId }).sort('-createdAt').limit(30);

  res.status(200).json({
    success: true,
    data: {
      balance: wallet.balance,
      currency: wallet.currency,
      transactions,
    },
  });
};

export const addFunds = async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const { amount, source } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
  }

  const wallet = await ensureWallet(userId);
  wallet.balance += Number(amount);
  await wallet.save();

  const tx = await createTx(userId, wallet._id.toString(), {
    amount: Number(amount),
    type: 'credit',
    category: 'topup',
    title: `Top-up via ${source || 'Bank Transfer'}`,
    status: 'completed',
  });

  res.status(200).json({ success: true, data: { balance: wallet.balance, transaction: tx } });
};

export const transferFunds = async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const { amount, recipient } = req.body;

  if (!amount || Number(amount) <= 0 || !recipient) {
    return res.status(400).json({ success: false, message: 'Amount and recipient are required' });
  }

  const updatedWallet = await WalletAccount.findOneAndUpdate(
    { user: userId, balance: { $gte: Number(amount) } },
    { $inc: { balance: -Number(amount) } },
    { new: true }
  );

  if (!updatedWallet) {
    return res.status(400).json({ success: false, message: 'Insufficient funds' });
  }

  const tx = await createTx(userId, updatedWallet._id.toString(), {
    amount: Number(amount),
    type: 'debit',
    category: 'transfer',
    title: `Transfer to ${recipient}`,
    status: 'completed',
    metadata: { recipient },
  });

  res.status(200).json({ success: true, data: { balance: updatedWallet.balance, transaction: tx } });
};

export const payForService = async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const { amount, service, title, reference, metadata } = req.body;
  if (!amount || Number(amount) <= 0 || !service) {
    return res.status(400).json({ success: false, message: 'amount and service are required' });
  }

  const categoryMap = new Set(['ride', 'stay', 'express', 'bill', 'cashout', 'miniapp']);
  const normalizedService = String(service);
  const category = normalizedService.startsWith('miniapp') ? 'miniapp' : (categoryMap.has(normalizedService) ? normalizedService : 'bill');

  const updatedWallet = await WalletAccount.findOneAndUpdate(
    { user: userId, balance: { $gte: Number(amount) } },
    { $inc: { balance: -Number(amount) } },
    { new: true }
  );

  if (!updatedWallet) {
    return res.status(400).json({ success: false, message: 'Insufficient funds' });
  }

  const tx = await createTx(userId, updatedWallet._id.toString(), {
    amount: Number(amount),
    type: 'debit',
    category,
    title: title || `Payment for ${service}`,
    status: 'completed',
    reference,
    metadata,
  });

  res.status(200).json({ success: true, data: { balance: updatedWallet.balance, transaction: tx } });
};
