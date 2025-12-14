/**
 * Log Model
 * MongoDB schema for storing application logs with indexing for performance
 */

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    // Core log fields
    timestamp: {
        type: Date,
        required: true,
        index: true
    },
    service: {
        type: String,
        required: true,
        index: true
    },
    level: {
        type: String,
        required: true,
        enum: ['INFO', 'WARN', 'ERROR'],
        index: true
    },
    message: {
        type: String,
        required: true
    },
    userId: String,
    metadata: mongoose.Schema.Types.Mixed,
    
    // Deduplication
    hash: {
        type: String,
        index: true
    },
    duplicateCount: {
        type: Number,
        default: 1
    },
    
    // AI Analysis (only for ERROR logs)
    aiAnalysis: {
        rootCause: String,
        explanation: String,
        suggestedFix: String,
        analyzedAt: Date,
        cached: {
            type: Boolean,
            default: false
        }
    },
    
    // Masked flag
    masked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // createdAt, updatedAt
});

// Compound indexes for common queries
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ service: 1, level: 1 });
logSchema.index({ hash: 1, level: 1 });

module.exports = mongoose.model('Log', logSchema);
