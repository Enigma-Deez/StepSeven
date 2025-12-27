const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { getMonthlyPeriodKey } = require('../utils/dateUtils');

class BudgetController {
  /**
   * Get all budgets for a user
   * GET /api/budgets
   */
  static async getAll(req, res) {
    try {
      const userId = req.user.id;
      const { periodKey } = req.query;

      const filter = { user: userId, isActive: true };
      if (periodKey) filter.periodKey = periodKey;

      const budgets = await Budget.find(filter)
        .populate('category', 'name icon color')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: budgets
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get budgets for a specific period
   * GET /api/budgets/period/:periodKey
   */
  static async getByPeriod(req, res) {
    try {
      const userId = req.user.id;
      const { periodKey } = req.params;

      const budgets = await Budget.find({
        user: userId,
        periodKey,
        isActive: true
      }).populate('category', 'name icon color');

      // Calculate spent amounts for each budget
      const [year, month] = periodKey.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59).toISOString();

      const expenses = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'EXPENSE',
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$category',
            totalSpent: { $sum: '$amount' }
          }
        }
      ]);

      const expenseMap = new Map(expenses.map(e => [e._id.toString(), e.totalSpent]));

      const budgetsWithSpent = budgets.map(budget => {
        const spent = expenseMap.get(budget.category._id.toString()) || 0;
        return {
          ...budget.toObject(),
          spent,
          remaining: (budget.amount + budget.carryOver.amount) - spent,
          percentUsed: budget.amount > 0 ? ((spent / budget.amount) * 100).toFixed(2) : 0
        };
      });

      res.json({
        success: true,
        data: budgetsWithSpent,
        periodKey
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create a new budget
   * POST /api/budgets
   */
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const budgetData = {
        ...req.body,
        user: userId,
        amount: parseInt(req.body.amount)
      };

      // Validate category belongs to user
      const category = await Category.findOne({
        _id: budgetData.category,
        user: userId
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found or unauthorized'
        });
      }

      const budget = await Budget.create(budgetData);
      await budget.populate('category');

      res.status(201).json({
        success: true,
        data: budget,
        message: 'Budget created successfully'
      });
    } catch (error) {
      // Handle duplicate budget for same category/period
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Budget already exists for this category and period'
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update a budget
   * PUT /api/budgets/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      if (updates.amount) {
        updates.amount = parseInt(updates.amount);
      }

      const budget = await Budget.findOneAndUpdate(
        { _id: id, user: userId },
        updates,
        { new: true, runValidators: true }
      ).populate('category');

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found'
        });
      }

      res.json({
        success: true,
        data: budget,
        message: 'Budget updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete a budget
   * DELETE /api/budgets/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const budget = await Budget.findOne({ _id: id, user: userId });

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found'
        });
      }

      budget.isActive = false;
      await budget.save();

      res.json({
        success: true,
        message: 'Budget deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Process carry-over from previous period
   * POST /api/budgets/carry-over/:periodKey
   */
  static async processCarryOver(req, res) {
    try {
      const userId = req.user.id;
      const { periodKey } = req.params; // e.g., "2025-02"

      // Get previous period key
      const [year, month] = periodKey.split('-');
      const prevMonth = parseInt(month) === 1 ? 12 : parseInt(month) - 1;
      const prevYear = parseInt(month) === 1 ? parseInt(year) - 1 : parseInt(year);
      const prevPeriodKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

      // Get previous period budgets
      const prevBudgets = await Budget.find({
        user: userId,
        periodKey: prevPeriodKey,
        isActive: true,
        'carryOver.enabled': true
      });

      // Get current period budgets
      const currentBudgets = await Budget.find({
        user: userId,
        periodKey,
        isActive: true
      });

      const updates = [];

      for (const prevBudget of prevBudgets) {
        const remaining = prevBudget.amount - prevBudget.spent;
        
        if (remaining > 0) {
          const currentBudget = currentBudgets.find(
            b => b.category.equals(prevBudget.category)
          );

          if (currentBudget) {
            currentBudget.carryOver.amount = remaining;
            await currentBudget.save();
            updates.push({
              category: prevBudget.category,
              carriedOver: remaining
            });
          }
        }
      }

      res.json({
        success: true,
        message: `Carried over ${updates.length} budget(s)`,
        data: updates
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = BudgetController;