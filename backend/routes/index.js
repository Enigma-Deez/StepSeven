const express = require('express');
const masterRouter = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const accountRoutes = require('./account.routes');
const categoryRoutes = require('./category.routes');

// Mount routes
masterRouter.use('/auth', authRoutes);
masterRouter.use('/users', userRoutes);
masterRouter.use('/accounts', accountRoutes);
masterRouter.use('/categories', categoryRoutes);

// Health check
masterRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'StepSeven API Phase 2 - Health OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    phase: 'Financial Foundation'
  });
});

module.exports = masterRouter;