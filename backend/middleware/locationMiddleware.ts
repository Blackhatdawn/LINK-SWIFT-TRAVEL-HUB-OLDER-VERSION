import { Request, Response, NextFunction } from 'express';

export const nigeriaOnly = (req: Request, res: Response, next: NextFunction) => {
  // Mock location middleware for Nigeria bounding box
  // In production, this would check IP geolocation or request headers
  const isNigeria = true; // Mocked to true for development
  
  if (!isNigeria) {
    return res.status(403).json({ success: false, message: 'Service is only available in Nigeria' });
  }
  
  next();
};
