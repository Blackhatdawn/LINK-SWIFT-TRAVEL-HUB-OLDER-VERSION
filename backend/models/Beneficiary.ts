import mongoose from 'mongoose';

const beneficiarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Basic Beneficiary Information
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: String,
    
    // Bank Account Information
    accountNumber: { type: String, required: true, trim: true },
    accountName: String,
    bankCode: { type: String, required: true }, // CBN bank codes
    bankName: String,
    
    // Additional Details
    accountType: { type: String, enum: ['personal', 'business'], default: 'personal' },
    isDefault: { type: Boolean, default: false },
    saveForFuture: { type: Boolean, default: true },
    
    // Verification
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'failed'],
      default: 'unverified',
    },
    verificationDate: Date,
    verificationError: String,
    
    // Usage Tracking
    transactionCount: { type: Number, default: 0 },
    totalTransferred: { type: Number, default: 0 },
    lastUsedDate: Date,
    
    // Status
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    
    // Metadata
    nickname: String,
    tags: [String],
  },
  { timestamps: true }
);

// Indexes for efficient querying
beneficiarySchema.index({ user: 1, isDeleted: 1 }); // User's active beneficiaries
beneficiarySchema.index({ user: 1, isDefault: 1 }); // User's default beneficiary
beneficiarySchema.index({ phone: 1 }); // Search by phone
beneficiarySchema.index({ accountNumber: 1, bankCode: 1 }); // Uniqueness check
beneficiarySchema.index({ user: 1, createdAt: -1 }); // Recent beneficiaries

// Ensure only one default per user
beneficiarySchema.index({ user: 1, isDefault: 1 }, { 
  partialFilterExpression: { isDefault: true },
  unique: true,
});

export default mongoose.models.Beneficiary || mongoose.model('Beneficiary', beneficiarySchema);
