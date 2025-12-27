const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const { checkAuth } = require('../middleware/auth');

router.use(checkAuth);

router.get('/expenses-by-category', AnalyticsController.getExpensesByCategory);
router.get('/monthly-cashflow', AnalyticsController.getMonthlyCashFlow);
router.get('/net-worth', AnalyticsController.getNetWorth);
router.get('/spending-trends', AnalyticsController.getSpendingTrends);
router.get('/budget-comparison', AnalyticsController.getBudgetComparison);

module.exports = router;