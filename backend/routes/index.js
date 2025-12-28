const express = require('express');
const mongoose = require('mongoose');
const masterRouter = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const accountRoutes = require('./account.routes');
const categoryRoutes = require('./category.routes');
const transactionRoutes = require('./transaction.routes');
const budgetRoutes = require('./budget.routes');
const analyticsRoutes = require('./analytics.routes');
const babyStepRoutes = require('./babyStep.routes');

masterRouter.use('/auth', authRoutes);
masterRouter.use('/users', userRoutes);
masterRouter.use('/accounts', accountRoutes);
masterRouter.use('/categories', categoryRoutes);
masterRouter.use('/transactions', transactionRoutes);
masterRouter.use('/budgets', budgetRoutes);
masterRouter.use('/analytics', analyticsRoutes);
masterRouter.use('/babysteps', babyStepRoutes);

masterRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'StepSeven API Phase 3 - Health OK',
    timestamp: new Date().toISOString(),
    phase: 'Activity & Ramsey Intelligence',
    features: ['Transactions', 'Transfers', 'Budgets', 'Analytics', 'Baby Steps']
  });
});

module.exports = masterRouter;