const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

class AnalyticsController {
  static async getExpensesByCategory(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      const start = startDate || DateUtils.subMonths(new Date(), 1).toISOString();
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
        { $unwind: '$categoryInfo' },
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
        { $sort: { totalAmount: -1 } }
      ]);

      const total = result.reduce((sum, item) => sum + item.totalAmount, 0);
      const dataWithPercentages = result.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.totalAmount / total) * 100).toFixed(2) : 0
      }));

      res.json({ success: true, data: dataWithPercentages, total, period: { start, end } });
    } catch (error) {
      logger.error('Analytics error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getMonthlyCashFlow(req, res) {
    try {
      const userId = req.user.id;
      const { months = 6 } = req.query;

      const startDate = DateUtils.subMonths(new Date(), parseInt(months)).toISOString();
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
            yearMonth: { $substr: ['$date', 0, 7] }
          }
        },
        {
          $group: {
            _id: { yearMonth: '$yearMonth', type: '$type' },
            totalAmount: { $sum: '$amount' }
          }
        },
        {
          $group: {
            _id: '$_id.yearMonth',
            income: {
              $sum: { $cond: [{ $eq: ['$_id.type', 'INCOME'] }, '$totalAmount', 0] }
            },
            expense: {
              $sum: { $cond: [{ $eq: ['$_id.type', 'EXPENSE'] }, '$totalAmount', 0] }
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
        { $sort: { _id: 1 } }
      ]);

      res.json({ success: true, data: result, period: { start: startDate, end: endDate } });
    } catch (error) {
      logger.error('Cash flow error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = AnalyticsController;
