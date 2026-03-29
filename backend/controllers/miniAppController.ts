import { Request, Response } from 'express';
import crypto from 'crypto';
import MiniAppOrder from '../models/MiniAppOrder';

export const createMiniAppOrder = async (req: Request, res: Response) => {
  const { appId, appName, items, total } = req.body;
  if (!appId || !appName || !Array.isArray(items) || !items.length || !total) {
    return res.status(400).json({ success: false, message: 'appId, appName, items and total are required' });
  }

  const order = await MiniAppOrder.create({
    user: req.user?._id,
    appId,
    appName,
    items,
    total,
    reference: `LS-MINI-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
    status: 'processing',
  });

  return res.status(201).json({ success: true, data: order });
};

export const getMyMiniAppOrders = async (req: Request, res: Response) => {
  const orders = await MiniAppOrder.find({ user: req.user?._id }).sort('-createdAt').limit(50);
  return res.status(200).json({ success: true, data: orders });
};
