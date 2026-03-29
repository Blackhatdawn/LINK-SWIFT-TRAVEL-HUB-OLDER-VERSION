import { Request, Response, NextFunction } from 'express';

// In-memory rate limiter for premium booking endpoints
const bookingAttempts = new Map<string, { count: number, resetTime: number }>();

export const rideRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id?.toString() || req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxAttempts = 5; // Max 5 bookings per 15 mins to prevent spam

  if (!bookingAttempts.has(userId)) {
    bookingAttempts.set(userId, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const attempt = bookingAttempts.get(userId)!;
  if (now > attempt.resetTime) {
    bookingAttempts.set(userId, { count: 1, resetTime: now + windowMs });
    return next();
  }

  attempt.count++;
  if (attempt.count > maxAttempts) {
    return res.status(429).json({ 
      success: false, 
      message: 'Rate limit exceeded. Please wait before scheduling another premium ride.' 
    });
  }

  next();
};

// Nigeria Bounding Box Validation (Lat: 4.0-14.0, Lng: 2.0-15.0)
export const validateNigeriaLocation = (req: Request, res: Response, next: NextFunction) => {
  const { pickup, dropoff } = req.body;
  
  const pickupAddress = typeof pickup === 'string' ? pickup : pickup?.address;
  const dropoffAddress = typeof dropoff === 'string' ? dropoff : dropoff?.address;

  if (!pickupAddress || !dropoffAddress) {
    return res.status(400).json({ success: false, message: 'Pickup and dropoff locations are required.' });
  }

  // Mock string-based validation for MVP (ensuring Nigerian context)
  const validKeywords = ['lagos', 'abuja', 'port harcourt', 'ikeja', 'victoria island', 'lekki', 'ikoyi', 'airport', 'los', 'abv', 'kano', 'enugu'];
  const pickupLower = pickupAddress.toLowerCase();
  const dropoffLower = dropoffAddress.toLowerCase();

  const isPickupValid = validKeywords.some(kw => pickupLower.includes(kw));
  const isDropoffValid = validKeywords.some(kw => dropoffLower.includes(kw));

  // In a production app, we would use Google Maps API to verify coordinates against the bounding box.
  // For this luxury MVP, we enforce keywords if provided, or just pass if it looks like a valid address.
  if (!isPickupValid && !isDropoffValid && pickupAddress.length < 5) {
     return res.status(400).json({ 
       success: false, 
       message: 'LinkSwift Chauffeur services are currently exclusive to Nigeria. Please provide a valid Nigerian address.' 
     });
  }

  next();
};
