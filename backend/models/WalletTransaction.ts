import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletAccount', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    category: {
      type: String,
      enum: ['transfer', 'bill', 'ride', 'stay', 'express', 'topup', 'cashout', 'miniapp', 'p2p'],
      required: true,
    },
    title: { type: String, required: true },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    reference: { type: String, unique: true, index: true, required: true },
    
    // Fee Information
    fee: { type: Number, default: 0, min: 0 },
    feePercentage: { type: Number, default: 0 },
    netAmount: { type: Number }, // amount - fee
    
    // Transaction Direction
    direction: { type: String, enum: ['incoming', 'outgoing'], required: true },
    
    // P2P Specific Fields
    recipientAccount: mongoose.Schema.Types.ObjectId,
    recipientPhone: String,
    recipientName: String,
    senderName: String,
    
    // Duplicate Prevention
    idempotencyKey: { type: String, index: true },
    isDuplicate: { type: Boolean, default: false },
    originalTransactionId: mongoose.Schema.Types.ObjectId,
    
    // Risk & Compliance
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    isHighRisk: { type: Boolean, default: false },
    fraudStatus: { type: String, enum: ['clear', 'flagged', 'blocked'], default: 'clear' },
    
    // Metadata
    metadata: { type: Object },
    description: String,
  },
  { timestamps: true }
);

// Composite indexes for efficient querying
walletTransactionSchema.index({ wallet: 1, createdAt: -1 }); // For transaction history
walletTransactionSchema.index({ user: 1, status: 1 }); // For pending transactions
walletTransactionSchema.index({ reference: 1 }); // For unique reference lookup
walletTransactionSchema.index({ idempotencyKey: 1 }); // For duplicate prevention
walletTransactionSchema.index({ recipientPhone: 1 }); // For P2P recipient lookup
walletTransactionSchema.index({ riskScore: 1 }); // For fraud detection

export default mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
