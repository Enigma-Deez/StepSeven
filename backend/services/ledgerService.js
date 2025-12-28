const Account = require('../models/Account');
const logger = require('../utils/logger');

/**
 * Double-Entry Bookkeeping Service
 * Ensures financial integrity through proper ledger accounting
 */
class LedgerService {
  /**
   * Apply transaction to account balance
   * ASSET accounts: Debit increases, Credit decreases
   * LIABILITY accounts: Credit increases, Debit decreases
   * EQUITY accounts: Credit increases, Debit decreases
   * 
   * @param {String} accountId - Account ID
   * @param {Number} amount - Amount in subunits (e.g., kobo)
   * @param {Boolean} isDebit - True for debit, false for credit
   * @param {Session} session - MongoDB session for transactions
   * @returns {Number} - New balance
   */
  static async applyTransaction(accountId, amount, isDebit, session = null) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error('Amount must be a positive integer');
    }

    const account = await Account.findById(accountId).session(session);
    if (!account) {
      throw new Error('Account not found');
    }

    let balanceChange = 0;

    switch (account.type) {
      case 'ASSET':
        // For assets: Debit increases, Credit decreases
        balanceChange = isDebit ? amount : -amount;
        break;
        
      case 'LIABILITY':
        // For liabilities: Credit increases, Debit decreases
        balanceChange = isDebit ? -amount : amount;
        break;
        
      case 'EQUITY':
        // For equity: Credit increases, Debit decreases
        balanceChange = isDebit ? -amount : amount;
        break;
        
      default:
        throw new Error(`Invalid account type: ${account.type}`);
    }

    const newBalance = account.balance + balanceChange;
    
    // Validate balance constraints
    if (account.type === 'ASSET' && newBalance < 0) {
      throw new Error('Asset account balance cannot be negative');
    }

    account.balance = newBalance;
    await account.save({ session });

    logger.info(`Ledger: ${isDebit ? 'Debit' : 'Credit'} ${amount} to ${account.name} (${account.type}). New balance: ${newBalance}`);

    return newBalance;
  }

  /**
   * Record an INCOME transaction
   * Debit: Asset Account (increases)
   * Credit: Income (implicit - not tracked as account)
   * 
   * @param {String} accountId - Destination account ID
   * @param {Number} amount - Amount in subunits
   * @param {Session} session - MongoDB session
   * @returns {Number} - New balance
   */
  static async recordIncome(accountId, amount, session = null) {
    logger.info(`Recording income: ${amount} to account ${accountId}`);
    return await this.applyTransaction(accountId, amount, true, session);
  }

  /**
   * Record an EXPENSE transaction
   * Debit: Expense (implicit)
   * Credit: Asset Account (decreases)
   * 
   * @param {String} accountId - Source account ID
   * @param {Number} amount - Amount in subunits
   * @param {Session} session - MongoDB session
   * @returns {Number} - New balance
   */
  static async recordExpense(accountId, amount, session = null) {
    logger.info(`Recording expense: ${amount} from account ${accountId}`);
    return await this.applyTransaction(accountId, amount, false, session);
  }

  /**
   * Record a TRANSFER between two accounts
   * Debit: Destination Account
   * Credit: Source Account
   * 
   * @param {String} fromAccountId - Source account ID
   * @param {String} toAccountId - Destination account ID
   * @param {Number} amount - Amount in subunits
   * @param {Session} session - MongoDB session
   */
  static async recordTransfer(fromAccountId, toAccountId, amount, session = null) {
    if (fromAccountId === toAccountId) {
      throw new Error('Cannot transfer to the same account');
    }

    logger.info(`Recording transfer: ${amount} from ${fromAccountId} to ${toAccountId}`);

    // Credit source account (decreases)
    await this.applyTransaction(fromAccountId, amount, false, session);
    
    // Debit destination account (increases)
    await this.applyTransaction(toAccountId, amount, true, session);
  }

  /**
   * Reverse a transaction (for updates/deletes)
   * This undoes the ledger entries
   * 
   * @param {Object} transaction - Transaction document
   * @param {Session} session - MongoDB session
   */
  static async reverseTransaction(transaction, session = null) {
    logger.info(`Reversing transaction: ${transaction._id} (${transaction.type})`);

    switch (transaction.type) {
      case 'INCOME':
        // Reverse income: Credit the account (decrease)
        await this.applyTransaction(transaction.account, transaction.amount, false, session);
        break;
        
      case 'EXPENSE':
        // Reverse expense: Debit the account (increase)
        await this.applyTransaction(transaction.account, transaction.amount, true, session);
        break;
        
      case 'TRANSFER':
        // Reverse transfer: 
        // Debit source (add back)
        await this.applyTransaction(transaction.fromAccount, transaction.amount, true, session);
        // Credit destination (remove)
        await this.applyTransaction(transaction.toAccount, transaction.amount, false, session);
        break;
        
      default:
        throw new Error(`Cannot reverse unknown transaction type: ${transaction.type}`);
    }
  }

  /**
   * Set initial account balance
   * Used when creating a new account with starting balance
   * 
   * @param {String} accountId - Account ID
   * @param {Number} amount - Initial balance in subunits
   * @param {Session} session - MongoDB session
   */
  static async setInitialBalance(accountId, amount, session = null) {
    if (!Number.isInteger(amount)) {
      throw new Error('Initial balance must be an integer');
    }

    const account = await Account.findById(accountId).session(session);
    if (!account) {
      throw new Error('Account not found');
    }

    account.balance = amount;
    await account.save({ session });

    logger.info(`Set initial balance for ${account.name}: ${amount}`);

    return amount;
  }

  /**
   * Get account balance
   * 
   * @param {String} accountId - Account ID
   * @returns {Number} - Current balance in subunits
   */
  static async getBalance(accountId) {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    return account.balance;
  }

  /**
   * Validate sufficient balance for transaction
   * 
   * @param {String} accountId - Account ID
   * @param {Number} amount - Amount to check
   * @returns {Boolean} - True if sufficient balance
   */
  static async hasSufficientBalance(accountId, amount) {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Only ASSET accounts need balance checks
    if (account.type === 'ASSET') {
      return account.balance >= amount;
    }

    // LIABILITY and EQUITY accounts can have any balance
    return true;
  }

  /**
   * Calculate net worth for a user
   * Net Worth = Total Assets - Total Liabilities
   * 
   * @param {String} userId - User ID
   * @returns {Object} - { assets, liabilities, netWorth }
   */
  static async calculateNetWorth(userId) {
    const accounts = await Account.find({
      user: userId,
      isActive: true,
      includeInTotal: true
    });

    let totalAssets = 0;
    let totalLiabilities = 0;

    accounts.forEach(account => {
      if (account.type === 'ASSET') {
        totalAssets += account.balance;
      } else if (account.type === 'LIABILITY') {
        totalLiabilities += account.balance;
      }
    });

    const netWorth = totalAssets - totalLiabilities;

    logger.info(`Net worth calculated for user ${userId}: Assets=${totalAssets}, Liabilities=${totalLiabilities}, NetWorth=${netWorth}`);

    return {
      assets: totalAssets,
      liabilities: totalLiabilities,
      netWorth
    };
  }
}

module.exports = LedgerService;
