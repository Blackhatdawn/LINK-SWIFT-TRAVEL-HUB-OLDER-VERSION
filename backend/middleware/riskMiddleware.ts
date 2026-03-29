import { Request, Response, NextFunction } from 'express';

// Hook point for external risk provider integration.
// For now it supports optional upstream risk headers.
export const blockHighRiskRequests = (req: Request, res: Response, next: NextFunction) => {
  const raw = req.headers['x-risk-score'];
  const score = raw ? Number(raw) : 0;

  if (Number.isFinite(score) && score >= 80) {
    return res.status(403).json({ success: false, message: 'Request blocked by risk controls' });
  }

  next();
};
