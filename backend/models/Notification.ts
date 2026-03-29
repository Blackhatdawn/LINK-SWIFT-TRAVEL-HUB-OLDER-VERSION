import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    type: {
      type: String,
      enum: ['booking', 'stay', 'ride', 'message', 'alert'],
      default: 'alert'
    },
    read: { 
      type: Boolean, 
      default: false 
    },
    relatedId: { 
      type: String 
    }
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
