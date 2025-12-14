/**
 * Main Server Entry Point
 * Sets up Express server, MongoDB connection, Socket.IO, and batch processing
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { initSocketHandlers } = require('./services/socketService');
const { startBatchProcessing } = require('./services/batchProcessor');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
        credentials: true
    }
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

// Initialize server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('✓ MongoDB connected');
        
        // Initialize Socket.IO handlers
        initSocketHandlers(io);
        console.log('✓ Socket.IO initialized');
        
        // Start batch processing
        startBatchProcessing(io);
        console.log('✓ Batch processing started');
        
        // Start server
        server.listen(PORT, () => {
            console.log('='.repeat(60));
            console.log(`🚀 AI Log Analytics Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 API: http://localhost:${PORT}`);
            console.log('='.repeat(60));
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
