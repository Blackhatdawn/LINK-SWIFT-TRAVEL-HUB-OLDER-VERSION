/**
 * Wallet Constants - Fee structures, tier limits, and configuration
 */

export enum WalletTier {
  TIER_1 = 1,
  TIER_2 = 2,
  TIER_3 = 3,
}

export enum KYCStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum TransactionCategory {
  TRANSFER = 'transfer',
  BILL = 'bill',
  RIDE = 'ride',
  STAY = 'stay',
  EXPRESS = 'express',
  TOPUP = 'topup',
  CASHOUT = 'cashout',
  MINIAPP = 'miniapp',
  P2P = 'p2p',
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export enum TransactionStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed',
}

export enum FraudStatus {
  CLEAR = 'clear',
  FLAGGED = 'flagged',
  BLOCKED = 'blocked',
}

/**
 * Tier Configuration - Daily and monthly limits based on KYC level
 */
export const TIER_CONFIG = {
  [WalletTier.TIER_1]: {
    minKYC: KYCStatus.UNVERIFIED,
    dailyLimit: 100000, // ₦100K
    monthlyLimit: 500000, // ₦500K
    maxBeneficiaries: 10,
    maxTransactionsPerDay: 100,
  },
  [WalletTier.TIER_2]: {
    minKYC: KYCStatus.PENDING,
    dailyLimit: 1000000, // ₦1M
    monthlyLimit: 10000000, // ₦10M
    maxBeneficiaries: 50,
    maxTransactionsPerDay: 500,
  },
  [WalletTier.TIER_3]: {
    minKYC: KYCStatus.VERIFIED,
    dailyLimit: 10000000, // ₦10M
    monthlyLimit: 50000000, // ₦50M
    maxBeneficiaries: 500,
    maxTransactionsPerDay: 5000,
  },
};

/**
 * Fee Structure - Fixed and percentage-based fees for different transaction types
 */
export const FEE_STRUCTURE = {
  [TransactionCategory.P2P]: {
    fixed: 10, // ₦10
    percentage: 0.005, // 0.5%
  },
  [TransactionCategory.BILL]: {
    fixed: 0,
    percentage: 0.01, // 1%
  },
  [TransactionCategory.TOPUP]: {
    fixed: 0,
    percentage: 0.015, // 1.5%
  },
  [TransactionCategory.CASHOUT]: {
    fixed: 50, // ₦50
    percentage: 0.01, // 1%
  },
  [TransactionCategory.TRANSFER]: {
    fixed: 10, // ₦10
    percentage: 0.005, // 0.5%
  },
};

/**
 * Fraud Detection Configuration
 */
export const FRAUD_CONFIG = {
  // Risk score thresholds
  RISK_THRESHOLDS: {
    CLEAR: 20, // 0-20 = Clear
    FLAGGED: 50, // 21-50 = Flagged (warning)
    BLOCKED: 100, // 51-100 = Blocked (failed)
  },

  // Risk factors and their scores
  RISK_FACTORS: {
    HIGH_TRANSACTION_AMOUNT: 15,
    NEW_BENEFICIARY: 10,
    UNUSUAL_TIME: 5,
    RAPID_TRANSACTIONS: 20,
    NEW_DEVICE: 15,
    LOCATION_CHANGE: 10,
    REPEATED_FAILURES: 25,
    ACCOUNT_AGE_LOW: 20, // Account less than 7 days old
    MULTIPLE_FAILURES: 15,
  },

  // Blocking rules
  BLOCK_RULES: {
    MAX_DAILY_TRANSFERS: 100,
    MAX_HOURLY_TRANSFERS: 10,
    MAX_FAILED_ATTEMPTS: 5,
    AMOUNT_CEILING: 1000000, // ₦1M for unverified
  },
};

/**
 * Transaction Configuration
 */
export const TRANSACTION_CONFIG = {
  REFERENCE_PREFIX: 'LNK',
  OTP_EXPIRY_MINUTES: 10,
  TRANSFER_TIMEOUT_SECONDS: 30,
  RECONCILIATION_INTERVAL_HOURS: 24,
  DUPLICATE_WINDOW_MINUTES: 5, // Window for duplicate detection
};

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  // Phone number validation (Nigerian format)
  PHONE_REGEX: /^(\+234|0)[789]\d{9}$/,
  
  // Account number (typically 10 digits for Nigerian banks)
  ACCOUNT_NUMBER_LENGTH: 10,
  
  // OTP length
  OTP_LENGTH: 6,
  
  // Beneficiary nickname max length
  NICKNAME_MAX_LENGTH: 50,
};

/**
 * Error Messages
 */
export const WALLET_ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance for this transaction',
  DAILY_LIMIT_EXCEEDED: 'Daily transaction limit exceeded',
  MONTHLY_LIMIT_EXCEEDED: 'Monthly transaction limit exceeded',
  ACCOUNT_BLOCKED: 'Your wallet account is temporarily blocked',
  INVALID_BENEFICIARY: 'Invalid beneficiary account',
  DUPLICATE_TRANSACTION: 'This transaction appears to be a duplicate',
  FRAUD_DETECTED: 'Transaction flagged as high risk and cannot proceed',
  KYC_REQUIRED: 'KYC verification required for this transaction',
  TIER_LIMIT_EXCEEDED: 'Transaction exceeds your current tier limits',
  INVALID_REFERENCE: 'Invalid or expired transaction reference',
};

/**
 * Success Messages
 */
export const WALLET_SUCCESS_MESSAGES = {
  TRANSFER_INITIATED: 'Transfer initiated successfully',
  TRANSFER_COMPLETED: 'Transfer completed successfully',
  BENEFICIARY_ADDED: 'Beneficiary added successfully',
  BENEFICIARY_UPDATED: 'Beneficiary updated successfully',
  BENEFICIARY_DELETED: 'Beneficiary deleted successfully',
  WALLET_FUNDED: 'Wallet funded successfully',
};
