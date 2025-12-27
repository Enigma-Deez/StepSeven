const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { checkAuth } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimiter');
const {
  validateProfileUpdate,
  validatePasswordChange
} = require('../middleware/validation');

// All routes require authentication
router.use(checkAuth);

// Profile management
router.put('/profile', writeLimiter, validateProfileUpdate, UserController.updateProfile);
router.put('/password', writeLimiter, validatePasswordChange, UserController.changePassword);
router.put('/currency', writeLimiter, UserController.updateCurrency);

// Account deletion
router.delete('/account', writeLimiter, UserController.deleteAccount);

module.exports = router;