/**
 * Log Deduplication Utility
 * Detects duplicate error logs using hash comparison
 * Stores count instead of duplicating entries
 */

const crypto = require('crypto');

/**
 * Generates a hash for log deduplication
 * Based on: service + level + normalized message
 */
const generateLogHash = (log) => {
    // Normalize message (remove timestamps, IDs, variable parts)
    const normalized = normalizeMessage(log.message);
    
    const hashString = `${log.service}-${log.level}-${normalized}`;
    return crypto.createHash('md5').update(hashString).digest('hex');
};

/**
 * Normalizes log message for comparison
 * Removes variable parts like timestamps, IDs, numbers
 */
const normalizeMessage = (message) => {
    if (!message) return '';
    
    return message
        // Remove timestamps
        .replace(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)?/g, 'TIMESTAMP')
        // Remove UUIDs
        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID')
        // Remove IDs
        .replace(/\bid[:\s=]+[\w-]+/gi, 'ID')
        // Remove numbers in paths
        .replace(/\/\d+/g, '/{id}')
        // Remove standalone numbers
        .replace(/\b\d+\b/g, 'NUM')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
};

/**
 * Checks if a similar log exists (for deduplication)
 * Returns the existing log if found, null otherwise
 */
const findDuplicate = async (Log, hash, level) => {
    // Only deduplicate ERROR logs
    if (level !== 'ERROR') return null;
    
    // Look for recent duplicate (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const duplicate = await Log.findOne({
        hash,
        level: 'ERROR',
        timestamp: { $gte: oneHourAgo }
    }).sort({ timestamp: -1 });
    
    return duplicate;
};

module.exports = {
    generateLogHash,
    normalizeMessage,
    findDuplicate
};
