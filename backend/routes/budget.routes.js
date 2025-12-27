const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');
const { checkAuth } = require('../middleware/auth');

router.use(checkAuth);

router.get('/', BudgetController.getAll);
router.get('/period/:periodKey', BudgetController.getByPeriod);
router.post('/', BudgetController.create);
router.put('/:id', BudgetController.update);
router.delete('/:id', BudgetController.delete);
router.post('/carry-over/:periodKey', BudgetController.processCarryOver);

module.exports = router;