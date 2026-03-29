import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createMiniAppOrder, getMyMiniAppOrders } from '../controllers/miniAppController';
import { blockHighRiskRequests } from '../middleware/riskMiddleware';

const router = express.Router();

router.post('/orders', protect, blockHighRiskRequests, createMiniAppOrder);
router.get('/orders/my', protect, getMyMiniAppOrders);

export default router;
