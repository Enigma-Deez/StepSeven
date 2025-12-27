const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Category = require('../models/Category');
const LedgerService = require('../services/ledgerService');
const PaginationService = require('../services/paginationService');

class TransactionController {
  /**
   * Create a new transaction (INCOME, EXPENSE, or TRANSFER)
   */
  static async createTransaction(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { type, amount, account, toAccount, category, date, description, notes, tags } = req.body;
      const userId = req.user.id;
      const amountKobo = Math.round(Number(amount));

      // 1. Validation Logic
      const accountDoc = await Account.findOne({ _id: account, user: userId }).session(session);
      if (!accountDoc) throw new Error('Source account not found or unauthorized');

      // Handle TRANSFER vs INCOME/EXPENSE
      if (type === 'TRANSFER') {
        if (!toAccount) throw new Error('Destination account required for transfers');
        const toAccountDoc = await Account.findOne({ _id: toAccount, user: userId }).session(session);
        if (!toAccountDoc) throw new Error('Destination account not found');
      } else {
        const categoryDoc = await Category.findOne({ _id: category, user: userId }).session(session);
        if (!categoryDoc) throw new Error('Category required for income/expense');
        if (categoryDoc.type !== type) throw new Error(`Category type mismatch: ${type}`);
      }

      // 2. Create Transaction Record
      const transaction = new Transaction({
        user: userId,
        type, // Must match schema enum: INCOME, EXPENSE, TRANSFER
        amount: amountKobo,
        account,
        toAccount: type === 'TRANSFER' ? toAccount : undefined,
        category: type !== 'TRANSFER' ? category : undefined,
        date: date || new Date(),
        description,
        notes,
        tags
      });

      await transaction.save({ session });

      // 3. Update Balances via Ledger Service
      if (type === 'INCOME') {
        await LedgerService.recordIncome(account, amountKobo, session);
      } else if (type === 'EXPENSE') {
        await LedgerService.recordExpense(account, amountKobo, session);
      } else if (type === 'TRANSFER') {
        await LedgerService.recordTransfer(account, toAccount, amountKobo, session);
      }

      await session.commitTransaction();

      // Populate for response
      await transaction.populate(['account', 'toAccount', 'category']);

      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({ success: false, message: error.message });
    } finally {
      session.endSession();
    }
  }

  /**
   * Update an existing transaction
   * Logic: Reverse old effect -> Save new data -> Apply new effect
   */
  static async updateTransaction(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      const existingTransaction = await Transaction.findOne({ _id: id, user: userId }).session(session);
      if (!existingTransaction) throw new Error('Transaction not found');

      // REVERSE OLD EFFECT FIRST
      await LedgerService.reverseTransaction(existingTransaction, session);

      // APPLY UPDATES TO OBJECT
      if (updates.amount) updates.amount = Math.round(Number(updates.amount));
      Object.assign(existingTransaction, updates);

      await existingTransaction.save({ session });

      // APPLY NEW EFFECT
      const { type, account, toAccount, amount } = existingTransaction;
      if (type === 'INCOME') {
        await LedgerService.recordIncome(account, amount, session);
      } else if (type === 'EXPENSE') {
        await LedgerService.recordExpense(account, amount, session);
      } else if (type === 'TRANSFER') {
        await LedgerService.recordTransfer(account, toAccount, amount, session);
      }

      await session.commitTransaction();
      await existingTransaction.populate(['account', 'toAccount', 'category']);

      res.json({ success: true, data: existingTransaction });
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({ success: false, message: error.message });
    } finally {
      session.endSession();
    }
  }

  /**
   * Delete a transaction
   */
  static async deleteTransaction(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const userId = req.user.id;

      const transaction = await Transaction.findOne({
        _id: id,
        user: userId
      }).session(session);

      if (!transaction) {
        throw new Error('Transaction not found or unauthorized');
      }

      // Reverse the transaction's effect
      await LedgerService.reverseTransaction(transaction, session);

      // Delete the transaction
      await Transaction.deleteOne({ _id: id }).session(session);

      await session.commitTransaction();

      res.json({
        success: true,
        message: 'Transaction deleted successfully'
      });
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      session.endSession();
    }
  }

  /**
   * Get transactions with pagination
   */
  static async getTransactions(req, res) {
    try {
      const userId = req.user.id;
      const { 
        page = 1, 
        limit = 50, 
        type, 
        account, 
        category, 
        startDate, 
        endDate,
        search
      } = req.query;

      // Build filter
      const filter = { user: userId };

      if (type) filter.type = type;
      if (account) filter.account = account;
      if (category) filter.category = category;

      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = startDate;
        if (endDate) filter.date.$lte = endDate;
      }

      if (search) {
        filter.$or = [
          { description: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }

      // Create query
      const query = Transaction.find(filter)
        .populate('account', 'name type subType')
        .populate('category', 'name type icon color')
        .populate('fromAccount', 'name type')
        .populate('toAccount', 'name type')
        .sort({ date: -1, createdAt: -1 });

      // Paginate
      const result = await PaginationService.paginate(query, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get a single transaction
   */
  static async getTransaction(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const transaction = await Transaction.findOne({
        _id: id,
        user: userId
      })
        .populate('account')
        .populate('category')
        .populate('fromAccount')
        .populate('toAccount');

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = TransactionController;