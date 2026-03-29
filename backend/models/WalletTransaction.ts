import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletAccount', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    category: {
      type: String,
      enum: ['transfer', 'bill', 'ride', 'stay', 'express', 'topup', 'cashout', 'miniapp'],
      required: true,
    },
    title: { type: String, required: true },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    reference: { type: String, index: true },
    metadata: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
