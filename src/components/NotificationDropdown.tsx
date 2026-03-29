import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Car, Home, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'booking' | 'stay' | 'ride' | 'message' | 'alert';
  read: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user?.token) return;

    // Fetch initial notifications
    fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotifications(data.data);
      })
      .catch(err => console.error('Failed to fetch notifications:', err));

    // Listen for real-time notifications via Socket.io
    if (socket) {
      socket.on('new_notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
      });
    }

    return () => {
      if (socket) socket.off('new_notification');
    };
  }, [socket, user?.token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    if (!user?.token) return;

    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      
      if (id === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } else {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ride': return <Car className="w-4 h-4 text-amber-400" />;
      case 'stay': return <Home className="w-4 h-4 text-emerald-400" />;
      case 'booking': return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      default: return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5 text-zinc-300 hover:text-amber-400 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-zinc-950"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900/95 backdrop-blur-xl border border-amber-400/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
            <h3 className="font-medium text-zinc-100">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead('all')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center transition-colors"
              >
                <Check className="w-3 h-3 mr-1" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto hide-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    onClick={() => !notif.read && markAsRead(notif._id)}
                    className={`p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-zinc-800/20' : ''}`}
                  >
                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm ${!notif.read ? 'text-zinc-100 font-medium' : 'text-zinc-300'}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2">{notif.message}</p>
                      <span className="text-[10px] text-zinc-500 mt-2 block">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
