import { Request, Response } from 'express';
import Property from '../models/Property';
import StayBooking from '../models/StayBooking';
import { createNotification } from './notificationController';
import crypto from 'crypto';
import { initializePaystackTransaction } from '../services/paystack';

// @desc    Get all available properties (with search and Nigeria bounding box filter)
// @route   GET /api/stays
// @access  Public
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const { search, minPrice, maxPrice } = req.query;
    
    // Base query: only show available and verified luxury properties
    let query: any = { isAvailable: true, verified: true };

    // Text search on title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    // Price filtering
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query)
      .populate('host', 'name email profileImage')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get single property by ID
// @route   GET /api/stays/:id
// @access  Public
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('host', 'name email profileImage');
      
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    res.status(200).json({ success: true, data: property });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new stay booking (Paystack ready)
// @route   POST /api/stays/book
// @access  Private
export const createStayBooking = async (req: Request, res: Response) => {
  try {
    const { propertyId, checkIn, checkOut, chauffeurBundleIncluded } = req.body;

    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'propertyId, checkIn and checkOut are required' });
    }


    if (!req.user?.email) {
      return res.status(400).json({ success: false, message: 'Authenticated user email is required for payments' });
    }
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (!property.isAvailable) {
      return res.status(400).json({ success: false, message: 'Property is currently unavailable for booking' });
    }

    // Calculate total nights and price
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: 'Invalid check-in/check-out dates' });
    }
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.max(1, Math.ceil(timeDifference / (1000 * 3600 * 24)));
    
    let totalPrice = nights * property.pricePerNight;

    // Optional Chauffeur Bundle (e.g., flat rate of ₦50,000 per stay)
    if (chauffeurBundleIncluded) {
      totalPrice += 50000; 
    }

    const paymentReference = `LS-STAY-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    const booking = await StayBooking.create({
      guest: req.user?._id,
      property: propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      status: 'Pending', // Status updates to 'Confirmed' via Paystack Webhook
      paymentReference,
      chauffeurBundleIncluded
    });

    // Create notification (which automatically emits via Socket.io)
    await createNotification(
      property.host.toString(),
      'New Stay Booking',
      `You have a new booking request for ${property.title}`,
      'stay',
      booking._id.toString()
    );

    const paymentInit = await initializePaystackTransaction({
      email: req.user?.email,
      amount: totalPrice * 100,
      reference: paymentReference,
      callback_url: process.env.APP_URL ? `${process.env.APP_URL}/payment/return?reference=${paymentReference}` : undefined,
      metadata: {
        bookingId: booking._id.toString(),
        bookingType: 'stay',
        userId: req.user?._id?.toString(),
      },
    });

    res.status(201).json({
      success: true,
      data: booking,
      payment: {
        provider: 'Paystack',
        reference: paymentReference,
        amount: totalPrice * 100,
        authorization_url: paymentInit.authorization_url,
        access_code: paymentInit.access_code,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get logged-in user's stay bookings
// @route   GET /api/stays/my-stays
// @access  Private
export const getMyStays = async (req: Request, res: Response) => {
  try {
    const bookings = await StayBooking.find({ guest: req.user?._id })
      .populate('property', 'title location images pricePerNight')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get properties owned by the logged-in host
// @route   GET /api/stays/host/properties
// @access  Private (Host only)
export const getMyProperties = async (req: Request, res: Response) => {
  try {
    const properties = await Property.find({ host: req.user?._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update property availability
// @route   PUT /api/stays/host/properties/:id/availability
// @access  Private (Host only)
export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const { isAvailable } = req.body;
    
    // Ensure the property belongs to the logged-in host
    const property = await Property.findOne({ _id: req.params.id, host: req.user?._id });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or unauthorized' });
    }

    property.isAvailable = isAvailable;
    await property.save();

    res.status(200).json({ success: true, data: property });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
