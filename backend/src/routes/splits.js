const express = require('express');
const router = express.Router();
const splitController = require('../controllers/splitController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Create new split
router.post('/', splitController.createSplit);

// Get all splits for current user
router.get('/', splitController.getMySplits);

// Get debt summary
router.get('/summary', splitController.getDebtSummary);

// Get split details
router.get('/:id', splitController.getSplitDetails);

// Update split
router.put('/:id', splitController.updateSplit);

// Delete split
router.delete('/:id', splitController.deleteSplit);

// Settle member payment
router.post('/:id/settle', splitController.settleMemberPayment);

module.exports = router;
