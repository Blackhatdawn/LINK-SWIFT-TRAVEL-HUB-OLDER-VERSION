import mongoose from 'mongoose';
import WalletAccount from '../models/WalletAccount';
import WalletTransaction from '../models/WalletTransaction';
import Beneficiary from '../models/Beneficiary';
import WalletTransactionService from './walletTransactionService';
import {
  TIER_CONFIG,
  FEE_STRUCTURE,
  TransactionCategory,
  TransactionType,
  TransactionDirection,
  TransactionStatus,
  WALLET_ERROR_MESSAGES,
} from '../constants/walletConstants';

/**
 * P2PTransferService
 * Handles peer-to-peer money transfer operations
 */

interface P2PTransferRequest {
  senderUserId: string;
  beneficiaryId: string;
  amount: number;
  description?: string;
  idempotencyKey?: string;
  otpCode?: string; // In production, would validate against OTP service
}

interface P2PTransferResult {
  success: boolean;
  transaction?: any;
  error?: string;
  estimatedFee?: number;
  estimatedNetAmount?: number;
}

class P2PTransferService {
  /**
   * Validate transfer can proceed
   */
  static async validateTransfer(request: P2PTransferRequest): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      // 1. Check sender wallet exists and is active
      const senderWallet = await WalletAccount.findOne({ user: request.senderUserId });
      if (!senderWallet) {
        return { valid: false, error: 'Sender wallet not found' };
      }

      if (!senderWallet.isActive) {
        return { valid: false, error: 'Sender wallet is not active' };
      }

      if (senderWallet.isBlocked) {
        return { valid: false, error: WALLET_ERROR_MESSAGES.ACCOUNT_BLOCKED };
      }

      // 2. Check beneficiary exists and belongs to sender
      const beneficiary = await Beneficiary.findOne({
        _id: request.beneficiaryId,
        user: request.senderUserId,
        isDeleted: false,
      });

      if (!beneficiary) {
        return { valid: false, error: 'Beneficiary not found' };
      }

      // 3. Validate amount
      if (request.amount <= 0) {
        return { valid: false, error: 'Amount must be greater than 0' };
      }

      if (request.amount > 10000000) {
        return { valid: false, error: 'Amount exceeds maximum transfer limit' };
      }

      // 4. Calculate fee
      const fee = WalletTransactionService.calculateFee(TransactionCategory.P2P, request.amount);
      const totalDebit = request.amount + fee;

      // 5. Check balance
      if (senderWallet.balance < totalDebit) {
        return { valid: false, error: WALLET_ERROR_MESSAGES.INSUFFICIENT_BALANCE };
      }

      // 6. Check tier limits
      const tierConfig = TIER_CONFIG[senderWallet.tier];
      if (request.amount > tierConfig.dailyLimit) {
        return {
          valid: false,
          error: `Transfer amount exceeds your daily limit of ₦${tierConfig.dailyLimit.toLocaleString()}`,
        };
      }

      // 7. Check KYC requirement
      if (request.amount > 500000 && senderWallet.kycStatus !== 'verified') {
        return {
          valid: false,
          error: 'KYC verification required for transfers over ₦500,000',
        };
      }

      // 8. Check spending limits
      if (senderWallet.dailySpent + request.amount > senderWallet.dailyLimit) {
        const remaining = senderWallet.dailyLimit - senderWallet.dailySpent;
        return {
          valid: false,
          error: `Insufficient daily limit remaining. Available: ₦${remaining.toLocaleString()}`,
        };
      }

      if (senderWallet.monthlySpent + request.amount > senderWallet.monthlyLimit) {
        const remaining = senderWallet.monthlyLimit - senderWallet.monthlySpent;
        return {
          valid: false,
          error: `Insufficient monthly limit remaining. Available: ₦${remaining.toLocaleString()}`,
        };
      }

      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Estimate transfer fee and net amount
   */
  static estimateFee(amount: number): {
    fee: number;
    netAmount: number;
  } {
    const fee = WalletTransactionService.calculateFee(TransactionCategory.P2P, amount);
    return {
      fee,
      netAmount: amount - fee,
    };
  }

  /**
   * Execute P2P transfer
   */
  static async executeTransfer(request: P2PTransferRequest): Promise<P2PTransferResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Validate transfer
      const validation = await this.validateTransfer(request);
      if (!validation.valid) {
        await session.abortTransaction();
        return {
          success: false,
          error: validation.error,
        };
      }

      // 2. Get sender and beneficiary details
      const senderWallet = await WalletAccount.findOne({ user: request.senderUserId }).session(session);
      const beneficiary = await Beneficiary.findById(request.beneficiaryId).session(session);
      const senderUser = await WalletAccount.findOne({ user: request.senderUserId }).session(session);

      if (!senderWallet || !beneficiary || !senderUser) {
        throw new Error('Required data not found');
      }

