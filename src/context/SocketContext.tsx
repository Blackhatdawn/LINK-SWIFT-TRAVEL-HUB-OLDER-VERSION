import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.token) {
      setSocket(null);
      return;
    }

    const newSocket = io({
      auth: {
        token: user.token,
      },
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?.token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
