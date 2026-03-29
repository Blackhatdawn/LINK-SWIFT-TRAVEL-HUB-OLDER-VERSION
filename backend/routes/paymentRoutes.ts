import express from 'express';
import { handlePaystackWebhook } from '../controllers/paymentController';

const router = express.Router();

router.post('/paystack/webhook', handlePaystackWebhook);

export default router;
