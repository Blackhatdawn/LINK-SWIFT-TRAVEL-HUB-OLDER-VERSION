import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  createStayBooking,
  getMyStays,
  getMyProperties,
  updateAvailability
} from '../controllers/stayController';
import { protect, authorize } from '../middleware/authMiddleware';
import { nigeriaOnly } from '../middleware/locationMiddleware';

const router = express.Router();

// ==========================================
// Public Routes (with Nigeria Restriction)
// ==========================================
router.route('/')
  .get(nigeriaOnly, getAllProperties);

router.route('/:id')
  .get(getPropertyById);

// ==========================================
// Protected Routes (Guests)
// ==========================================
router.route('/book')
  .post(protect, createStayBooking);

router.route('/my-stays')
  .get(protect, getMyStays);

// ==========================================
// Protected Routes (Hosts & Admins)
// ==========================================
router.route('/host/properties')
  .get(protect, authorize('host', 'admin'), getMyProperties);

router.route('/host/properties/:id/availability')
  .put(protect, authorize('host', 'admin'), updateAvailability);

export default router;
