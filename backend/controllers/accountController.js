const Account = require('../models/Account');

class AccountController {
  /**
   * Get all accounts for the authenticated user
   * GET /api/accounts
   */
  static async getAll(req, res) {
    try {
      const userId = req.user.id;
      
      const accounts = await Account.find({ 
        user: userId 
      }).sort({ order: 1, createdAt: 1 });

      // Group accounts by type
      const grouped = {
        assets: accounts.filter(acc => acc.type === 'ASSET'),
        liabilities: accounts.filter(acc => acc.type === 'LIABILITY'),
        equity: accounts.filter(acc => acc.type === 'EQUITY')
      };

      // Calculate totals
      const totals = {
        assets: grouped.assets.reduce((sum, acc) => sum + (acc.includeInTotal ? acc.balance : 0), 0),
        liabilities: grouped.liabilities.reduce((sum, acc) => sum + (acc.includeInTotal ? acc.balance : 0), 0)
      };
      totals.netWorth = totals.assets - totals.liabilities;

      res.json({
        success: true,
        data: accounts,
        grouped,
        totals
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get a single account
   * GET /api/accounts/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const account = await Account.findOne({
        _id: id,
        user: userId
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create a new account
   * POST /api/accounts
   */
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const accountData = {
        ...req.body,
        user: userId
      };

      // Validate initial balance for new accounts
      if (accountData.balance && accountData.balance !== 0) {
        accountData.balance = parseInt(accountData.balance);
      }

      const account = await Account.create(accountData);

      res.status(201).json({
        success: true,
        data: account,
        message: 'Account created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update an account
   * PUT /api/accounts/:id
   * Note: Balance should NOT be updated directly - use transactions
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      // Prevent direct balance updates via this endpoint
      if (updates.balance !== undefined) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update balance directly. Use transactions instead.'
        });
      }

      const account = await Account.findOneAndUpdate(
        { _id: id, user: userId },
        updates,
        { new: true, runValidators: true }
      );

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      res.json({
        success: true,
        data: account,
        message: 'Account updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete (soft delete) an account
   * DELETE /api/accounts/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const account = await Account.findOne({ _id: id, user: userId });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      // Soft delete by setting isActive to false
      account.isActive = false;
      await account.save();

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AccountController;