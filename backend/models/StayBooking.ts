import mongoose from 'mongoose';

const stayBookingSchema = new mongoose.Schema(
  {
    guest: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    property: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Property', 
      required: true 
    },
    checkIn: { 
      type: Date, 
      required: [true, 'Please provide a check-in date'] 
    },
    checkOut: { 
      type: Date, 
      required: [true, 'Please provide a check-out date'] 
    },
    totalPrice: { 
      type: Number, 
      required: true 
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending'
    },
    paymentReference: { 
      type: String,
      unique: true,
      sparse: true // Allows null/undefined but ensures uniqueness if present
    },
    chauffeurBundleIncluded: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.models.StayBooking || mongoose.model('StayBooking', stayBookingSchema);
