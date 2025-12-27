const BabyStepService = require('../services/babyStepService');
const Progress = require('../models/Progress');

class BabyStepController {
  /**
   * Get user's current Baby Step progress
   * GET /api/babysteps/progress
   */
  static async getProgress(req, res) {
    try {
      const userId = req.user.id;
      
      // Calculate and get latest progress
      const progress = await BabyStepService.calculateCurrentStep(userId);

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Force recalculation of Baby Step progress
   * POST /api/babysteps/recalculate
   */
  static async recalculate(req, res) {
    try {
      const userId = req.user.id;
      
      const progress = await BabyStepService.calculateCurrentStep(userId);

      res.json({
        success: true,
        message: 'Progress recalculated',
        data: progress
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update Baby Step targets (e.g., emergency fund amount)
   * PUT /api/babysteps/targets
   */
  static async updateTargets(req, res) {
    try {
      const userId = req.user.id;
      const { step1Target, step3Months } = req.body;

      let progress = await Progress.findOne({ user: userId });
      if (!progress) {
        progress = new Progress({ user: userId });
      }

      if (step1Target) {
        progress.step1.targetAmount = parseInt(step1Target);
      }

      if (step3Months) {
        progress.step3.monthsOfExpenses = parseInt(step3Months);
      }

      await progress.save();

      // Recalculate after updating targets
      await BabyStepService.calculateCurrentStep(userId);

      res.json({
        success: true,
        message: 'Targets updated',
        data: progress
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get "Gazelle Intensity" metrics
   * GET /api/babysteps/gazelle-intensity
   */
  static async getGazelleIntensity(req, res) {
    try {
      const userId = req.user.id;
      
      const metrics = await BabyStepService.getGazelleIntensity(userId);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get smallest debt for Debt Snowball
   * GET /api/babysteps/smallest-debt
   */
  static async getSmallestDebt(req, res) {
    try {
      const userId = req.user.id;
      
      const smallestDebt = await BabyStepService.getSmallestDebt(userId);

      if (!smallestDebt) {
        return res.json({
          success: true,
          message: 'No debts found - you\'re debt free! 🎉',
          data: null
        });
      }

      res.json({
        success: true,
        data: smallestDebt
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Mark a Baby Step as manually completed (for steps 4-7)
   * POST /api/babysteps/mark-complete/:step
   */
  static async markStepComplete(req, res) {
    try {
      const userId = req.user.id;
      const { step } = req.params;
      const stepNumber = parseInt(step);

      if (stepNumber < 4 || stepNumber > 7) {
        return res.status(400).json({
          success: false,
          message: 'Can only manually mark steps 4-7'
        });
      }

      let progress = await Progress.findOne({ user: userId });
      if (!progress) {
        progress = new Progress({ user: userId });
      }

      const stepKey = `step${stepNumber}`;
      progress[stepKey].active = true;
      
      if (stepNumber > progress.currentStep) {
        progress.currentStep = stepNumber;
      }

      await progress.save();

      res.json({
        success: true,
        message: `Baby Step ${stepNumber} marked as active`,
        data: progress
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = BabyStepController;