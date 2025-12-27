const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Progress = require('../models/Progress');
const mongoose = require('mongoose');
const { startOfMonth, subMonths } = require('../utils/dateUtils');

class BabyStepService {
  /**
   * Calculate and update user's current Baby Step progress
   */
  static async calculateCurrentStep(userId) {
    let progress = await Progress.findOne({ user: userId });
    if (!progress) progress = new Progress({ user: userId });

    const accounts = await Account.find({ user: userId });

    // --- STEP 1: Starter Emergency Fund ---
    // Instead of just checking names, we look for ASSETS that are liquid
    const emergencyTotal = accounts
      .filter(acc => acc.type === 'ASSET' && ['BANK', 'CASH', 'SAVINGS'].includes(acc.subType))
      .reduce((sum, acc) => sum + acc.balance, 0);

    progress.step1.currentAmount = emergencyTotal;
    
    // Auto-complete Step 1 if target hit
    if (emergencyTotal >= progress.step1.targetAmount && !progress.step1.completed) {
      progress.step1.completed = true;
      progress.step1.completedDate = new Date();
    }

    // --- STEP 2: Debt Snowball ---
    const debts = accounts
      .filter(acc => acc.type === 'LIABILITY' && acc.balance > 0)
      .map(acc => ({
        accountId: acc._id,
        name: acc.name,
        currentBalance: acc.balance,
        minimumPayment: acc.minimumPayment || 0,
        isPaidOff: acc.balance <= 0
      }))
      .sort((a, b) => a.currentBalance - b.currentBalance); // Smallest to Largest

    progress.step2.debts = debts;
    progress.step2.totalDebtRemaining = debts.reduce((sum, d) => sum + d.currentBalance, 0);

    if (progress.step1.completed && progress.step2.totalDebtRemaining === 0) {
      progress.step2.completed = true;
      if (!progress.step2.completedDate) progress.step2.completedDate = new Date();
    }

    // --- STEP 3: Full Emergency Fund ---
    if (progress.step2.completed) {
      const avgMonthlyExpense = await this.calculateAverageMonthlyExpense(userId);
      // Ramsey suggests 3-6 months; we'll use the user's preference or default to 6
      const months = progress.step3.monthsOfExpenses || 6;
      progress.step3.targetAmount = avgMonthlyExpense * months;
      progress.step3.currentAmount = emergencyTotal;

      if (emergencyTotal >= progress.step3.targetAmount) {
        progress.step3.completed = true;
        if (!progress.step3.completedDate) progress.step3.completedDate = new Date();
      }
    }

    // Update Overall Current Step
    if (!progress.step1.completed) progress.currentStep = 1;
    else if (!progress.step2.completed) progress.currentStep = 2;
    else if (!progress.step3.completed) progress.currentStep = 3;
    else progress.currentStep = 4;

    progress.lastCalculated = new Date();
    await progress.save();
    return progress;
  }

  /**
   * Calculate real average monthly expense over the last 3-6 months
   */
  static async calculateAverageMonthlyExpense(userId) {
    const lookbackMonths = 3;
    const startDate = subMonths(new Date(), lookbackMonths);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          type: 'EXPENSE',
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const total = result.length > 0 ? result[0].total : 0;
    return Math.round(total / lookbackMonths);
  }

  /**
   * Gazelle Intensity: The "Secret Sauce"
   * Shows how much Naira is left this month to "attack" the debt
   */
  static async getGazelleIntensity(userId) {
    const start = startOfMonth(new Date());
    
    const stats = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: start }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const income = stats.find(s => s._id === 'INCOME')?.total || 0;
    const expense = stats.find(s => s._id === 'EXPENSE')?.total || 0;
    const remaining = income - expense;

    return {
      monthlySurplus: remaining, // This is what goes to the debt snowball
      gazelleRank: remaining > 0 ? 'HIGH' : 'LOW',
      message: remaining > 0 
        ? `You have ₦${(remaining/100).toLocaleString()} extra this month. Throw it at your smallest debt!` 
        : "Every kobo counts. Look for expenses to cut!"
    };
  }
}

module.exports = BabyStepService;