import Beneficiary from '../models/Beneficiary';
import WalletAccount from '../models/WalletAccount';
import { VALIDATION_RULES, WALLET_ERROR_MESSAGES } from '../constants/walletConstants';

/**
 * BeneficiaryService
 * Handles all beneficiary management operations
 */

interface BeneficiaryInput {
  firstName: string;
  lastName: string;
  phone: string;
  accountNumber: string;
  bankCode: string;
  email?: string;
  accountName?: string;
  accountType?: 'personal' | 'business';
  nickname?: string;
  tags?: string[];
}

interface BeneficiaryResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class BeneficiaryService {
  /**
   * Validate phone number format (Nigerian)
   */
  static validatePhone(phone: string): boolean {
    return VALIDATION_RULES.PHONE_REGEX.test(phone);
  }

  /**
   * Validate account number format
   */
  static validateAccountNumber(accountNumber: string): boolean {
    // Remove non-numeric characters
    const cleaned = accountNumber.replace(/\D/g, '');
    return cleaned.length === VALIDATION_RULES.ACCOUNT_NUMBER_LENGTH;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Add a new beneficiary
   */
  static async addBeneficiary(userId: string, input: BeneficiaryInput): Promise<BeneficiaryResponse> {
    try {
      // 1. Validate input
      if (!this.validatePhone(input.phone)) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      if (!this.validateAccountNumber(input.accountNumber)) {
        return {
          success: false,
          error: 'Invalid account number format (must be 10 digits)',
        };
      }

      if (input.email && !this.validateEmail(input.email)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      // 2. Check if beneficiary already exists
      const existing = await Beneficiary.findOne({
        user: userId,
        accountNumber: input.accountNumber,
        bankCode: input.bankCode,
        isDeleted: false,
      });

      if (existing) {
        return {
          success: false,
          error: 'This beneficiary already exists',
        };
      }

      // 3. Check wallet exists
      const wallet = await WalletAccount.findOne({ user: userId });
      if (!wallet) {
        return {
          success: false,
          error: 'Wallet not found',
        };
      }

      // 4. Check max beneficiaries for user's tier
      const beneficiaryCount = await Beneficiary.countDocuments({
        user: userId,
        isDeleted: false,
      });

      const maxBeneficiaries = this.getMaxBeneficiariesForTier(wallet.tier);
      if (beneficiaryCount >= maxBeneficiaries) {
        return {
          success: false,
          error: `Maximum ${maxBeneficiaries} beneficiaries allowed for your tier`,
        };
      }

      // 5. If setting as default, unset other defaults
      let isDefault = false;
      if (input.accountType === 'personal') {
        isDefault = true; // First personal beneficiary is default
      }

      if (isDefault) {
        await Beneficiary.updateMany(
          { user: userId, isDefault: true },
          { isDefault: false }
        );
      }

      // 6. Create beneficiary
      const beneficiary = new Beneficiary({
        user: userId,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim(),
        accountNumber: input.accountNumber.trim(),
        bankCode: input.bankCode,
        accountName: input.accountName?.trim(),
        accountType: input.accountType || 'personal',
        nickname: input.nickname?.trim(),
        tags: input.tags || [],
        isDefault,
        verificationStatus: 'pending', // Auto-verify for now (in production, would be external verification)
        verificationDate: new Date(),
      });

      await beneficiary.save();

      // 7. Update wallet beneficiary count
      wallet.totalBeneficiaries = (wallet.totalBeneficiaries || 0) + 1;
      await wallet.save();

      return {
        success: true,
        data: this.formatBeneficiary(beneficiary),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get beneficiary by ID
   */
  static async getBeneficiary(beneficiaryId: string, userId: string) {
    const beneficiary = await Beneficiary.findOne({
      _id: beneficiaryId,
      user: userId,
      isDeleted: false,
    });

    if (!beneficiary) {
      return null;
    }

    return this.formatBeneficiary(beneficiary);
  }

  /**
   * Get all beneficiaries for a user
   */
  static async getBeneficiaries(userId: string, options: { search?: string; limit?: number } = {}) {
    const filter: any = {
      user: userId,
      isDeleted: false,
    };

    if (options.search) {
      const searchRegex = new RegExp(options.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { phone: searchRegex },
        { nickname: searchRegex },
        { accountNumber: searchRegex },
      ];
    }

    const beneficiaries = await Beneficiary.find(filter)
      .sort({ isDefault: -1, createdAt: -1 })
      .limit(options.limit || 50)
      .lean();

    return beneficiaries.map((b) => this.formatBeneficiary(b as any));
  }

  /**
   * Get default beneficiary
   */
  static async getDefaultBeneficiary(userId: string) {
    const beneficiary = await Beneficiary.findOne({
      user: userId,
      isDefault: true,
      isDeleted: false,
    });

    if (!beneficiary) {
      return null;
    }

    return this.formatBeneficiary(beneficiary);
  }

  /**
   * Update beneficiary
   */
  static async updateBeneficiary(
    beneficiaryId: string,
    userId: string,
    updates: Partial<BeneficiaryInput>
  ): Promise<BeneficiaryResponse> {
    try {
      const beneficiary = await Beneficiary.findOne({
        _id: beneficiaryId,
        user: userId,
        isDeleted: false,
      });

      if (!beneficiary) {
        return {
          success: false,
          error: 'Beneficiary not found',
        };
      }

      // Validate updated fields
      if (updates.phone && !this.validatePhone(updates.phone)) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      if (updates.accountNumber && !this.validateAccountNumber(updates.accountNumber)) {
        return {
          success: false,
          error: 'Invalid account number format',
        };
      }

      if (updates.email && !this.validateEmail(updates.email)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      // Update fields
      Object.assign(beneficiary, updates);
      await beneficiary.save();

      return {
        success: true,
        data: this.formatBeneficiary(beneficiary),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Set as default beneficiary
   */
  static async setAsDefault(beneficiaryId: string, userId: string): Promise<BeneficiaryResponse> {
    try {
      // Unset all other defaults
      await Beneficiary.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false }
      );

      // Set this as default
      const beneficiary = await Beneficiary.findByIdAndUpdate(
        beneficiaryId,
        { isDefault: true },
        { new: true }
      );

      if (!beneficiary) {
        return {
          success: false,
          error: 'Beneficiary not found',
        };
      }

      return {
        success: true,
        data: this.formatBeneficiary(beneficiary),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete beneficiary (soft delete)
   */
  static async deleteBeneficiary(beneficiaryId: string, userId: string): Promise<BeneficiaryResponse> {
    try {
      const beneficiary = await Beneficiary.findOne({
        _id: beneficiaryId,
        user: userId,
        isDeleted: false,
      });

      if (!beneficiary) {
        return {
          success: false,
          error: 'Beneficiary not found',
        };
      }

      // Soft delete
      beneficiary.isDeleted = true;
      beneficiary.deletedAt = new Date();
      if (beneficiary.isDefault) {
        beneficiary.isDefault = false;
      }
      await beneficiary.save();

      // Update wallet
      const wallet = await WalletAccount.findOne({ user: userId });
      if (wallet && wallet.totalBeneficiaries > 0) {
        wallet.totalBeneficiaries -= 1;
        await wallet.save();
      }

      return {
        success: true,
        data: { message: 'Beneficiary deleted successfully' },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search beneficiaries by phone or name
   */
  static async searchBeneficiaries(userId: string, query: string) {
    const searchRegex = new RegExp(query, 'i');

    const beneficiaries = await Beneficiary.find({
      user: userId,
      isDeleted: false,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { phone: searchRegex },
        { nickname: searchRegex },
      ],
    })
      .limit(10)
      .lean();

    return beneficiaries.map((b) => this.formatBeneficiary(b as any));
  }

  /**
   * Get max beneficiaries for tier
   */
  private static getMaxBeneficiariesForTier(tier: number): number {
    const maxBeneficiaries: { [key: number]: number } = {
      1: 10,
      2: 50,
      3: 500,
    };
    return maxBeneficiaries[tier] || 10;
  }

  /**
   * Format beneficiary for response
   */
  private static formatBeneficiary(beneficiary: any) {
    return {
      id: beneficiary._id,
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      fullName: `${beneficiary.firstName} ${beneficiary.lastName}`,
      phone: beneficiary.phone,
      email: beneficiary.email,
      accountNumber: beneficiary.accountNumber,
      accountName: beneficiary.accountName,
      bankCode: beneficiary.bankCode,
      bankName: beneficiary.bankName,
      accountType: beneficiary.accountType,
      nickname: beneficiary.nickname,
      tags: beneficiary.tags,
      isDefault: beneficiary.isDefault,
      verificationStatus: beneficiary.verificationStatus,
      transactionCount: beneficiary.transactionCount,
      lastUsedDate: beneficiary.lastUsedDate,
      createdAt: beneficiary.createdAt,
    };
  }
}

export default BeneficiaryService;
