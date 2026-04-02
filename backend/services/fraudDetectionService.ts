import WalletAccount from '../models/WalletAccount';
import WalletTransaction from '../models/WalletTransaction';
import { FRAUD_CONFIG, FraudStatus, TransactionStatus } from '../constants/walletConstants';

/**
 * FraudDetectionService
 * Implements risk scoring and fraud detection for transactions
 */

interface TransactionContext {
  userId: string;
  walletId: string;
  amount: number;
  recipientPhone?: string;
  deviceId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface RiskAssessment {
  riskScore: number;
  fraudStatus: FraudStatus;
  riskFactors: { factor: string; score: number }[];
  recommendation: 'allow' | 'warn' | 'block';
}

class FraudDetectionService {
  /**
   * Assess transaction risk and return fraud status
   */
  static async assessTransactionRisk(context: TransactionContext): Promise<RiskAssessment> {
    const riskFactors: { factor: string; score: number }[] = [];
    let totalScore = 0;

    try {
      // 1. Check transaction amount risk
      const amountRisk = this.assessAmountRisk(context.amount);
      if (amountRisk > 0) {
        riskFactors.push({ factor: 'high_transaction_amount', score: amountRisk });
        totalScore += amountRisk;
      }

      // 2. Check account age
      const wallet = await WalletAccount.findById(context.walletId);
      if (wallet) {
        const ageRisk = this.assessAccountAgeRisk(wallet.createdAt);
        if (ageRisk > 0) {
          riskFactors.push({ factor: 'account_age_low', score: ageRisk });
          totalScore += ageRisk;
        }

        // 3. Check account behavior risk
        const behaviorRisk = await this.assessAccountBehavior(context.userId);
        if (behaviorRisk > 0) {
          riskFactors.push({ factor: 'account_behavior_anomaly', score: behaviorRisk });
          totalScore += behaviorRisk;
        }

        // 4. Check transaction velocity
        const velocityRisk = await this.checkTransactionVelocity(context.userId);
        if (velocityRisk > 0) {
          riskFactors.push({ factor: 'rapid_transactions', score: velocityRisk });
          totalScore += velocityRisk;
        }

        // 5. Check for repeated failures
        const failureRisk = await this.checkRepeatedFailures(context.userId);
        if (failureRisk > 0) {
          riskFactors.push({ factor: 'repeated_failures', score: failureRisk });
          totalScore += failureRisk;
        }

        // 6. Check new beneficiary
        if (context.recipientPhone) {
          const beneficiaryRisk = await this.checkNewBeneficiary(context.userId, context.recipientPhone);
          if (beneficiaryRisk > 0) {
            riskFactors.push({ factor: 'new_beneficiary', score: beneficiaryRisk });
            totalScore += beneficiaryRisk;
          }
        }
      }

      // 7. Determine fraud status based on score
      const fraudStatus = this.determineFraudStatus(totalScore);

      // 8. Update wallet risk score
      if (wallet) {
        wallet.riskScore = Math.min(totalScore, 100);
        wallet.lastRiskAssessment = new Date();
        await wallet.save();
      }

      // 9. Determine recommendation
      const recommendation = this.getRecommendation(totalScore, wallet?.tier || 1);

      return {
        riskScore: Math.min(totalScore, 100),
        fraudStatus,
        riskFactors,
        recommendation,
      };
    } catch (error) {
      console.error('[v0] Fraud detection error:', error);
      // Default to allowing on error (fail open)
      return {
        riskScore: 0,
        fraudStatus: FraudStatus.CLEAR,
        riskFactors: [],
        recommendation: 'allow',
      };
    }
  }

  /**
   * Check if amount is unusually high
   */
  private static assessAmountRisk(amount: number): number {
    if (amount > 5000000) {
      return FRAUD_CONFIG.RISK_FACTORS.HIGH_TRANSACTION_AMOUNT;
    }
    return 0;
  }

