import express from 'express';
import { getPaymentStatus, handlePaystackWebhook } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/paystack/webhook', handlePaystackWebhook);
router.get('/status/:reference', protect, getPaymentStatus);

export default router;
