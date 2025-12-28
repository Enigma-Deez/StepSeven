const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Progress = require('../models/Progress');
const DateUtils = require('../utils/dateUtils');
const logger = require('../utils/logger');

class BabyStepService {
  /**
   * Calculate and update user's current Baby Step
   */
  static async calculateCurrentStep(userId) {
    let progress = await Progress.findOne({ user: userId });
    
    if (!progress) {
      progress = new Progress({ user: userId });
    }

    // Get all user accounts
    const accounts = await Account.find({ user: userId, isActive: true });

    // STEP 1: Check starter emergency fund
    const emergencyAccounts = accounts.filter(acc => 
      acc.type === 'ASSET' && 
      (acc.subType === 'BANK' || acc.subType === 'CASH') &&
      acc.name.toLowerCase().includes('emergency')
    );

    const emergencyTotal = emergencyAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    progress.step1.currentAmount = emergencyTotal;

    if (emergencyTotal >= progress.step1.targetAmount && !progress.step1.completed) {
      progress.step1.completed = true;
      progress.step1.completedDate = new Date().toISOString();
      progress.currentStep = 2;
      logger.info(`User ${userId} completed Baby Step 1!`);
    }

    // STEP 2: Debt Snowball
    const liabilityAccounts = accounts.filter(acc => 
      acc.type === 'LIABILITY' && 
      acc.subType !== 'INITIAL_BALANCE' &&
      acc.balance > 0
    );

    const sortedDebts = liabilityAccounts
      .map(acc => ({
        accountId: acc._id,
        name: acc.name,
        originalBalance: acc.loanDetails?.originalAmount || acc.balance,
        currentBalance: acc.balance,
        minimumPayment: acc.loanDetails?.minimumPayment || 0,
        isPaidOff: acc.balance <= 0
      }))
      .sort((a, b) => a.currentBalance - b.currentBalance)
      .map((debt, index) => ({ ...debt, order: index + 1 }));

    progress.step2.debts = sortedDebts;
    progress.step2.totalDebtRemaining = sortedDebts.reduce((sum, d) => sum + d.currentBalance, 0);

    if (progress.step1.completed && progress.step2.totalDebtRemaining === 0 && !progress.step2.completed) {
      progress.step2.completed = true;
      progress.step2.completedDate = new Date().toISOString();
      progress.currentStep = 3;
      logger.info(`User ${userId} completed Baby Step 2!`);
    }

    // STEP 3: Full emergency fund
    if (progress.step2.completed) {
      const avgMonthlyExpense = await this.calculateAverageMonthlyExpense(userId);
      progress.step3.targetAmount = avgMonthlyExpense * progress.step3.monthsOfExpenses;
      progress.step3.currentAmount = emergencyTotal;

      if (emergencyTotal >= progress.step3.targetAmount && !progress.step3.completed) {
        progress.step3.completed = true;
        progress.step3.completedDate = new Date().toISOString();
        progress.currentStep = 4;
        logger.info(`User ${userId} completed Baby Step 3!`);
      }
    }

    progress.lastCalculated = new Date().toISOString();
    await progress.save();

    return progress;
  }

  /**
   * Calculate average monthly expense from last 6 months
   */
  static async calculateAverageMonthlyExpense(userId) {
    const sixMonthsAgo = DateUtils.subMonths(new Date(), 6).toISOString();
    const now = new Date().toISOString();

    const result = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'EXPENSE',
          date: { $gte: sixMonthsAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: '$amount' }
        }
      }
    ]);

    if (result.length === 0) return 0;

    const totalExpense = result[0].totalExpense;
    return Math.round(totalExpense / 6);
  }

  /**
   * Get Gazelle Intensity metrics
   */
  static async getGazelleIntensity(userId) {
    const accounts = await Account.find({ 
      user: userId, 
      type: 'ASSET',
      subType: { $in: ['CASH', 'BANK'] },
      isActive: true 
    });

    const totalLiquid = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const startOfCurrentMonth = DateUtils.startOfMonth(new Date()).toISOString();
    const now = new Date().toISOString();

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startOfCurrentMonth, $lte: now },
      type: { $in: ['INCOME', 'EXPENSE'] }
    });

    const monthlyIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const unallocated = monthlyIncome - monthlyExpense;

    return {
      unallocated,
      totalLiquid,
      monthlyIncome,
      monthlyExpense,
      shouldThrowAtDebt: unallocated > 0
    };
  }

  /**
   * Get smallest debt for snowball
   */
  static async getSmallestDebt(userId) {
    const progress = await Progress.findOne({ user: userId });
    if (!progress || progress.step2.debts.length === 0) return null;

    const smallestDebt = progress.step2.debts
      .filter(d => !d.isPaidOff)
      .sort((a, b) => a.currentBalance - b.currentBalance)[0];

    return smallestDebt;
  }
}

module.exports = BabyStepService;