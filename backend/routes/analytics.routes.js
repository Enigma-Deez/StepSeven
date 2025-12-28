const express = require('express');
const analyticsRouter = express.Router(); // Change 'router' to 'analyticsRouter'
const { checkAuth } = require('../middleware/auth');
const AnalyticsController = require('../controllers/analyticsController');

analyticsRouter.use(checkAuth);

analyticsRouter.get('/expenses-by-category', AnalyticsController.getExpensesByCategory);
analyticsRouter.get('/monthly-cashflow', AnalyticsController.getMonthlyCashFlow);

module.exports = analyticsRouter;