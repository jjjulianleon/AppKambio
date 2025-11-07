const express = require('express');
const router = express.Router();
const battlePassController = require('../controllers/battlePassController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get current battle pass status
router.get('/current', battlePassController.getCurrentBattlePass);

// Get all available rewards
router.get('/rewards', battlePassController.getAllRewards);

// Get user's earned rewards
router.get('/my-rewards', battlePassController.getMyRewards);

// Get active challenges with user progress
router.get('/challenges', battlePassController.getActiveChallenges);

// Get battle pass history (last 12 months)
router.get('/history', battlePassController.getHistory);

// Redeem a reward
router.post('/redeem/:rewardId', battlePassController.redeemReward);

// Get monthly statistics
router.get('/monthly-stats', battlePassController.getMonthlyStats);

// Update savings (internal use, called when Kambio is created)
router.post('/update-savings', battlePassController.updateSavings);

module.exports = router;
