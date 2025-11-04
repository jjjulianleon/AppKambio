const express = require('express');
const router = express.Router();
const poolController = require('../controllers/poolController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/pools/current
 * @desc    Get current pool data (members, requests, user savings)
 * @access  Private
 */
router.get('/current', poolController.getPoolData);

/**
 * @route   GET /api/pools/members
 * @desc    Get all members of the user's pool
 * @access  Private
 */
router.get('/members', poolController.getPoolMembers);

/**
 * @route   GET /api/pools/requests/active
 * @desc    Get all active requests in the pool
 * @access  Private
 */
router.get('/requests/active', poolController.getActiveRequests);

/**
 * @route   GET /api/pools/requests/completed
 * @desc    Get completed requests history
 * @access  Private
 */
router.get('/requests/completed', poolController.getCompletedRequests);

/**
 * @route   GET /api/pools/requests/my
 * @desc    Get user's own requests
 * @access  Private
 */
router.get('/requests/my', poolController.getMyRequests);

/**
 * @route   POST /api/pools/requests
 * @desc    Create a new funding request
 * @access  Private
 */
router.post('/requests', poolController.createRequest);

/**
 * @route   POST /api/pools/requests/:requestId/contribute
 * @desc    Contribute to a funding request
 * @access  Private
 */
router.post('/requests/:requestId/contribute', poolController.contributeToRequest);

/**
 * @route   GET /api/pools/requests/:requestId/calculate-contribution
 * @desc    Calculate the contribution amount for a request
 * @access  Private
 */
router.get('/requests/:requestId/calculate-contribution', poolController.calculateContribution);

/**
 * @route   DELETE /api/pools/requests/:requestId
 * @desc    Delete a request and refund all contributions
 * @access  Private (only requester can delete)
 */
router.delete('/requests/:requestId', poolController.deleteRequest);

module.exports = router;
