import { Request, Response, NextFunction } from 'express';
import { isProduction } from '../configEnv';

export const nigeriaOnly = (req: Request, res: Response, next: NextFunction) => {
  const countryHeaders = [
    req.headers['cf-ipcountry'],
    req.headers['x-country-code'],
    req.headers['x-vercel-ip-country'],
  ];

  const country = countryHeaders.find(Boolean)?.toString().trim().toUpperCase();

  // In non-production we allow traffic when country headers are absent to avoid local-dev friction.
  if (!isProduction && !country) {
    return next();
  }

  if (country !== 'NG') {
    return res.status(403).json({ success: false, message: 'Service is only available in Nigeria' });
  }

  next();
};
