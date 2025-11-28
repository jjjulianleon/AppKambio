const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/insights/analyze
router.post('/analyze', authenticateToken, insightController.getMonthlyInsight);

module.exports = router;
