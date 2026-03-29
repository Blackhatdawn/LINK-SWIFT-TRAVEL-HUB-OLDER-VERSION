import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import path from 'path';
import mongoose from 'mongoose';
import { initIo } from './backend/socket';
import stayRoutes from './backend/routes/stayRoutes';
import notificationRoutes from './backend/routes/notificationRoutes';
import rideRoutes from './backend/routes/rideRoutes';
import authRoutes from './backend/routes/authRoutes';
import paymentRoutes from './backend/routes/paymentRoutes';
import { getAllowedOrigins, getMongoUri, getPort, isProduction } from './backend/configEnv';

async function startServer() {
  const app = express();
  const PORT = getPort();
  const allowedOrigins = getAllowedOrigins();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    const originAllowed =
      !origin ||
      (!isProduction && allowedOrigins.length === 0) ||
      allowedOrigins.includes(origin);

    if (originAllowed) {
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    }

    if (req.method === 'OPTIONS') {
      return originAllowed ? res.status(204).end() : res.status(403).end();
    }

    return next();
  });

  app.use('/api/payments/paystack/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json({ limit: '1mb' }));

  try {
    const mongoUri = await getMongoUri();
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }

  const server = http.createServer(app);

  initIo(server, allowedOrigins);

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/stays', stayRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/rides', rideRoutes);
  app.use('/api/payments', paymentRoutes);

  app.use('/api/*', (_req, res) => {
    res.status(404).json({ success: false, message: 'API route not found' });
  });

  app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer = server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    httpServer.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

startServer();
