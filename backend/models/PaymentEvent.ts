import mongoose from 'mongoose';

const paymentEventSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['paystack', 'ivorypay'], required: true },
    eventKey: { type: String, required: true, unique: true },
    reference: { type: String, index: true },
    eventType: { type: String, required: true },
    processed: { type: Boolean, default: false },
    payload: { type: Object, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentEvent || mongoose.model('PaymentEvent', paymentEventSchema);
