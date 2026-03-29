import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Please add a property title'], 
      trim: true 
    },
    description: { 
      type: String, 
      required: [true, 'Please add a description'] 
    },
    location: {
      address: { type: String, required: [true, 'Please add an address'] },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    pricePerNight: { 
      type: Number, 
      required: [true, 'Please add a price per night'] 
    },
    images: [{ 
      type: String 
    }],
    amenities: [{ 
      type: String 
    }],
    host: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    verified: { 
      type: Boolean, 
      default: false 
    },
    isAvailable: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

// Index for geospatial queries if needed in the future
propertySchema.index({ 'location.lat': 1, 'location.lng': 1 });

export default mongoose.models.Property || mongoose.model('Property', propertySchema);
