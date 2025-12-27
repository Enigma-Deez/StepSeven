const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { startOfMonth, endOfMonth, subMonths, parseISO } = require('../utils/dateUtils');

class AnalyticsController {
  /**
   * Get expenses by category for a date range
   * GET /api/analytics/expenses-by-category
   */
  static async getExpensesByCategory(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      const start = startDate || subMonths(new Date(), 1).toISOString();
      const end = endDate || new Date().toISOString();

      const result = await Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            type: 'EXPENSE',
            date: { $gte: start, $lte: end }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo'
          }
        },
        {
          $unwind: '$categoryInfo'
        },
        {
          $group: {
            _id: '$category',
            categoryName: { $first: '$categoryInfo.name' },
            categoryIcon: { $first: '$categoryInfo.icon' },
            categoryColor: { $first: '$categoryInfo.color' },
            totalAmount: { $sum: '$amount' },
            transactionCount: { $sum: 1 }
          }
        },
        {
          $sort: { totalAmount: -1 }
        }
      ]);

      // Calculate total for percentages
      const total = result.reduce((sum, item) => sum + item.totalAmount, 0);

      const dataWithPercentages = result.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.totalAmount / total) * 100).toFixed(2) : 0
      }));

      res.json({
        success: true,
        data: dataWithPercentages,
        total,
        period: { start, end }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get monthly cash flow (Income vs Expenses)
   * GET /api/analytics/monthly-cashflow
   */
  static async getMonthlyCashFlow(req, res) {
    try {
      const userId = req.user.id;
      const { months = 6 } = req.query;

      const startDate = subMonths(new Date(), parseInt(months)).toISOString();
      const endDate = new Date().toISOString();

      const result = await Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            type: { $in: ['INCOME', 'EXPENSE'] },
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $addFields: {
            yearMonth: { $substr: ['$date', 0, 7] } // Extract "YYYY-MM"
          }
        },
        {
          $group: {
            _id: {
              yearMonth: '$yearMonth',
              type: '$type'
            },
            totalAmount: { $sum: '$amount' }
          }
        },
        {
          $group: {
            _id: '$_id.yearMonth',
            income: {
              $sum: {
                $cond: [{ $eq: ['$_id.type', 'INCOME'] }, '$totalAmount', 0]
              }
            },
            expense: {
              $sum: {
                $cond: [{ $eq: ['$_id.type', 'EXPENSE'] }, '$totalAmount', 0]
              }
            }
          }
        },
        {
          $addFields: {
            netCashFlow: { $subtract: ['$income', '$expense'] },
            savingsRate: {
              $cond: [
                { $gt: ['$income', 0] },
                { $multiply: [{ $divide: [{ $subtract: ['$income', '$expense'] }, '$income'] }, 100] },
                0
              ]
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      res.json({
        success: true,
        data: result,
        period: { start: startDate, end: endDate }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get net worth over time
   * GET /api/analytics/net-worth
   */
  static async getNetWorth(req, res) {
    try {
      const userId = req.user.id;

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

      res.json({
        success: true,
        data: {
          totalAssets,
          totalLiabilities,
          netWorth,
          accountBreakdown: {
            assets: accounts.filter(a => a.type === 'ASSET').map(a => ({
              name: a.name,
              balance: a.balance,
              subType: a.subType
            })),
            liabilities: accounts.filter(a => a.type === 'LIABILITY').map(a => ({
              name: a.name,
              balance: a.balance,
              subType: a.subType
            }))
          }
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get spending trends by day of week
   * GET /api/analytics/spending-trends
   */
  static async getSpendingTrends(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      const start = startDate || subMonths(new Date(), 3).toISOString();
      const end = endDate || new Date().toISOString();

      const result = await Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            type: 'EXPENSE',
            date: { $gte: start, $lte: end }
          }
        },
        {
          $addFields: {
            dayOfWeek: { $dayOfWeek: { $dateFromString: { dateString: '$date' } } }
          }
        },
        {
          $group: {
            _id: '$dayOfWeek',
            totalAmount: { $sum: '$amount' },
            transactionCount: { $sum: 1 },
            avgAmount: { $avg: '$amount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const formattedResult = result.map(item => ({
        dayOfWeek: daysOfWeek[item._id - 1],
        totalAmount: item.totalAmount,
        transactionCount: item.transactionCount,
        avgAmount: Math.round(item.avgAmount)
      }));

      res.json({
        success: true,
        data: formattedResult,
        period: { start, end }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get budget vs actual comparison
   * GET /api/analytics/budget-comparison
   */
  static async getBudgetComparison(req, res) {
    try {
      const userId = req.user.id;
      const { periodKey } = req.query; // e.g., "2025-01"

      if (!periodKey) {
        return res.status(400).json({
          success: false,
          message: 'periodKey is required (e.g., "2025-01")'
        });
      }

      const Budget = require('../models/Budget');

      const budgets = await Budget.find({
        user: userId,
        periodKey,
        isActive: true
      }).populate('category', 'name icon color');

      // Get actual expenses for the period
      const [year, month] = periodKey.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
      const endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1, 1)).toISOString();

      const actualExpenses = await Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            type: 'EXPENSE',
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      // Create a map for quick lookup
      const expenseMap = new Map();
      actualExpenses.forEach(item => {
        expenseMap.set(item._id.toString(), item.totalAmount);
      });

      // Compare budgets with actuals
      const comparison = budgets.map(budget => {
        const actualSpent = expenseMap.get(budget.category._id.toString()) || 0;
        const budgetWithCarryOver = budget.amount + (budget.carryOver.amount || 0);
        const remaining = budgetWithCarryOver - actualSpent;
        const percentUsed = budgetWithCarryOver > 0 
          ? ((actualSpent / budgetWithCarryOver) * 100).toFixed(2)
          : 0;

        return {
          category: budget.category,
          budgeted: budgetWithCarryOver,
          spent: actualSpent,
          remaining,
          percentUsed: parseFloat(percentUsed),
          isOverBudget: actualSpent > budgetWithCarryOver
        };
      });

      res.json({
        success: true,
        data: comparison,
        periodKey
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AnalyticsController;