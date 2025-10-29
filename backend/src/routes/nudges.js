const express = require('express');
const router = express.Router();
const nudgeController = require('../controllers/nudgeController');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

router.get('/settings', nudgeController.getNudgeSettings);
router.put('/settings', nudgeController.updateNudgeSettings);
router.post('/toggle', nudgeController.toggleNudges);
router.post('/push-token', nudgeController.updatePushToken);

module.exports = router;
