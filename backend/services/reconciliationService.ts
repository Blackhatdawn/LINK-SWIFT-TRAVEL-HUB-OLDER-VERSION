import WalletAccount from '../models/WalletAccount';
import WalletTransaction from '../models/WalletTransaction';
import { TransactionStatus, TransactionType } from '../constants/walletConstants';

/**
 * ReconciliationService
 * Handles daily balance reconciliation and discrepancy detection
 */

interface ReconciliationResult {
  walletId: string;
  recordedBalance: number;
  calculatedBalance: number;
  discrepancy: number;
  status: 'matched' | 'discrepancy';
  transactionCount: number;
  totalDebits: number;
  totalCredits: number;
  timestamp: Date;
}

interface ReconciliationReport {
  reportDate: Date;
  totalWallets: number;
  matchedWallets: number;
  discrepancyWallets: number;
  totalDiscrepancy: number;
  results: ReconciliationResult[];
  duration: number; // milliseconds
}

class ReconciliationService {
  /**
   * Reconcile a single wallet
   */
  static async reconcileWallet(walletId: string): Promise<ReconciliationResult> {
    try {
      const wallet = await WalletAccount.findById(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Get recorded balance
      const recordedBalance = wallet.balance;

      // Calculate balance from transactions
      const transactions = await WalletTransaction.find({
        wallet: walletId,
        status: TransactionStatus.COMPLETED,
      });

      let calculatedBalance = 0;
      let totalDebits = 0;
      let totalCredits = 0;

      for (const transaction of transactions) {
        if (transaction.type === TransactionType.CREDIT) {
          calculatedBalance += transaction.amount;
          totalCredits += transaction.amount;
        } else if (transaction.type === TransactionType.DEBIT) {
          calculatedBalance -= transaction.amount;
          totalDebits += transaction.amount;
        }
      }

      const discrepancy = Math.abs(recordedBalance - calculatedBalance);
      const status = discrepancy === 0 ? 'matched' : 'discrepancy';

      return {
        walletId: walletId.toString(),
        recordedBalance,
        calculatedBalance,
        discrepancy,
        status,
        transactionCount: transactions.length,
        totalDebits,
        totalCredits,
        timestamp: new Date(),
      };
    } catch (error: any) {
      throw new Error(`Reconciliation failed for wallet ${walletId}: ${error.message}`);
    }
  }

  /**
   * Reconcile all wallets (daily batch job)
   */
  static async reconcileAllWallets(): Promise<ReconciliationReport> {
    const startTime = Date.now();
    const reportDate = new Date();

    try {
      const wallets = await WalletAccount.find().select('_id').lean();
      const results: ReconciliationResult[] = [];

      let matchedCount = 0;
      let discrepancyCount = 0;
      let totalDiscrepancy = 0;

      // Process wallets in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < wallets.length; i += batchSize) {
        const batch = wallets.slice(i, i + batchSize);

        const batchResults = await Promise.all(
          batch.map((wallet: any) => this.reconcileWallet(wallet._id))
        );

        for (const result of batchResults) {
          results.push(result);

          if (result.status === 'matched') {
            matchedCount++;
          } else {
            discrepancyCount++;
            totalDiscrepancy += result.discrepancy;
          }
        }
      }

      const duration = Date.now() - startTime;

      return {
        reportDate,
        totalWallets: wallets.length,
        matchedWallets: matchedCount,
        discrepancyWallets: discrepancyCount,
        totalDiscrepancy,
        results,
        duration,
      };
    } catch (error: any) {
      throw new Error(`Batch reconciliation failed: ${error.message}`);
    }
  }

