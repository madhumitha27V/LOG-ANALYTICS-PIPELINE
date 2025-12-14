/**
 * Analytics Routes
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

// All analytics routes require authentication
router.use(authMiddleware);

// Dashboard overview
router.get('/dashboard', analyticsController.getDashboard);

// Error trends
router.get('/trends', analyticsController.getTrends);

// Service breakdown
router.get('/services', analyticsController.getServiceBreakdown);

// Top errors
router.get('/top-errors', analyticsController.getTopErrors);

module.exports = router;
