const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { checkAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validateRegistration,
  validateLogin
} = require('../middleware/validation');

// Public routes with auth limiter
router.post('/register', authLimiter, validateRegistration, AuthController.register);
router.post('/login', authLimiter, validateLogin, AuthController.login);

// Protected routes
router.post('/logout', checkAuth, AuthController.logout);
router.get('/me', checkAuth, AuthController.getMe);
router.post('/refresh', checkAuth, AuthController.refreshToken);

module.exports = router;