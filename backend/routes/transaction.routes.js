const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const TransferController = require('../controllers/transferController');
const { checkAuth } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimiter');

router.use(checkAuth);

router.get('/', TransactionController.getTransactions);
router.get('/:id', TransactionController.getTransaction);
router.post('/', writeLimiter, TransactionController.createTransaction);
router.put('/:id', writeLimiter, TransactionController.updateTransaction);
router.delete('/:id', writeLimiter, TransactionController.deleteTransaction);

router.post('/transfer', writeLimiter, TransferController.createTransfer);
router.put('/transfer/:id', writeLimiter, TransferController.updateTransfer);
router.delete('/transfer/:id', writeLimiter, TransferController.deleteTransfer);

module.exports = router;
