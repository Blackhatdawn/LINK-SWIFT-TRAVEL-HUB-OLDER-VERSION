import express from 'express';
import { createRideBooking, getMyRides, updateRideStatus } from '../controllers/rideController';
import { protect } from '../middleware/authMiddleware';
import { rideRateLimiter, validateNigeriaLocation } from '../middleware/rideValidation';

const router = express.Router();

// @route   POST /api/rides/book
// @desc    Create a new premium ride booking
// @access  Private
router.route('/book')
  .post(protect, rideRateLimiter, validateNigeriaLocation, createRideBooking);

// @route   GET /api/rides/my-rides
// @desc    Get logged-in user's ride bookings
// @access  Private
router.route('/my-rides')
  .get(protect, getMyRides);

// @route   PUT /api/rides/:id/status
// @desc    Update ride status (Assign chauffeur, complete ride)
// @access  Private (Should be restricted to Admin/Chauffeur in production)
router.route('/:id/status')
  .put(protect, updateRideStatus);

export default router;