  /**
   * Fix discrepancy by resetting balance to calculated amount
   */
  static async fixDiscrepancy(walletId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.reconcileWallet(walletId);

      if (result.status === 'matched') {
        return {
          success: true,
          message: 'Wallet is already balanced',
        };
      }

      // Update wallet balance to calculated value
      const wallet = await WalletAccount.findByIdAndUpdate(
        walletId,
        { balance: result.calculatedBalance },
        { new: true }
      );

      return {
        success: true,
        message: `Balance corrected from ₦${result.recordedBalance} to ₦${result.calculatedBalance}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Detect and flag suspended/pending transactions
   */
  static async checkSuspendedTransactions() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find transactions that have been pending for more than 30 minutes
    const suspendedTransactions = await WalletTransaction.find({
      status: TransactionStatus.PENDING,
      createdAt: { $lt: thirtyMinutesAgo },
    }).lean();

    return {
      count: suspendedTransactions.length,
      transactions: suspendedTransactions.map((t: any) => ({
        id: t._id,
        reference: t.reference,
        amount: t.amount,
        pendingSince: t.createdAt,
        age: Date.now() - new Date(t.createdAt).getTime(),
      })),
    };
  }

  /**
   * Get reconciliation history for a wallet
   */
  static async getWalletReconciliationHistory(walletId: string, limit: number = 30) {
    // In production, would store reconciliation results in a separate collection
    // For now, we'll calculate the last N reconciliations on demand
    const results: ReconciliationResult[] = [];

    // Get today's result
    try {
      const todayResult = await this.reconcileWallet(walletId);
      results.push(todayResult);
    } catch (error) {
      // Wallet might not exist
    }

    return results;
  }

  /**
   * Generate reconciliation report
   */
  static async generateReport(reportDate?: Date) {
    const date = reportDate || new Date();

    try {
      const report = await this.reconcileAllWallets();

      // Calculate additional metrics
      const discrepancyRate = report.totalWallets > 0 
        ? (report.discrepancyWallets / report.totalWallets) * 100 
        : 0;

      const averageDiscrepancy = report.discrepancyWallets > 0 
        ? report.totalDiscrepancy / report.discrepancyWallets 
        : 0;

      return {
        ...report,
        discrepancyRate: parseFloat(discrepancyRate.toFixed(2)),
        averageDiscrepancy: parseFloat(averageDiscrepancy.toFixed(2)),
        status: discrepancyRate < 0.1 ? 'healthy' : discrepancyRate < 1 ? 'warning' : 'critical',
      };
    } catch (error: any) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  /**
   * Get wallets with discrepancies
   */
  static async getDiscrepancyWallets() {
    const wallets = await WalletAccount.find().select('_id').lean();
    const discrepancies: ReconciliationResult[] = [];

    for (const wallet of wallets) {
      const result = await this.reconcileWallet(wallet._id);
      if (result.status === 'discrepancy') {
        discrepancies.push(result);
      }
    }

    // Sort by largest discrepancy
    discrepancies.sort((a, b) => b.discrepancy - a.discrepancy);

    return discrepancies;
  }

  /**
   * Verify transaction integrity
   */
  static async verifyTransactionIntegrity(transactionId: string) {
    try {
      const transaction = await WalletTransaction.findById(transactionId);
      if (!transaction) {
        return { valid: false, error: 'Transaction not found' };
      }

      // Verify transaction references
      if (!transaction.reference) {
        return { valid: false, error: 'Missing transaction reference' };
      }

      // Verify wallet exists
      const wallet = await WalletAccount.findById(transaction.wallet);
      if (!wallet) {
        return { valid: false, error: 'Associated wallet not found' };
      }

      // Verify user exists
      if (!transaction.user) {
        return { valid: false, error: 'Missing user reference' };
      }

      // Verify amount is valid
      if (transaction.amount <= 0) {
        return { valid: false, error: 'Invalid transaction amount' };
      }

      // Verify fee is reasonable
      if (transaction.fee < 0) {
        return { valid: false, error: 'Invalid fee amount' };
      }

      // Verify net amount calculation
      const expectedNetAmount = transaction.type === TransactionType.DEBIT 
        ? transaction.amount - transaction.fee 
        : transaction.amount;
      
      if (transaction.netAmount !== expectedNetAmount) {
        return { valid: false, error: 'Net amount mismatch' };
      }

      return {
        valid: true,
        transaction: {
          reference: transaction.reference,
          amount: transaction.amount,
          fee: transaction.fee,
          status: transaction.status,
        },
      };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get reconciliation health check
   */
  static async getHealthCheck() {
    try {
      const wallets = await WalletAccount.countDocuments();
      const transactions = await WalletTransaction.countDocuments();
      const pendingTransactions = await WalletTransaction.countDocuments({
        status: TransactionStatus.PENDING,
      });

      const failedTransactions = await WalletTransaction.countDocuments({
        status: 'failed',
      });

      const blockedWallets = await WalletAccount.countDocuments({
        isBlocked: true,
      });

      const avgWalletBalance = await WalletAccount.aggregate([
        {
          $group: {
            _id: null,
            avgBalance: { $avg: '$balance' },
            totalBalance: { $sum: '$balance' },
          },
        },
      ]);

      return {
        status: 'healthy',
        timestamp: new Date(),
        metrics: {
          totalWallets: wallets,
          totalTransactions: transactions,
          pendingTransactions,
          failedTransactions,
          failureRate: wallets > 0 ? (failedTransactions / transactions) * 100 : 0,
          blockedWallets,
          averageWalletBalance: avgWalletBalance[0]?.avgBalance || 0,
          totalBalance: avgWalletBalance[0]?.totalBalance || 0,
        },
      };
    } catch (error: any) {
      return {
        status: 'error',
        timestamp: new Date(),
        error: error.message,
      };
    }
  }
}

export default ReconciliationService;
