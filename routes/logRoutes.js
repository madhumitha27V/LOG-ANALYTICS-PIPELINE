/**
 * Log Routes
 */

const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const authMiddleware = require('../middleware/auth');

// Ingest log (no auth required - for external services)
router.post('/', logController.ingestLog);

// Get logs (protected)
router.get('/', authMiddleware, logController.getLogs);

// Get specific log
router.get('/:id', authMiddleware, logController.getLogById);

// Analyze specific log
router.get('/:id/analyze', authMiddleware, logController.analyzeLog);

module.exports = router;
