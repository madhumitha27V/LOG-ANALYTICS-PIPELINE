/**
 * Synthetic Log Generator
 * Generates realistic sample logs for testing
 * Run: node generateLogs.js [count]
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/logs';

// Sample data
const services = ['auth-service', 'payment-service', 'user-service', 'api-gateway', 'notification-service'];

const infoMessages = [
    'User login successful',
    'API request processed',
    'Database query executed',
    'Cache hit for key',
    'Service health check passed',
    'Request authenticated',
    'Data synchronized successfully'
];

const warnMessages = [
    'High memory usage detected',
    'Slow database query',
    'Cache miss for key',
    'API rate limit approaching',
    'Deprecated endpoint used',
    'Connection pool near capacity'
];

const errorMessages = [
    'Database connection failed: Connection timeout after 5000ms',
    'Payment processing error: Invalid card number provided by user john.doe@example.com',
    'Authentication failed for user_id_12345: Invalid token sk_live_abc123',
    'API request failed with status 500: Internal server error',
    'Failed to send email to customer@example.com: SMTP connection refused',
    'Null pointer exception in UserService.getProfile()',
    'Redis connection lost: Unable to connect to redis://localhost:6379',
    'File upload failed: Disk quota exceeded',
    'Database query timeout: SELECT * FROM users WHERE id = 12345',
    'Payment gateway error: Card declined phone: +1-555-123-4567'
];

const users = ['user_1', 'user_2', 'user_3', 'admin', 'guest', null];

/**
 * Generate random log
 */
const generateLog = () => {
    const levels = ['INFO', 'WARN', 'ERROR'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    let message;
    if (level === 'ERROR') {
        message = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    } else if (level === 'WARN') {
        message = warnMessages[Math.floor(Math.random() * warnMessages.length)];
    } else {
        message = infoMessages[Math.floor(Math.random() * infoMessages.length)];
    }
    
    const log = {
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Last hour
        service: services[Math.floor(Math.random() * services.length)],
        level,
        message,
        userId: users[Math.floor(Math.random() * users.length)],
        metadata: {
            requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
            duration: Math.floor(Math.random() * 1000),
            endpoint: '/api/v1/resource',
            method: 'POST'
        }
    };
    
    return log;
};

/**
 * Send log to API
 */
const sendLog = async (log) => {
    try {
        const response = await axios.post(API_URL, log);
        return response.data;
    } catch (error) {
        console.error('Failed to send log:', error.message);
        return null;
    }
};

/**
 * Generate and send multiple logs
 */
const generateLogs = async (count) => {
    console.log(`Generating ${count} synthetic logs...`);
    console.log(`Sending to: ${API_URL}\n`);
    
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < count; i++) {
        const log = generateLog();
        const result = await sendLog(log);
        
        if (result) {
            success++;
            if (log.level === 'ERROR') {
                console.log(`✓ [${i + 1}/${count}] ERROR log sent: ${log.message.substring(0, 50)}...`);
            }
        } else {
            failed++;
        }
        
        // Progress indicator
        if ((i + 1) % 10 === 0) {
            console.log(`Progress: ${i + 1}/${count} logs sent`);
        }
    }
    
    console.log(`\n✅ Complete!`);
    console.log(`  Success: ${success}`);
    console.log(`  Failed: ${failed}`);
};

// Get count from command line or default to 50
const count = parseInt(process.argv[2]) || 50;
generateLogs(count);
