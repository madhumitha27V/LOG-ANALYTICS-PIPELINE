/**
 * Socket.IO Service
 * Handles real-time communication with frontend
 * Emits updates when new errors arrive or analytics change
 */

let io;

/**
 * Initialize Socket.IO handlers
 */
const initSocketHandlers = (socketIO) => {
    io = socketIO;
    
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);
        
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
        
        // Client can request immediate dashboard update
        socket.on('request:dashboard-update', async () => {
            const dashboardData = await getDashboardData();
            socket.emit('dashboard:update', dashboardData);
        });
    });
};

/**
 * Emit new error to all connected clients
 */
const emitNewError = (logData) => {
    if (io) {
        io.emit('log:new-error', logData);
    }
};

/**
 * Emit analytics update
 */
const emitAnalyticsUpdate = (analytics) => {
    if (io) {
        io.emit('analytics:update', analytics);
    }
};

/**
 * Emit AI analysis result
 */
const emitAIAnalysis = (logId, analysis) => {
    if (io) {
        io.emit('ai:analysis-complete', { logId, analysis });
    }
};

/**
 * Get current dashboard data
 */
const getDashboardData = async () => {
    const Log = require('../models/Log');
    const AnalyticsSummary = require('../models/AnalyticsSummary');
    
    // Get counts
    const totalLogs = await Log.countDocuments();
    const errorCount = await Log.countDocuments({ level: 'ERROR' });
    
    // Get recent errors
    const recentErrors = await Log.find({ level: 'ERROR' })
        .sort({ timestamp: -1 })
        .limit(10)
        .select('timestamp service message aiAnalysis');
    
    // Get latest summary
    const latestSummary = await AnalyticsSummary.findOne()
        .sort({ periodEnd: -1 });
    
    return {
        totalLogs,
        errorCount,
        recentErrors,
        summary: latestSummary
    };
};

module.exports = {
    initSocketHandlers,
    emitNewError,
    emitAnalyticsUpdate,
    emitAIAnalysis,
    getDashboardData
};
