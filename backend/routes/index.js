// Master Router
// ============================================================

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'StepSeven API Phase 1 - Health OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;