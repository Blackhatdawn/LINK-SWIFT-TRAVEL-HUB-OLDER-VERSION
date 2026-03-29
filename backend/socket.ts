import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from './configEnv';

let io: Server;

export const initIo = (httpServer: any, allowedOrigins: string[] = []) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : true,
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.toString().replace('Bearer ', '');
      if (!token) {
        return next(new Error('Socket auth token is required'));
      }
      const decoded = jwt.verify(token, getJwtSecret()) as { id: string };
      socket.data.userId = decoded.id;
      return next();
    } catch (error) {
      return next(new Error('Invalid socket token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    if (userId) {
      socket.join(userId);
    }
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
