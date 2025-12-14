/**
 * Analytics Summary Model
 * Stores batch-processed analytics summaries
 */

const mongoose = require('mongoose');

const analyticsSummarySchema = new mongoose.Schema({
    periodStart: {
        type: Date,
        required: true,
        index: true
    },
    periodEnd: {
        type: Date,
        required: true
    },
    totalLogs: {
        type: Number,
        default: 0
    },
    errorCount: {
        type: Number,
        default: 0
    },
    warnCount: {
        type: Number,
        default: 0
    },
    infoCount: {
        type: Number,
        default: 0
    },
    // Top 10 most common errors
    topErrors: [{
        message: String,
        count: Number,
        service: String
    }],
    // Service breakdown
    serviceBreakdown: [{
        service: String,
        count: Number,
        errorRate: Number
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('AnalyticsSummary', analyticsSummarySchema);