      // 3. Calculate fee
      const fee = WalletTransactionService.calculateFee(TransactionCategory.P2P, request.amount);
      const totalDebit = request.amount + fee;
      const netAmount = request.amount - fee;

      // 4. Generate reference
      const reference = WalletTransactionService.generateReference(TransactionCategory.P2P);

      // 5. Debit sender account
      senderWallet.balance -= totalDebit;
      senderWallet.dailySpent = (senderWallet.dailySpent || 0) + request.amount;
      senderWallet.monthlySpent = (senderWallet.monthlySpent || 0) + request.amount;
      senderWallet.lastTransactionDate = new Date();
      senderWallet.totalTransactionCount = (senderWallet.totalTransactionCount || 0) + 1;

      await senderWallet.save({ session });

      // 6. Create debit transaction (sender)
      const debitTransaction = new WalletTransaction({
        wallet: senderWallet._id,
        user: request.senderUserId,
        amount: request.amount,
        type: TransactionType.DEBIT,
        category: TransactionCategory.P2P,
        title: `Transfer to ${beneficiary.firstName} ${beneficiary.lastName}`,
        description: request.description || `P2P transfer to ${beneficiary.accountNumber}`,
        direction: TransactionDirection.OUTGOING,
        reference,
        fee,
        feePercentage: FEE_STRUCTURE[TransactionCategory.P2P].percentage,
        netAmount,
        recipientName: `${beneficiary.firstName} ${beneficiary.lastName}`,
        recipientPhone: beneficiary.phone,
        recipientAccount: beneficiary.accountNumber,
        idempotencyKey: request.idempotencyKey,
        status: TransactionStatus.COMPLETED, // P2P transfers are instant in this system
        metadata: {
          beneficiaryId: beneficiary._id,
          bankCode: beneficiary.bankCode,
          bankName: beneficiary.bankName,
        },
      });

      await debitTransaction.save({ session });

      // 7. Credit beneficiary account (if internal transfer)
      // In production, this would go through a payment gateway
      const creditTransaction = new WalletTransaction({
        wallet: senderWallet._id, // Placeholder - in production would be beneficiary's wallet
        user: request.senderUserId, // Placeholder
        amount: request.amount,
        type: TransactionType.CREDIT,
        category: TransactionCategory.P2P,
        title: `Transfer from ${senderUser ? 'User' : 'External'}`,
        description: request.description || `P2P transfer received`,
        direction: TransactionDirection.INCOMING,
        reference: `RCT-${reference}`, // Receipt reference
        fee: 0,
        netAmount: request.amount,
        senderName: `Sender`, // Would be actual user name
        recipientPhone: beneficiary.phone,
        idempotencyKey: request.idempotencyKey ? `${request.idempotencyKey}-credit` : undefined,
        status: TransactionStatus.COMPLETED,
        metadata: {
          originalReference: reference,
          beneficiaryId: beneficiary._id,
        },
      });

      await creditTransaction.save({ session });

      // 8. Update beneficiary usage
      beneficiary.transactionCount = (beneficiary.transactionCount || 0) + 1;
      beneficiary.totalTransferred = (beneficiary.totalTransferred || 0) + request.amount;
      beneficiary.lastUsedDate = new Date();
      await beneficiary.save({ session });

      // 9. Commit transaction
      await session.commitTransaction();

      return {
        success: true,
        transaction: {
          reference,
          amount: request.amount,
          fee,
          netAmount,
          beneficiary: {
            id: beneficiary._id,
            name: `${beneficiary.firstName} ${beneficiary.lastName}`,
            phone: beneficiary.phone,
            accountNumber: beneficiary.accountNumber,
          },
          timestamp: new Date(),
          status: 'completed',
        },
        estimatedFee: fee,
        estimatedNetAmount: netAmount,
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
   * Get transfer status by reference
   */
  static async getTransferStatus(reference: string) {
    const transaction = await WalletTransaction.findOne({ reference });
    if (!transaction) {
      return null;
    }

    return {
      reference,
      status: transaction.status,
      amount: transaction.amount,
      fee: transaction.fee,
      netAmount: transaction.netAmount,
      timestamp: transaction.createdAt,
      recipientName: transaction.recipientName,
      recipientPhone: transaction.recipientPhone,
    };
  }

  /**
   * Cancel pending transfer
   */
  static async cancelTransfer(reference: string, userId: string): Promise<P2PTransferResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transaction = await WalletTransaction.findOne({ reference }).session(session);

      if (!transaction) {
        throw new Error('Transfer not found');
      }

      if (transaction.user.toString() !== userId) {
        throw new Error('Not authorized to cancel this transfer');
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new Error(`Cannot cancel transfer with status: ${transaction.status}`);
      }

      // Refund the amount
      const wallet = await WalletAccount.findById(transaction.wallet).session(session);
      if (wallet) {
        wallet.balance += transaction.amount + transaction.fee;
        await wallet.save({ session });
      }

      // Update transaction
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
}

export default P2PTransferService;
