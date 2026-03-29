import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createExpressOrder, getMyExpressOrders, getQuote } from '../controllers/expressController';
import { blockHighRiskRequests } from '../middleware/riskMiddleware';

const router = express.Router();

router.post('/quote', protect, getQuote);
router.post('/orders', protect, blockHighRiskRequests, createExpressOrder);
router.get('/orders/my', protect, getMyExpressOrders);

export default router;
