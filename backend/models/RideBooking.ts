import mongoose from 'mongoose';

const rideBookingSchema = new mongoose.Schema(
  {
    guest: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    chauffeur: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    pickup: {
      address: { type: String, required: [true, 'Please provide a pickup location'] },
      coordinates: { lat: Number, lng: Number }
    },
    dropoff: {
      address: { type: String, required: [true, 'Please provide a dropoff location'] },
      coordinates: { lat: Number, lng: Number }
    },
    date: { 
      type: Date, 
      required: [true, 'Please provide a ride date'] 
    },
    carType: { 
      type: String, 
      enum: ['Mercedes-Benz S-Class', 'Range Rover Autobiography', 'Rolls-Royce Phantom', 'Lexus LX 600'],
      required: true 
    },
    fare: { 
      type: Number, 
      required: true 
    },
    status: {
      type: String,
      enum: ['Pending', 'Payment Required', 'Confirmed', 'Chauffeur Assigned', 'En Route', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    paymentReference: { 
      type: String 
    },
    stayBundle: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'StayBooking' 
    },
    specialRequests: {
      type: String,
      maxlength: 500
    }
  },
  { timestamps: true }
);

export default mongoose.models.RideBooking || mongoose.model('RideBooking', rideBookingSchema);
