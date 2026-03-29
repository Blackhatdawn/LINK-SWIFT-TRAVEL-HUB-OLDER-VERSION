import mongoose from 'mongoose';

const expressOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pickup: { type: String, required: true },
    dropoff: { type: String, required: true },
    packageType: { type: String, required: true },
    weight: { type: String, required: true },
    instructions: { type: String },
    price: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'], default: 'pending' },
    reference: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ExpressOrder || mongoose.model('ExpressOrder', expressOrderSchema);
