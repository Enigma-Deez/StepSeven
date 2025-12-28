const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const DateUtils = require('../utils/dateUtils');

class BudgetService {
  /**
   * Update spent amount for a budget
   */
  static async updateBudgetSpent(userId, categoryId, periodKey) {
    const budget = await Budget.findOne({
      user: userId,
      category: categoryId,
      periodKey,
      isActive: true
    });

    if (!budget) return;

    const { startDate, endDate } = this.getPeriodDates(periodKey);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          category: categoryId,
          type: 'EXPENSE',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    budget.spent = result.length > 0 ? result[0].totalSpent : 0;
    await budget.save();

    return budget;
  }

  /**
   * Get period dates from periodKey
   */
  static getPeriodDates(periodKey) {
    const [year, month] = periodKey.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
    const endDate = DateUtils.endOfMonth(new Date(parseInt(year), parseInt(month) - 1, 1)).toISOString();
    
    return { startDate, endDate };
  }

  /**
   * Process carry-over from previous period
   */
  static async processCarryOver(userId, periodKey) {
    const [year, month] = periodKey.split('-');
    const prevMonth = parseInt(month) === 1 ? 12 : parseInt(month) - 1;
    const prevYear = parseInt(month) === 1 ? parseInt(year) - 1 : parseInt(year);
    const prevPeriodKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const prevBudgets = await Budget.find({
      user: userId,
      periodKey: prevPeriodKey,
      isActive: true,
      'carryOver.enabled': true
    });

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

    return updates;
  }
}

module.exports = BudgetService;
