const Account = require('../models/Account');

class LedgerService {
  /**
   * Apply transaction to account balance
   * ASSETS: Debit (+) increases, Credit (-) decreases
   * LIABILITIES: Credit (+) increases debt, Debit (-) decreases debt
   */
  static async applyTransaction(accountId, amount, isDebit, session = null) {
    if (!accountId) throw new Error('Account ID is required for ledger update');
    
    const account = await Account.findById(accountId).session(session);
    if (!account) throw new Error(`Account ${accountId} not found`);

    let balanceChange = 0;

    // Normalizing logic for Nigerian personal finance
    if (account.type === 'ASSET') {
      // Asset (Cash/Bank): Getting money (Debit) is PLUS
      balanceChange = isDebit ? amount : -amount;
    } 
    else if (account.type === 'LIABILITY') {
      // Liability (Loan/Credit Card): Spending (Credit) increases what you owe
      // Note: We store debt as a positive number in the UI for Ramsey's Snowball, 
      // but you can flip this if you prefer negative representation.
      balanceChange = isDebit ? -amount : amount;
    } 
    else if (account.type === 'EQUITY') {
      balanceChange = isDebit ? -amount : amount;
    }

    account.balance += balanceChange;
    
    // Prevent negative balances on Cash/Bank accounts if desired:
    // if (account.type === 'ASSET' && account.balance < 0) {
    //   throw new Error(`Insufficient funds in ${account.name}`);
    // }

    await account.save({ session });
    return account.balance;
  }

  static async recordIncome(accountId, amount, session = null) {
    // Income into an account is always a Debit to that account
    return await this.applyTransaction(accountId, amount, true, session);
  }

  static async recordExpense(accountId, amount, session = null) {
    // Expense out of an account is always a Credit to that account
    return await this.applyTransaction(accountId, amount, false, session);
  }

  static async recordTransfer(fromAccountId, toAccountId, amount, session = null) {
    // Credit source (money leaves)
    await this.applyTransaction(fromAccountId, amount, false, session);
    // Debit destination (money arrives)
    await this.applyTransaction(toAccountId, amount, true, session);
  }

  static async reverseTransaction(transaction, session = null) {
    const { type, account, fromAccount, toAccount, amount } = transaction;

    if (type === 'INCOME') {
      // Reverse Income: Credit the account (take it back)
      await this.applyTransaction(account, amount, false, session);
    } 
    else if (type === 'EXPENSE') {
      // Reverse Expense: Debit the account (put it back)
      await this.applyTransaction(account, amount, true, session);
    } 
    else if (type === 'TRANSFER') {
      // Reverse Transfer: Debit the source (put back), Credit destination (take out)
      // Use fromAccount/toAccount if available, otherwise fallback to 'account'
      const source = fromAccount || account;
      await this.applyTransaction(source, amount, true, session);
      await this.applyTransaction(toAccount, amount, false, session);
    }
  }
}

module.exports = LedgerService;