/**
 * Log Controller
 * Handles log ingestion and retrieval
 */

const Log = require('../models/Log');
const { maskSensitiveData } = require('../utils/dataMasking');
const { generateLogHash, findDuplicate } = require('../utils/deduplication');
const { analyzeError } = require('../services/aiService');
const { emitNewError } = require('../services/socketService');

/**
 * POST /api/logs - Ingest new log
 */
exports.ingestLog = async (req, res) => {
    try {
        const { timestamp, service, level, message, userId, metadata } = req.body;
        
        // Validation
        if (!timestamp || !service || !level || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: timestamp, service, level, message'
            });
        }
        
        if (!['INFO', 'WARN', 'ERROR'].includes(level)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid level. Must be INFO, WARN, or ERROR'
            });
        }
        
        // Mask sensitive data
        const maskedData = maskSensitiveData({ message, metadata });
        
        // Generate hash for deduplication
        const hash = generateLogHash({ service, level, message: maskedData.message });
        
        // Check for duplicate ERROR logs
        const duplicate = await findDuplicate(Log, hash, level);
        
        if (duplicate) {
            // Increment duplicate count
            duplicate.duplicateCount += 1;
            duplicate.timestamp = new Date(timestamp); // Update to latest occurrence
            await duplicate.save();
            
            return res.status(200).json({
                success: true,
                message: 'Duplicate log detected, count updated',
                logId: duplicate._id,
                duplicateCount: duplicate.duplicateCount
            });
        }
        
        // Create new log
        const log = new Log({
            timestamp: new Date(timestamp),
            service,
            level,
            message: maskedData.message,
            userId,
            metadata: maskedData.metadata,
            hash,
            masked: true
        });
        
        await log.save();
        
        // If ERROR, trigger AI analysis asynchronously
        if (level === 'ERROR') {
            // Don't await - run in background
            analyzeError(log._id).then(analysis => {
                // Emit to websocket clients
                const io = req.app.get('io');
                if (io) {
                    io.emit('ai:analysis-complete', {
                        logId: log._id,
                        analysis
                    });
                }
            }).catch(err => {
                console.error('AI analysis failed:', err.message);
            });
            
            // Emit new error via websocket
            emitNewError({
                _id: log._id,
                timestamp: log.timestamp,
                service: log.service,
                message: log.message
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Log ingested successfully',
            logId: log._id
        });
        
    } catch (error) {
        console.error('Log ingestion error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /api/logs - Get logs with filtering
 */
exports.getLogs = async (req, res) => {
    try {
        const {
            level,
            service,
            startDate,
            endDate,
            page = 1,
            limit = 50
        } = req.query;
        
        // Build query
        const query = {};
        
        if (level) query.level = level;
        if (service) query.service = service;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }
        
        // Execute query with pagination
        const logs = await Log.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await Log.countDocuments(query);
        
        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /api/logs/:id - Get specific log with AI analysis
 */
exports.getLogById = async (req, res) => {
    try {
        const log = await Log.findById(req.params.id);
        
        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Log not found'
            });
        }
        
        res.json({
            success: true,
            data: log
        });
        
    } catch (error) {
        console.error('Get log error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /api/logs/:id/analyze - Trigger AI analysis for a specific error log
 */
exports.analyzeLog = async (req, res) => {
    try {
        const analysis = await analyzeError(req.params.id);
        
        if (!analysis) {
            return res.status(400).json({
                success: false,
                message: 'Log not found or not an ERROR log'
            });
        }
        
        res.json({
            success: true,
            data: analysis
        });
        
    } catch (error) {
        console.error('Analyze log error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