  /**
   * Check account age
   */
  private static assessAccountAgeRisk(createdAt: Date): number {
    const ageInDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageInDays < 7) {
      return FRAUD_CONFIG.RISK_FACTORS.ACCOUNT_AGE_LOW;
    }
    return 0;
  }

  /**
   * Assess account behavior patterns
   */
  private static async assessAccountBehavior(userId: string): Promise<number> {
    const wallet = await WalletAccount.findOne({ user: userId });
    if (!wallet) return 0;

    // If never had a transaction, flag as new behavior
    if (!wallet.lastTransactionDate) {
      return FRAUD_CONFIG.RISK_FACTORS.ACCOUNT_AGE_LOW;
    }

    // If account is typically inactive but suddenly active, flag it
    const daysSinceLastTransaction = (Date.now() - new Date(wallet.lastTransactionDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastTransaction > 30 && wallet.totalTransactionCount > 0) {
      return FRAUD_CONFIG.RISK_FACTORS.UNUSUAL_TIME;
    }

    return 0;
  }

  /**
   * Check transaction velocity (rate of transactions)
   */
  private static async checkTransactionVelocity(userId: string): Promise<number> {
    // Check transactions in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const transactionCount = await WalletTransaction.countDocuments({
      user: userId,
      createdAt: { $gte: oneHourAgo },
      type: 'debit',
    });

    if (transactionCount > FRAUD_CONFIG.BLOCK_RULES.MAX_HOURLY_TRANSFERS) {
      return FRAUD_CONFIG.RISK_FACTORS.RAPID_TRANSACTIONS;
    }

