import { Request, Response, NextFunction } from 'express';

// In-memory rate limiter for premium booking endpoints
const bookingAttempts = new Map<string, { count: number, resetTime: number }>();

export const rideRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id?.toString() || req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxAttempts = 5;

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

const inNigeriaBounds = (lat: number, lng: number) => lat >= 4 && lat <= 14 && lng >= 2 && lng <= 15;

const geocodeCache = new Map<string, { lat: number; lng: number; countryCode?: string }>();

const geocodeAddress = async (address: string) => {
  const cacheKey = address.trim().toLowerCase();
  if (geocodeCache.has(cacheKey)) return geocodeCache.get(cacheKey)!;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'LinkSwift/1.0 (support@linkswift.app)',
      'Accept-Language': 'en'
    }
  });

  if (!res.ok) {
    throw new Error('Geocoding request failed');
  }

  const data = await res.json() as Array<{ lat: string; lon: string; display_name?: string }>;
  if (!data.length) {
    throw new Error('Address could not be geocoded');
  }

  const result = {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
    countryCode: data[0].display_name?.toLowerCase().includes('nigeria') ? 'ng' : undefined,
  };

  geocodeCache.set(cacheKey, result);
  return result;
};

export const validateNigeriaLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pickup, dropoff } = req.body;

    const pickupAddress = typeof pickup === 'string' ? pickup : pickup?.address;
    const dropoffAddress = typeof dropoff === 'string' ? dropoff : dropoff?.address;

    if (!pickupAddress || !dropoffAddress) {
      return res.status(400).json({ success: false, message: 'Pickup and dropoff locations are required.' });
    }

    const pickupCoords = typeof pickup === 'object' ? pickup?.coordinates : undefined;
    const dropoffCoords = typeof dropoff === 'object' ? dropoff?.coordinates : undefined;

    const pickupGeo = pickupCoords?.lat && pickupCoords?.lng
      ? { lat: Number(pickupCoords.lat), lng: Number(pickupCoords.lng), countryCode: 'ng' }
      : await geocodeAddress(pickupAddress);

    const dropoffGeo = dropoffCoords?.lat && dropoffCoords?.lng
      ? { lat: Number(dropoffCoords.lat), lng: Number(dropoffCoords.lng), countryCode: 'ng' }
      : await geocodeAddress(dropoffAddress);

    const pickupValid = inNigeriaBounds(pickupGeo.lat, pickupGeo.lng) || pickupGeo.countryCode === 'ng';
    const dropoffValid = inNigeriaBounds(dropoffGeo.lat, dropoffGeo.lng) || dropoffGeo.countryCode === 'ng';

    if (!pickupValid || !dropoffValid) {
      return res.status(400).json({
        success: false,
        message: 'LinkSwift Chauffeur services are currently exclusive to Nigeria. Please provide valid Nigerian pickup and dropoff addresses.'
      });
    }

    next();
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to validate locations at this time.'
    });
  }
};
