const User = require('../models/User');
const logger = require('../utils/logger');

class UserController {
  /**
   * Update user profile
   * PUT /api/users/profile
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, preferences } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update allowed fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (preferences) {
        user.preferences = {
          ...user.preferences,
          ...preferences
        };
      }

      await user.save();

      logger.info(`Profile updated: ${user.email}`);

      res.json({
        success: true,
        data: user.getPublicProfile(),
        message: 'Profile updated successfully'
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Change password
   * PUT /api/users/password
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide current and new password'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters'
        });
      }

      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed: ${user.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update currency
   * PUT /api/users/currency
   */
  static async updateCurrency(req, res) {
    try {
      const userId = req.user.id;
      const { code, symbol, subunitName, subunitToUnit } = req.body;

      if (!code || !symbol || !subunitName || !subunitToUnit) {
        return res.status(400).json({
          success: false,
          message: 'All currency fields are required'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.currency = {
        code: code.toUpperCase(),
        symbol,
        subunitName,
        subunitToUnit
      };

      await user.save();

      logger.info(`Currency updated: ${user.email} to ${code}`);

      res.json({
        success: true,
        data: user.getPublicProfile(),
        message: 'Currency updated successfully'
      });
    } catch (error) {
      logger.error('Update currency error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete account
   * DELETE /api/users/account
   */
  static async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to delete account'
        });
      }

      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password'
        });
      }

      // Soft delete
      user.isActive = false;
      user.email = `deleted_${Date.now()}_${user.email}`;
      await user.save();

      logger.warn(`Account deleted: ${userId}`);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      logger.error('Delete account error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = UserController;