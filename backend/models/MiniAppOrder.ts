import mongoose from 'mongoose';

const miniAppOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appId: { type: String, required: true },
    appName: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'processing' },
    reference: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.MiniAppOrder || mongoose.model('MiniAppOrder', miniAppOrderSchema);
