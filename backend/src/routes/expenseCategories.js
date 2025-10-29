const express = require('express');
const router = express.Router();
const expenseCategoryController = require('../controllers/expenseCategoryController');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

router.get('/', expenseCategoryController.getAllCategories);
router.get('/active', expenseCategoryController.getActiveCategories);
router.get('/:id', expenseCategoryController.getCategoryById);
router.post('/', expenseCategoryController.createCategory);
router.post('/bulk', expenseCategoryController.createBulkCategories);
router.put('/:id', expenseCategoryController.updateCategory);
router.delete('/:id', expenseCategoryController.deleteCategory);

module.exports = router;
