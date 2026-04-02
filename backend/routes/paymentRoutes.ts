import express from 'express';
import { getPaymentStatus, handleIvoryPayWebhook } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/ivorypay/webhook', handleIvoryPayWebhook);
router.get('/status/:reference', protect, getPaymentStatus);

export default router;
