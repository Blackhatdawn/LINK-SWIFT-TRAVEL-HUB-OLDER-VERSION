import { Request, Response } from 'express';
import crypto from 'crypto';
import ExpressOrder from '../models/ExpressOrder';

const calculateExpressPrice = (packageType: string, weight: string) => {
  let basePrice = 3500;
  if (packageType === 'large') basePrice += 2000;
  if (weight === '5-15kg') basePrice += 1500;
  if (weight === '15kg+') basePrice += 3000;
  return basePrice;
};

export const getQuote = async (req: Request, res: Response) => {
  const { pickup, dropoff, packageType = 'document', weight = '0-5kg' } = req.body;
  if (!pickup || !dropoff) {
    return res.status(400).json({ success: false, message: 'pickup and dropoff are required' });
  }
  const price = calculateExpressPrice(packageType, weight);
  return res.status(200).json({ success: true, data: { price, etaMinutes: 45 } });
};

export const createExpressOrder = async (req: Request, res: Response) => {
  const { pickup, dropoff, packageType, weight, instructions, price } = req.body;
  if (!pickup || !dropoff || !packageType || !weight || !price) {
    return res.status(400).json({ success: false, message: 'pickup, dropoff, packageType, weight and price are required' });
  }

  const order = await ExpressOrder.create({
    user: req.user?._id,
    pickup,
    dropoff,
    packageType,
    weight,
    instructions,
    price,
    reference: `LS-EXP-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
    status: 'pending',
  });

  return res.status(201).json({ success: true, data: order });
};

export const getMyExpressOrders = async (req: Request, res: Response) => {
  const orders = await ExpressOrder.find({ user: req.user?._id }).sort('-createdAt').limit(50);
  return res.status(200).json({ success: true, data: orders });
};