    return 0;
  }

  /**
   * Check for repeated failed transactions
   */
  private static async checkRepeatedFailures(userId: string): Promise<number> {
    // Check failed transactions in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const failedCount = await WalletTransaction.countDocuments({
      user: userId,
      createdAt: { $gte: oneHourAgo },
      status: TransactionStatus.FAILED,
    });

    if (failedCount >= FRAUD_CONFIG.BLOCK_RULES.MAX_FAILED_ATTEMPTS) {
      return FRAUD_CONFIG.RISK_FACTORS.REPEATED_FAILURES;
    }

    if (failedCount >= 3) {
      return FRAUD_CONFIG.RISK_FACTORS.MULTIPLE_FAILURES;
    }

    return 0;
  }

  /**
   * Check if beneficiary is new
   */
  private static async checkNewBeneficiary(userId: string, recipientPhone: string): Promise<number> {
    const wallet = await WalletAccount.findOne({ user: userId });
    if (!wallet || wallet.totalBeneficiaries === 0) {
      return FRAUD_CONFIG.RISK_FACTORS.NEW_BENEFICIARY;
    }

    // Check if this beneficiary has been used before
    const previousTransaction = await WalletTransaction.findOne({
      user: userId,
      recipientPhone,
      status: TransactionStatus.COMPLETED,
    });

    if (!previousTransaction) {
      return FRAUD_CONFIG.RISK_FACTORS.NEW_BENEFICIARY;
    }

    return 0;
  }

  /**
   * Determine fraud status based on risk score
   */
  private static determineFraudStatus(riskScore: number): FraudStatus {
    if (riskScore <= FRAUD_CONFIG.RISK_THRESHOLDS.CLEAR) {
      return FraudStatus.CLEAR;
    } else if (riskScore <= FRAUD_CONFIG.RISK_THRESHOLDS.FLAGGED) {
      return FraudStatus.FLAGGED;
    } else {
      return FraudStatus.BLOCKED;
    }
  }

  /**
   * Get recommendation based on risk score and tier
   */
  private static getRecommendation(
    riskScore: number,
    tier: number
  ): 'allow' | 'warn' | 'block' {
    // Tier 3 (verified) accounts have more lenient limits
    if (tier === 3) {
      if (riskScore <= FRAUD_CONFIG.RISK_THRESHOLDS.FLAGGED) {
        return 'allow';
      }
      return 'warn';
    }

    // Tier 1 & 2 are more strict
    if (riskScore <= FRAUD_CONFIG.RISK_THRESHOLDS.CLEAR) {
      return 'allow';
    } else if (riskScore <= FRAUD_CONFIG.RISK_THRESHOLDS.FLAGGED) {
      return 'warn';
    } else {
      return 'block';
    }
  }

  /**
   * Flag transaction for manual review
   */
  static async flagTransaction(transactionId: string, reason: string): Promise<boolean> {
    try {
      const transaction = await WalletTransaction.findByIdAndUpdate(
        transactionId,
        {
          fraudStatus: FraudStatus.FLAGGED,
          metadata: {
            ...(await WalletTransaction.findById(transactionId))?.metadata,
            flagReason: reason,
            flaggedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!transaction) {
        return false;
      }

      // Update wallet risk score
      const wallet = await WalletAccount.findById(transaction.wallet);
      if (wallet) {
        wallet.riskScore = Math.min((wallet.riskScore || 0) + 25, 100);
        await wallet.save();
      }

      return true;
    } catch (error) {
      console.error('[v0] Error flagging transaction:', error);
      return false;
    }
  }

  /**
   * Block transaction and wallet
   */
  static async blockTransaction(transactionId: string, reason: string): Promise<boolean> {
    try {
      const transaction = await WalletTransaction.findByIdAndUpdate(
        transactionId,
        {
          fraudStatus: FraudStatus.BLOCKED,
          status: TransactionStatus.FAILED,
          metadata: {
            ...(await WalletTransaction.findById(transactionId))?.metadata,
            blockReason: reason,
            blockedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!transaction) {
        return false;
      }

      // Block wallet if high risk
      const wallet = await WalletAccount.findById(transaction.wallet);
      if (wallet) {
        wallet.isBlocked = true;
        wallet.blockReason = reason;
        wallet.riskScore = 100;
        await wallet.save();
      }

      return true;
    } catch (error) {
      console.error('[v0] Error blocking transaction:', error);
      return false;
    }
  }

  /**
   * Clear wallet block
   */
  static async clearWalletBlock(walletId: string): Promise<boolean> {
    try {
      await WalletAccount.findByIdAndUpdate(walletId, {
        isBlocked: false,
        blockReason: null,
        riskScore: 0,
      });
      return true;
    } catch (error) {
      console.error('[v0] Error clearing wallet block:', error);
      return false;
    }
  }

  /**
   * Get fraud audit log for wallet
   */
  static async getAuditLog(walletId: string, limit: number = 50) {
    const transactions = await WalletTransaction.find({
      wallet: walletId,
      fraudStatus: { $ne: FraudStatus.CLEAR },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return transactions.map((t: any) => ({
      reference: t.reference,
      amount: t.amount,
      fraudStatus: t.fraudStatus,
      riskScore: t.riskScore,
      timestamp: t.createdAt,
      metadata: t.metadata,
    }));
  }

  /**
   * Get dashboard stats
   */
  static async getDashboardStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalFlagged,
      totalBlocked,
      todayFlagged,
      monthFlagged,
      highRiskWallets,
      averageRiskScore,
    ] = await Promise.all([
      WalletTransaction.countDocuments({ fraudStatus: FraudStatus.FLAGGED }),
      WalletTransaction.countDocuments({ fraudStatus: FraudStatus.BLOCKED }),
      WalletTransaction.countDocuments({
        fraudStatus: FraudStatus.FLAGGED,
        createdAt: { $gte: today },
      }),
      WalletTransaction.countDocuments({
        fraudStatus: FraudStatus.FLAGGED,
        createdAt: { $gte: thisMonth },
      }),
      WalletAccount.countDocuments({ riskScore: { $gte: 50 } }),
      WalletAccount.aggregate([
        {
          $group: {
            _id: null,
            avgRisk: { $avg: '$riskScore' },
          },
        },
      ]),
    ]);

    return {
      totalFlagged,
      totalBlocked,
      todayFlagged,
      monthFlagged,
      highRiskWallets,
      averageRiskScore: averageRiskScore[0]?.avgRisk || 0,
    };
  }
}

export default FraudDetectionService;
