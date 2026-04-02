import mongoose from 'mongoose';

const walletAccountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'NGN' },
    
    // KYC and Tier System
    kycStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    tier: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    kycVerificationDate: Date,
    
    // Tier-based Limits
    dailyLimit: { type: Number, default: 100000 }, // ₦100K for Tier 1
    monthlyLimit: { type: Number, default: 500000 }, // ₦500K for Tier 1
    dailySpent: { type: Number, default: 0 },
    monthlySpent: { type: Number, default: 0 },
    lastSpentReset: Date,
    
    // Account Status
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    blockReason: String,
    
    // Account Metadata
    totalTransactionCount: { type: Number, default: 0 },
    totalBeneficiaries: { type: Number, default: 0 },
    lastTransactionDate: Date,
    
    // Fraud Risk Score (0-100)
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    lastRiskAssessment: Date,
  },
  { timestamps: true }
);

// Indexes for efficient querying
walletAccountSchema.index({ user: 1 });
walletAccountSchema.index({ kycStatus: 1 });
walletAccountSchema.index({ tier: 1 });
walletAccountSchema.index({ isBlocked: 1 });
walletAccountSchema.index({ riskScore: 1 });

export default mongoose.models.WalletAccount || mongoose.model('WalletAccount', walletAccountSchema);
