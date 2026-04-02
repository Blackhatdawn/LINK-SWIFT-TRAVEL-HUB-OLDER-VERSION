/**
 * WalletNotificationService
 * Handles real-time updates and notifications for wallet events
 * Works with WebSocket connections for live updates
 */

interface BalanceUpdateMessage {
  type: 'balance_update';
  userId: string;
  balance: number;
  currency: string;
  timestamp: Date;
}

interface TransactionNotification {
  type: 'transaction';
  reference: string;
  amount: number;
  direction: 'incoming' | 'outgoing';
  status: 'completed' | 'pending' | 'failed';
  title: string;
  timestamp: Date;
}

interface TransferStatusUpdate {
  type: 'transfer_status';
  reference: string;
  status: 'processing' | 'completed' | 'failed';
  amount: number;
  fee: number;
  timestamp: Date;
}

type WalletNotification = BalanceUpdateMessage | TransactionNotification | TransferStatusUpdate;

class WalletNotificationService {
  private static subscribers: Map<string, Set<(msg: WalletNotification) => void>> = new Map();

  /**
   * Subscribe user to wallet updates
   */
  static subscribe(userId: string, callback: (message: WalletNotification) => void): () => void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }

    const userSubscribers = this.subscribers.get(userId)!;
    userSubscribers.add(callback);

    // Return unsubscribe function
    return () => {
      userSubscribers.delete(callback);
      if (userSubscribers.size === 0) {
        this.subscribers.delete(userId);
      }
    };
  }

  /**
   * Notify balance update
   */
  static notifyBalanceUpdate(userId: string, balance: number, currency: string = 'NGN') {
    const message: BalanceUpdateMessage = {
      type: 'balance_update',
      userId,
      balance,
      currency,
      timestamp: new Date(),
    };

    this.broadcast(userId, message);
  }

  /**
   * Notify transaction
   */
  static notifyTransaction(
    userId: string,
    reference: string,
    amount: number,
    direction: 'incoming' | 'outgoing',
    status: 'completed' | 'pending' | 'failed',
    title: string
  ) {
    const message: TransactionNotification = {
      type: 'transaction',
      reference,
      amount,
      direction,
      status,
      title,
      timestamp: new Date(),
    };

    this.broadcast(userId, message);
  }

  /**
   * Notify transfer status
   */
  static notifyTransferStatus(
    userId: string,
    reference: string,
    status: 'processing' | 'completed' | 'failed',
    amount: number,
    fee: number
  ) {
    const message: TransferStatusUpdate = {
      type: 'transfer_status',
      reference,
      status,
      amount,
      fee,
      timestamp: new Date(),
    };

    this.broadcast(userId, message);
  }

  /**
   * Broadcast message to all subscribers of a user
   */
  private static broadcast(userId: string, message: WalletNotification) {
    const subscribers = this.subscribers.get(userId);
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error('[v0] Error calling notification callback:', error);
        }
      });
    }
  }

  /**
   * Get subscriber count (for monitoring)
   */
  static getSubscriberCount(userId?: string): number {
    if (userId) {
      return this.subscribers.get(userId)?.size || 0;
    }

    let total = 0;
    this.subscribers.forEach((subscribers) => {
      total += subscribers.size;
    });
    return total;
  }

  /**
   * Clear all subscriptions (cleanup)
   */
  static clearAllSubscriptions() {
    this.subscribers.clear();
  }

  /**
   * Get notification message for push/email
   */
  static formatNotificationMessage(notification: WalletNotification): {
    title: string;
    body: string;
  } {
    switch (notification.type) {
      case 'balance_update':
        return {
          title: 'Balance Updated',
          body: `Your wallet balance is now ₦${notification.balance.toLocaleString()}`,
        };

      case 'transaction':
        const direction = notification.direction === 'incoming' ? 'Received' : 'Sent';
        return {
          title: `${direction} ₦${notification.amount.toLocaleString()}`,
          body: `${notification.title} - ${notification.status}`,
        };

      case 'transfer_status':
        const statusMessage = {
          processing: 'is being processed',
          completed: 'has been completed',
          failed: 'has failed',
        };
        return {
          title: `Transfer ${statusMessage[notification.status]}`,
          body: `Ref: ${notification.reference} | Amount: ₦${notification.amount.toLocaleString()}`,
        };

      default:
        return {
          title: 'Wallet Update',
          body: 'Your wallet has been updated',
        };
    }
  }

  /**
   * Format notification for SMS
   */
  static formatSMSNotification(notification: WalletNotification): string {
    switch (notification.type) {
      case 'balance_update':
        return `Linkswift: Balance ₦${notification.balance.toLocaleString()}`;

      case 'transaction':
        return `Linkswift: ${notification.title} - ₦${notification.amount.toLocaleString()} ${notification.status}`;

      case 'transfer_status':
        return `Linkswift: Transfer ₦${notification.amount.toLocaleString()} ${notification.status}. Ref: ${notification.reference}`;

      default:
        return 'Linkswift: Wallet update';
    }
  }

  /**
   * Format notification for email
   */
  static formatEmailNotification(
    notification: WalletNotification
  ): {
    subject: string;
    html: string;
  } {
    switch (notification.type) {
      case 'balance_update':
        return {
          subject: 'Balance Update',
          html: `
            <h2>Balance Updated</h2>
            <p>Your wallet balance is now <strong>₦${notification.balance.toLocaleString()}</strong></p>
            <p>Time: ${notification.timestamp.toLocaleString()}</p>
          `,
        };

      case 'transaction':
        return {
          subject: `${notification.title}`,
          html: `
            <h2>${notification.title}</h2>
            <p><strong>Amount:</strong> ₦${notification.amount.toLocaleString()}</p>
            <p><strong>Direction:</strong> ${notification.direction === 'incoming' ? 'Received' : 'Sent'}</p>
            <p><strong>Status:</strong> ${notification.status}</p>
            <p><strong>Reference:</strong> ${notification.reference}</p>
            <p>Time: ${notification.timestamp.toLocaleString()}</p>
          `,
        };

      case 'transfer_status':
        const statusDescriptions: { [key: string]: string } = {
          processing: 'Your transfer is being processed',
          completed: 'Your transfer has been completed successfully',
          failed: 'Your transfer has failed',
        };
        return {
          subject: `Transfer ${notification.status}`,
          html: `
            <h2>Transfer ${notification.status}</h2>
            <p>${statusDescriptions[notification.status]}</p>
            <p><strong>Amount:</strong> ₦${notification.amount.toLocaleString()}</p>
            <p><strong>Fee:</strong> ₦${notification.fee.toLocaleString()}</p>
            <p><strong>Reference:</strong> ${notification.reference}</p>
            <p>Time: ${notification.timestamp.toLocaleString()}</p>
          `,
        };

      default:
        return {
          subject: 'Wallet Update',
          html: '<p>Your wallet has been updated</p>',
        };
    }
  }

  /**
   * Get in-app notification priority
   */
  static getPriority(notification: WalletNotification): 'high' | 'normal' | 'low' {
    switch (notification.type) {
      case 'balance_update':
        return 'low';

      case 'transaction':
        return notification.status === 'failed' ? 'high' : 'normal';

      case 'transfer_status':
        return notification.status === 'failed' ? 'high' : 'normal';

      default:
        return 'normal';
    }
  }
}

export default WalletNotificationService;
