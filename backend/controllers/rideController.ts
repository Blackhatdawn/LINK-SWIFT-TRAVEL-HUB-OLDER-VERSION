import { Request, Response } from 'express';
import RideBooking from '../models/RideBooking';
import { createNotification } from './notificationController';
import crypto from 'crypto';
import { initializePaystackTransaction } from '../services/paystack';

// Helper: Calculate luxury fare based on car class
const calculateFare = (carType: string): number => {
  const baseFares: Record<string, number> = {
    'Mercedes-Benz S-Class': 45000,
    'Range Rover Autobiography': 55000,
    'Rolls-Royce Phantom': 150000,
    'Lexus LX 600': 60000
  };
  return baseFares[carType] || 35000;
};

// @desc    Create a new premium ride booking
// @route   POST /api/rides/book
// @access  Private
export const createRideBooking = async (req: Request, res: Response) => {
  try {
    const { pickup, dropoff, date, carType, stayBundleId, specialRequests } = req.body;

    if (!pickup || !dropoff || !date || !carType) {
      return res.status(400).json({ success: false, message: 'pickup, dropoff, date and carType are required' });
    }


    if (!req.user?.email) {
      return res.status(400).json({ success: false, message: 'Authenticated user email is required for payments' });
    }
    const rideDate = new Date(date);
    if (Number.isNaN(rideDate.getTime()) || rideDate.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Ride date must be a valid future date' });
    }

    // 1. Calculate Fare
    const fare = calculateFare(carType);

    // 2. Generate Paystack Reference
    const paymentReference = `LS-RIDE-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    // 3. Format addresses (handling both string and object inputs from frontend)
    const pickupData = typeof pickup === 'string' ? { address: pickup } : pickup;
    const dropoffData = typeof dropoff === 'string' ? { address: dropoff } : dropoff;

    // 4. Create the Booking
    const booking = await RideBooking.create({
      guest: req.user?._id,
      pickup: pickupData,
      dropoff: dropoffData,
      date: rideDate,
      carType,
      fare,
      status: 'Payment Required', // Requires Paystack confirmation
      paymentReference,
      stayBundle: stayBundleId || null,
      specialRequests
    });

    // 5. Real-time Notification to Guest
    await createNotification(
      req.user?._id as string,
      'Ride Booking Initiated',
      `Your ${carType} ride is pending payment. Ref: ${paymentReference}`,
      'ride',
      booking._id.toString()
    );

    const paymentInit = await initializePaystackTransaction({
      email: req.user?.email,
      amount: fare * 100,
      reference: paymentReference,
      metadata: {
        bookingId: booking._id.toString(),
        bookingType: 'ride',
        userId: req.user?._id?.toString(),
      },
    });

    // 6. Return Paystack initialization data
    res.status(201).json({ 
      success: true, 
      data: booking,
      payment: {
        provider: 'Paystack',
        reference: paymentReference,
        amount: fare * 100,
        authorization_url: paymentInit.authorization_url,
        access_code: paymentInit.access_code,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get logged-in user's ride bookings
// @route   GET /api/rides/my-rides
// @access  Private
export const getMyRides = async (req: Request, res: Response) => {
  try {
    const bookings = await RideBooking.find({ guest: req.user?._id })
      .populate('chauffeur', 'name phone profilePicture')
      .populate('stayBundle', 'property checkIn checkOut')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update ride status (Admin/Chauffeur)
// @route   PUT /api/rides/:id/status
// @access  Private
export const updateRideStatus = async (req: Request, res: Response) => {
  try {
    const { status, chauffeurId } = req.body;
    const allowedStatuses = ['Pending', 'Payment Required', 'Confirmed', 'Chauffeur Assigned', 'En Route', 'Completed', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid ride status' });
    }
    const booking = await RideBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Ride booking not found' });
    }

    booking.status = status;
    if (chauffeurId) booking.chauffeur = chauffeurId;
    
    await booking.save();

    // Real-time Notification based on status
    let notifTitle = 'Ride Status Updated';
    let notifMessage = `Your ride status is now: ${status}`;

    if (status === 'Chauffeur Assigned') {
      notifTitle = 'Chauffeur Assigned';
      notifMessage = `A professional chauffeur has been assigned to your ${booking.carType} ride.`;
      
      // Notify Chauffeur as well
      if (chauffeurId) {
        await createNotification(
          chauffeurId,
          'New Ride Assignment',
          `You have been assigned a new ride from ${booking.pickup.address} to ${booking.dropoff.address}.`,
          'ride',
          booking._id.toString()
        );
      }
    } else if (status === 'En Route') {
      notifTitle = 'Chauffeur En Route';
      notifMessage = 'Your chauffeur is on the way to your pickup location.';
    } else if (status === 'Completed') {
      notifTitle = 'Ride Completed';
      notifMessage = 'Thank you for traveling with LinkSwift. We hope you enjoyed your luxury experience.';
    }

    // Notify Guest
    await createNotification(
      booking.guest.toString(),
      notifTitle,
      notifMessage,
      'ride',
      booking._id.toString()
    );

    res.status(200).json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
