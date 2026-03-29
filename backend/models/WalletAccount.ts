import mongoose from 'mongoose';

const walletAccountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'NGN' },
  },
  { timestamps: true }
);

export default mongoose.models.WalletAccount || mongoose.model('WalletAccount', walletAccountSchema);
