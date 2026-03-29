import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import path from 'path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initIo } from './backend/socket';
import stayRoutes from './backend/routes/stayRoutes';
import notificationRoutes from './backend/routes/notificationRoutes';
import rideRoutes from './backend/routes/rideRoutes';
import authRoutes from './backend/routes/authRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Connect to MongoDB
  try {
    let mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.log('No MONGO_URI provided, starting in-memory MongoDB...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
  }

  // Create HTTP Server
  const server = http.createServer(app);

  // Initialize Socket.io
  const io = initIo(server);
  
  // Socket.io Integration for Real-Time Notifications
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Authenticate and join user to their personal room based on their User ID
    socket.on('join_user_room', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Mount Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/stays', stayRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/rides', rideRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
