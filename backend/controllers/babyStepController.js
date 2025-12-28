const BabyStepService = require('../services/babyStepService');

class BabyStepController {
  static async getProgress(req, res) {
    try {
      const userId = req.user.id;
      const progress = await BabyStepService.calculateCurrentStep(userId);
      res.json({ success: true, data: progress });
    } catch (error) {
      logger.error('Get progress error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getGazelleIntensity(req, res) {
    try {
      const userId = req.user.id;
      const metrics = await BabyStepService.getGazelleIntensity(userId);
      res.json({ success: true, data: metrics });
    } catch (error) {
      logger.error('Gazelle intensity error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getSmallestDebt(req, res) {
    try {
      const userId = req.user.id;
      const smallestDebt = await BabyStepService.getSmallestDebt(userId);

      if (!smallestDebt) {
        return res.json({ success: true, message: 'No debts found - you\'re debt free! 🎉', data: null });
      }

      res.json({ success: true, data: smallestDebt });
    } catch (error) {
      logger.error('Smallest debt error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = BabyStepController;
