import mongoose from 'mongoose';

const fundingSourceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Funding Source Type
    type: {
      type: String,
      enum: ['card', 'bank_account', 'ussd', 'bank_transfer'],
      required: true,
    },
    
    // Card Details (for card type)
    cardNumber: String,
    cardLast4: String,
    cardBrand: String, // visa, mastercard, verve
    cardExpiryMonth: Number,
    cardExpiryYear: Number,
    cardHolderName: String,
    
    // Bank Account Details (for bank_account type)
    accountNumber: String,
    accountName: String,
    bankCode: String,
    bankName: String,
    
    // USSD Code (for ussd type)
    ussdCode: String,
    ussdProvider: String,
    
    // Bank Transfer Details (for bank_transfer type)
    transferType: String, // single, recurring
    
    // Verification
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'failed'],
      default: 'unverified',
    },
    verificationDate: Date,
    verificationError: String,
    
    // Usage
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastUsedDate: Date,
    totalFunded: { type: Number, default: 0 },
    fundCount: { type: Number, default: 0 },
    
    // Limits
    dailyLimit: { type: Number, default: 500000 },
    monthlyLimit: { type: Number, default: 5000000 },
    dailyUsed: { type: Number, default: 0 },
    monthlyUsed: { type: Number, default: 0 },
    
    // Metadata
    metadata: { type: Object },
  },
  { timestamps: true }
);

// Indexes
fundingSourceSchema.index({ user: 1, isActive: 1 }); // User's active sources
fundingSourceSchema.index({ user: 1, isDefault: 1 }); // User's default source
fundingSourceSchema.index({ type: 1 }); // By type
fundingSourceSchema.index({ verificationStatus: 1 }); // By verification status

// Ensure only one default per user
fundingSourceSchema.index({ user: 1, isDefault: 1 }, { 
  partialFilterExpression: { isDefault: true },
  unique: true,
});

export default mongoose.models.FundingSource || mongoose.model('FundingSource', fundingSourceSchema);
