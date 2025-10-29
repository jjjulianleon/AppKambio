const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

router.get('/', transactionController.getAllTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/:id', transactionController.getTransactionById);
router.post('/', transactionController.createTransaction);
router.post('/bulk', transactionController.createBulkTransactions);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
