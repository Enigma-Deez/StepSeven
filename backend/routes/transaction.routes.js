const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const TransferController = require('../controllers/transferController');
const { checkAuth } = require('../middleware/auth');

// All routes require authentication
router.use(checkAuth);

// Regular transactions
router.get('/', TransactionController.getTransactions);
router.get('/:id', TransactionController.getTransaction);
router.post('/', TransactionController.createTransaction);
router.put('/:id', TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

// Transfers
router.post('/transfer', TransferController.createTransfer);
router.put('/transfer/:id', TransferController.updateTransfer);
router.delete('/transfer/:id', TransferController.deleteTransfer);

module.exports = router;
