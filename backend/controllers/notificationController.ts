import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { getIo } from '../socket';

// @desc    Create a new notification and emit via socket
export const createNotification = async (
  userId: string, 
  title: string, 
  message: string, 
  type: 'booking' | 'stay' | 'ride' | 'message' | 'alert', 
  relatedId?: string
) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedId
    });

    // Emit real-time notification to the user's specific room
    try {
      const io = getIo();
      io.to(userId.toString()).emit('new_notification', notification);
    } catch (socketError) {
      console.error('Socket.io emit failed:', socketError);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// @desc    Get logged-in user's notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.user?._id })
      .sort('-createdAt')
      .limit(50);
      
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Mark notification(s) as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (id === 'all') {
      await Notification.updateMany(
        { user: req.user?._id, read: false }, 
        { read: true }
      );
    } else {
      const notification = await Notification.findOneAndUpdate(
        { _id: id, user: req.user?._id }, 
        { read: true },
        { new: true }
      );
      
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
