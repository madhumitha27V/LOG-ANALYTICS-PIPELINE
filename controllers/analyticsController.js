/**
 * Analytics Controller
 * Provides aggregated analytics and statistics
 */

const Log = require('../models/Log');
const AnalyticsSummary = require('../models/AnalyticsSummary');

/**
 * GET /api/analytics/dashboard - Get dashboard overview
 */
exports.getDashboard = async (req, res) => {
    try {
        // Total counts
        const totalLogs = await Log.countDocuments();
        const errorCount = await Log.countDocuments({ level: 'ERROR' });
        const warnCount = await Log.countDocuments({ level: 'WARN' });
        const infoCount = await Log.countDocuments({ level: 'INFO' });
        
        // Error rate
        const errorRate = totalLogs > 0 ? ((errorCount / totalLogs) * 100).toFixed(2) : 0;
        
        // Recent errors with AI analysis
        const recentErrors = await Log.find({ level: 'ERROR' })
            .sort({ timestamp: -1 })
            .limit(10)
            .select('timestamp service message aiAnalysis duplicateCount');
        
        // Latest summary
        const latestSummary = await AnalyticsSummary.findOne()
            .sort({ periodEnd: -1 });
        
        res.json({
            success: true,
            data: {
                totalLogs,
                errorCount,
                warnCount,
                infoCount,
                errorRate,
                recentErrors,
                latestSummary
            }
        });
        
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /api/analytics/trends - Get error trends over time
 */
exports.getTrends = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        
        // Aggregate by day
        const trends = await Log.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                        level: '$level'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.date': 1 }
            }
        ]);
        
        res.json({
            success: true,
            data: trends
        });
        
    } catch (error) {
        console.error('Trends error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /api/analytics/services - Get service breakdown
 */
exports.getServiceBreakdown = async (req, res) => {
    try {
        const breakdown = await Log.aggregate([
            {
                $group: {
                    _id: '$service',
                    total: { $sum: 1 },
                    errors: {
                        $sum: { $cond: [{ $eq: ['$level', 'ERROR'] }, 1, 0] }
                    },
                    warnings: {
                        $sum: { $cond: [{ $eq: ['$level', 'WARN'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    service: '$_id',
                    total: 1,
                    errors: 1,
                    warnings: 1,
                    errorRate: {
                        $multiply: [
                            { $divide: ['$errors', '$total'] },
                            100
                        ]
                    }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);
        
        res.json({
            success: true,
            data: breakdown
        });
        
    } catch (error) {
        console.error('Service breakdown error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /api/analytics/top-errors - Get most common errors
 */
exports.getTopErrors = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const topErrors = await Log.aggregate([
            {
                $match: { level: 'ERROR' }
            },
            {
                $group: {
                    _id: {
                        service: '$service',
                        message: { $substr: ['$message', 0, 100] }
                    },
                    count: { $sum: '$duplicateCount' },
                    lastSeen: { $max: '$timestamp' },
                    hasAIAnalysis: { $max: { $ifNull: ['$aiAnalysis.rootCause', false] } }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);
        
        res.json({
            success: true,
            data: topErrors
        });
        
    } catch (error) {
        console.error('Top errors error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
