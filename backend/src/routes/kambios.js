const express = require('express');
const router = express.Router();
const kambioController = require('../controllers/kambioController');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

router.get('/', kambioController.getAllKambios);
router.get('/stats', kambioController.getKambioStats);
router.get('/goal/:goalId', kambioController.getKambiosByGoal);
router.post('/', kambioController.createKambio);
router.delete('/:id', kambioController.deleteKambio);

module.exports = router;
