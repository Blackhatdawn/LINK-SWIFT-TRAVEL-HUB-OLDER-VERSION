import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { addFunds, getWalletSummary, payForService, transferFunds } from '../controllers/walletController';

const router = express.Router();

router.get('/', protect, getWalletSummary);
router.post('/topup', protect, addFunds);
router.post('/transfer', protect, transferFunds);
router.post('/pay', protect, payForService);

export default router;
