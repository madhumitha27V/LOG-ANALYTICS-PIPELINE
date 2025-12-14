/**
 * Batch Processor Service
 * Runs every 5 minutes to aggregate log statistics
 * Stores summaries in AnalyticsSummary collection
 */

const Log = require('../models/Log');
const AnalyticsSummary = require('../models/AnalyticsSummary');
const { emitAnalyticsUpdate } = require('./socketService');

let processingInterval;

/**
 * Start batch processing
 */
const startBatchProcessing = (io) => {
    const interval = parseInt(process.env.BATCH_INTERVAL) || 300000; // Default 5 minutes
    
    console.log(`Starting batch processing (interval: ${interval / 1000}s)`);
    
    // Run immediately on start
    processBatch(io);
    
    // Then run on interval
    processingInterval = setInterval(() => {
        processBatch(io);
    }, interval);
};

/**
 * Stop batch processing
 */
const stopBatchProcessing = () => {
    if (processingInterval) {
        clearInterval(processingInterval);
        console.log('Batch processing stopped');
    }
};

/**
 * Process batch analytics
 */
const processBatch = async (io) => {
    try {
        console.log('Running batch analytics...');
        
        const periodEnd = new Date();
        const periodStart = new Date(periodEnd - 5 * 60 * 1000); // Last 5 minutes
        
        // Aggregate logs in period
        const logs = await Log.find({
            timestamp: { $gte: periodStart, $lte: periodEnd }
        });
        
        // Calculate stats
        const totalLogs = logs.length;
        const errorCount = logs.filter(l => l.level === 'ERROR').length;
        const warnCount = logs.filter(l => l.level === 'WARN').length;
        const infoCount = logs.filter(l => l.level === 'INFO').length;
        
        // Top errors
        const errorLogs = logs.filter(l => l.level === 'ERROR');
        const errorFrequency = {};
        
        errorLogs.forEach(log => {
            const key = `${log.service}:${log.message.substring(0, 100)}`;
            if (!errorFrequency[key]) {
                errorFrequency[key] = {
                    message: log.message,
                    service: log.service,
                    count: 0
                };
            }
            errorFrequency[key].count++;
        });
        
        const topErrors = Object.values(errorFrequency)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        // Service breakdown
        const serviceStats = {};
        logs.forEach(log => {
            if (!serviceStats[log.service]) {
                serviceStats[log.service] = { total: 0, errors: 0 };
            }
            serviceStats[log.service].total++;
            if (log.level === 'ERROR') {
                serviceStats[log.service].errors++;
            }
        });
        
        const serviceBreakdown = Object.entries(serviceStats).map(([service, stats]) => ({
            service,
            count: stats.total,
            errorRate: stats.total > 0 ? (stats.errors / stats.total * 100).toFixed(2) : 0
        }));
        
        // Save summary
        const summary = new AnalyticsSummary({
            periodStart,
            periodEnd,
            totalLogs,
            errorCount,
            warnCount,
            infoCount,
            topErrors,
            serviceBreakdown
        });
        
        await summary.save();
        
        console.log(`Batch complete: ${totalLogs} logs, ${errorCount} errors`);
        
        // Emit update via Socket.IO
        emitAnalyticsUpdate({
            totalLogs: await Log.countDocuments(),
            errorCount: await Log.countDocuments({ level: 'ERROR' }),
            latestSummary: summary
        });
        
    } catch (error) {
        console.error('Batch processing error:', error.message);
    }
};

module.exports = {
    startBatchProcessing,
    stopBatchProcessing
};
