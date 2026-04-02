import mongoose from 'mongoose';
import WalletAccount from '../models/WalletAccount';
import WalletTransaction from '../models/WalletTransaction';
import {
  FEE_STRUCTURE,
  TRANSACTION_CONFIG,
  TransactionCategory,
  TransactionType,
  TransactionDirection,
  TransactionStatus,
  WALLET_ERROR_MESSAGES,
} from '../constants/walletConstants';

/**
 * WalletTransactionService
 * Handles all transaction-related operations with atomic operations and fees
 */

interface CreateTransactionInput {
  wallet: string;
  user: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  title: string;
  description?: string;
  direction: TransactionDirection;
  recipientPhone?: string;
  recipientName?: string;
  senderName?: string;
  recipientAccount?: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

interface TransactionResult {
  success: boolean;
  transaction?: any;
  error?: string;
  fee?: number;
  netAmount?: number;
}

class WalletTransactionService {
  /**
   * Generate unique transaction reference
   */
  static generateReference(category: TransactionCategory): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${TRANSACTION_CONFIG.REFERENCE_PREFIX}-${category.toUpperCase()}-${timestamp}${random}`;
  }

  /**
   * Calculate transaction fee based on category and amount
   */
  static calculateFee(category: TransactionCategory, amount: number): number {
    const feeConfig = FEE_STRUCTURE[category];
    if (!feeConfig) {
      return 0;
    }

    const percentageFee = amount * feeConfig.percentage;
    const totalFee = feeConfig.fixed + percentageFee;

    // Round to nearest naira
    return Math.ceil(totalFee);
  }

  /**
   * Check for duplicate transactions within the duplicate window
   */
  static async checkDuplicate(
    userId: string,
    amount: number,
    idempotencyKey?: string
  ): Promise<{ isDuplicate: boolean; originalTransaction?: any }> {
    if (!idempotencyKey) {
      return { isDuplicate: false };
    }

    const windowStart = new Date(Date.now() - TRANSACTION_CONFIG.DUPLICATE_WINDOW_MINUTES * 60 * 1000);

    const existingTransaction = await WalletTransaction.findOne({
      user: userId,
      idempotencyKey,
      createdAt: { $gte: windowStart },
    });

    if (existingTransaction && existingTransaction.status === TransactionStatus.COMPLETED) {
      return {
        isDuplicate: true,
        originalTransaction: existingTransaction,
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Create a wallet transaction with atomicity
   */
  static async createTransaction(input: CreateTransactionInput): Promise<TransactionResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Check for duplicates
      const duplicateCheck = await this.checkDuplicate(input.user, input.amount, input.idempotencyKey);
      if (duplicateCheck.isDuplicate) {
        await session.abortTransaction();
        return {
          success: false,
          error: WALLET_ERROR_MESSAGES.DUPLICATE_TRANSACTION,
        };
      }

      // 2. Calculate fee
      const fee = this.calculateFee(input.category, input.amount);
      const netAmount = input.amount - (input.type === TransactionType.DEBIT ? fee : 0);

      // 3. Generate reference
      const reference = this.generateReference(input.category);

      // 4. Create transaction document
      const transaction = new WalletTransaction({
        wallet: input.wallet,
        user: input.user,
        amount: input.amount,
        type: input.type,
        category: input.category,
        title: input.title,
        description: input.description,
        direction: input.direction,
        recipientPhone: input.recipientPhone,
        recipientName: input.recipientName,
        senderName: input.senderName,
        recipientAccount: input.recipientAccount,
        reference,
        fee,
        feePercentage: FEE_STRUCTURE[input.category]?.percentage || 0,
        netAmount,
        idempotencyKey: input.idempotencyKey,
        status: TransactionStatus.PENDING,
        metadata: input.metadata,
      });

      // 5. Save transaction
      await transaction.save({ session });

      // 6. Update wallet balance
      const wallet = await WalletAccount.findById(input.wallet).session(session);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (input.type === TransactionType.DEBIT) {
        if (wallet.balance < input.amount) {
          throw new Error(WALLET_ERROR_MESSAGES.INSUFFICIENT_BALANCE);
        }
        wallet.balance -= input.amount;
      } else {
        wallet.balance += input.amount;
      }

      wallet.lastTransactionDate = new Date();
      wallet.totalTransactionCount = (wallet.totalTransactionCount || 0) + 1;
      await wallet.save({ session });

      // 7. Commit transaction
      await session.commitTransaction();

      return {
        success: true,
        transaction: transaction.toObject(),
        fee,
        netAmount,
      };
    } catch (error: any) {
      await session.abortTransaction();
      return {
        success: false,
        error: error.message,
      };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Mark transaction as completed
   */
  static async completeTransaction(transactionId: string): Promise<TransactionResult> {
    try {
      const transaction = await WalletTransaction.findByIdAndUpdate(
        transactionId,
        { status: TransactionStatus.COMPLETED },
        { new: true }
      );

      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      return {
        success: true,
        transaction,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Mark transaction as failed and reverse wallet balance
   */
  static async failTransaction(transactionId: string): Promise<TransactionResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transaction = await WalletTransaction.findById(transactionId).session(session);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Only reverse if it's a debit transaction
      if (transaction.type === TransactionType.DEBIT) {
        const wallet = await WalletAccount.findById(transaction.wallet).session(session);
        if (wallet) {
          wallet.balance += transaction.amount; // Reverse the debit
          await wallet.save({ session });
        }
      }

      transaction.status = TransactionStatus.FAILED;
      await transaction.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        transaction,
      };
    } catch (error: any) {
      await session.abortTransaction();
      return {
        success: false,
        error: error.message,
      };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get transaction history with pagination and filters
   */
  static async getTransactionHistory(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      category?: TransactionCategory;
      status?: TransactionStatus;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    const filter: any = { user: userId };

    if (options.category) {
      filter.category = options.category;
    }
    if (options.status) {
      filter.status = options.status;
    }
    if (options.startDate || options.endDate) {
      filter.createdAt = {};
      if (options.startDate) {
        filter.createdAt.$gte = options.startDate;
      }
      if (options.endDate) {
        filter.createdAt.$lte = options.endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WalletTransaction.countDocuments(filter),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get transaction by reference
   */
  static async getTransactionByReference(reference: string) {
    return WalletTransaction.findOne({ reference });
  }

  /**
   * Get wallet balance and account info
   */
  static async getWalletInfo(walletId: string) {
    const wallet = await WalletAccount.findById(walletId);
    if (!wallet) {
      return null;
    }

    return {
      id: wallet._id,
      balance: wallet.balance,
      tier: wallet.tier,
      kycStatus: wallet.kycStatus,
      dailyLimit: wallet.dailyLimit,
      monthlyLimit: wallet.monthlyLimit,
      dailySpent: wallet.dailySpent,
      monthlySpent: wallet.monthlySpent,
      isActive: wallet.isActive,
      isBlocked: wallet.isBlocked,
      lastTransactionDate: wallet.lastTransactionDate,
    };
  }

  /**
   * Update wallet spending limits
   */
  static async updateSpendingLimits(walletId: string, daily: number, monthly: number) {
    const wallet = await WalletAccount.findByIdAndUpdate(
      walletId,
      {
        dailyLimit: daily,
        monthlyLimit: monthly,
      },
      { new: true }
    );

    return wallet;
  }

  /**
   * Reset daily spending counter (called at midnight)
   */
  static async resetDailySpending(walletId: string) {
    const wallet = await WalletAccount.findByIdAndUpdate(
      walletId,
      {
        dailySpent: 0,
        lastSpentReset: new Date(),
      },
      { new: true }
    );

    return wallet;
  }

  /**
   * Reset monthly spending counter (called on first day of month)
   */
  static async resetMonthlySpending(walletId: string) {
    const wallet = await WalletAccount.findByIdAndUpdate(
      walletId,
      {
        monthlySpent: 0,
        lastSpentReset: new Date(),
      },
      { new: true }
    );

    return wallet;
  }
}

export default WalletTransactionService;
