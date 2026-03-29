import express from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getMyNotifications);

router.route('/:id/read')
  .put(protect, markAsRead);

export default router;
