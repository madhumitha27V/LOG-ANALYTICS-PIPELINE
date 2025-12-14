# AI-Powered Real-Time Log Analytics & Smart Debug Assistant

A production-grade log analytics platform with AI-powered error analysis, real-time monitoring, and intelligent debugging assistance.

## 🚀 Features

- **Real-Time Monitoring**: WebSocket-based live updates for errors and analytics
- **AI-Powered Analysis**: OpenAI GPT-3.5-turbo integration for intelligent error root cause analysis
- **Smart Caching**: AI response caching to reduce API costs
- **Error Deduplication**: Hash-based duplicate detection to minimize noise
- **Sensitive Data Masking**: Automatic masking of emails, phone numbers, tokens, and passwords
- **Batch Analytics**: 5-minute interval aggregation for performance insights
- **Service Breakdown**: Per-service error rates and statistics
- **Top Errors Dashboard**: Most frequent errors with duplicate counts
- **JWT Authentication**: Secure admin access with token-based auth

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│  (Dashboard, Login, StatsCards, ErrorList, AIAnalysisPanel) │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│                     Express.js Backend                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Routes: /api/auth, /api/logs, /api/analytics      │     │
│  └────────────┬───────────────────────────────────────┘     │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────┐     │
│  │  Controllers: authController, logController,       │     │
│  │               analyticsController                   │     │
│  └────────────┬───────────────────────────────────────┘     │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────┐     │
│  │  Services: aiService, socketService,               │     │
│  │            batchProcessor                           │     │
│  └────────────┬───────────────────────────────────────┘     │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────┐     │
│  │  Utils: dataMasking, deduplication                 │     │
│  └────────────┬───────────────────────────────────────┘     │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────┐     │
│  │  Models: Log, AnalyticsSummary, User              │     │
│  └────────────┬───────────────────────────────────────┘     │
└───────────────┼─────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│                      MongoDB Database                        │
│  Collections: logs, analyticssummaries, users               │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
DATA PIPELINE/
├── server.js                 # Main application entry point
├── package.json              # Backend dependencies
├── .env                      # Environment configuration
├── .env.example              # Environment template
├── generateLogs.js           # Synthetic log generator for testing
│
├── config/
│   └── database.js           # MongoDB connection setup
│
├── models/
│   ├── Log.js                # Log schema with AI analysis fields
│   ├── AnalyticsSummary.js   # Batch analytics storage
│   └── User.js               # Admin user schema
│
├── services/
│   ├── aiService.js          # OpenAI integration with caching
│   ├── socketService.js      # WebSocket real-time communication
│   └── batchProcessor.js     # 5-minute interval analytics
│
├── utils/
│   ├── dataMasking.js        # Sensitive data sanitization
│   └── deduplication.js      # Error hash generation & duplicate detection
│
├── middleware/
│   └── auth.js               # JWT authentication middleware
│
├── controllers/
│   ├── logController.js      # Log ingestion & retrieval
│   ├── analyticsController.js # Dashboard & trends
│   └── authController.js     # Admin login
│
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── logRoutes.js          # Log management routes
│   └── analyticsRoutes.js    # Analytics routes
│
└── client/                   # React frontend
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js
        ├── index.css
        ├── App.css
        └── components/
            ├── Login.js
            ├── Login.css
            ├── Dashboard.js
            ├── Dashboard.css
            ├── StatsCards.js
            ├── StatsCards.css
            ├── ErrorList.js
            ├── ErrorList.css
            ├── AIAnalysisPanel.js
            └── AIAnalysisPanel.css
```

## 🔧 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- OpenAI API Key

### Step 1: Clone and Setup

```bash
cd "F:\DATA PIPELINE"
```

### Step 2: Backend Setup

```bash
# Install backend dependencies
npm install

# Create .env file
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit `.env` file with your credentials:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/log_analytics_ai

# OpenAI API Key (required for AI analysis)
OPENAI_API_KEY=your-openai-api-key-here

# JWT Secret (generate a random string)
JWT_SECRET=your-jwt-secret-key-here

# Admin Credentials
ADMIN_EMAIL=admin@loganalytics.com
ADMIN_PASSWORD=admin123

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Step 4: Frontend Setup

```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Return to root
cd ..
```

### Step 5: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

## 🚀 Running the Application

### Start Backend Server

```bash
npm start
```

Backend will run on `http://localhost:5000`

### Start Frontend (New Terminal)

```bash
cd client
npm start
```

Frontend will run on `http://localhost:3000`

## 📊 Generating Sample Logs

To test the system with synthetic logs:

```bash
node generateLogs.js
```

This will generate random logs across different services and log levels.

## 🔑 Default Admin Credentials

- **Email**: admin@loganalytics.com
- **Password**: admin123

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/login` - Admin login

### Log Management

- `POST /api/logs` - Ingest new log
- `GET /api/logs` - Retrieve logs (with filters)
- `GET /api/logs/:id` - Get specific log
- `POST /api/logs/:id/analyze` - Trigger AI analysis

### Analytics

- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/analytics/trends` - Error trends over time
- `GET /api/analytics/services` - Service breakdown
- `GET /api/analytics/top-errors` - Most frequent errors

## 🧠 AI Analysis System

### How It Works

1. **Error Detection**: When an ERROR-level log is ingested, it triggers automatic AI analysis
2. **Deduplication**: Hash-based matching checks for similar errors
3. **Cache Check**: System searches for cached AI responses for identical errors
4. **OpenAI Call**: If no cache hit, calls GPT-3.5-turbo for analysis
5. **Result Storage**: Stores AI analysis in database for future reference
6. **Real-Time Update**: Broadcasts analysis via WebSocket to connected clients

### AI Response Format

```json
{
  "rootCause": "Connection timeout due to network latency",
  "explanation": "The error occurs when the database connection exceeds the configured timeout period...",
  "suggestedFix": "Increase connection timeout in database configuration or optimize queries to reduce execution time",
  "analyzedAt": "2024-01-15T10:30:00.000Z",
  "cached": false
}
```

## 🔒 Data Masking

Sensitive data is automatically masked before storage:

- **Emails**: `john.doe@example.com` → `j****e@e*****e.com`
- **Phone Numbers**: `+1234567890` → `+123****890`
- **Tokens**: `Bearer abc123xyz789` → `Bearer abc***789`
- **Passwords**: `password=secret123` → `password=***MASKED***`

## 🔄 Error Deduplication

Duplicate errors are tracked efficiently:

1. Generate MD5 hash from: `service + level + normalized_message`
2. Normalize message (remove timestamps, UUIDs, IDs, numbers)
3. Search for existing error with same hash within 1 hour
4. If found, increment `duplicateCount` instead of creating new document

## 📈 Batch Analytics Processing

Every 5 minutes, the system:

1. Aggregates total logs, error counts, warning counts, info counts
2. Calculates top 10 most frequent errors
3. Generates service-level breakdown with error rates
4. Stores summary in `analyticssummaries` collection
5. Broadcasts update via WebSocket

## 🎨 Frontend Features

### Dashboard

- **Stats Cards**: Total logs, errors, warnings, info, error rate
- **Recent Errors**: Scrollable list with selection
- **AI Analysis Panel**: Displays root cause, explanation, and suggested fixes
- **Real-Time Updates**: Live error notifications
- **Auto-Refresh**: 30-second interval data refresh

### Login

- **JWT Authentication**: Secure token-based login
- **Error Handling**: User-friendly error messages
- **Pre-filled Credentials**: For quick testing

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 8.0.0
- **Real-Time**: Socket.IO 4.6.0
- **AI**: OpenAI API 4.20.0
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Security**: bcrypt 2.4.3, helmet, cors

### Frontend

- **Framework**: React 18.2.0
- **HTTP Client**: Axios
- **Real-Time**: Socket.IO Client
- **Charts**: Recharts (optional, for future use)
- **Styling**: Pure CSS (no UI libraries)

## 🔍 Troubleshooting

### Backend won't start

- Check MongoDB is running: `mongosh` should connect
- Verify `.env` file exists with correct values
- Check port 5000 is not in use

### Frontend can't connect

- Ensure backend is running on port 5000
- Check browser console for errors
- Verify CORS configuration in server.js

### AI Analysis not working

- Confirm `OPENAI_API_KEY` is set in `.env`
- Check OpenAI API key is valid and has credits
- Review backend logs for OpenAI API errors

### No logs appearing

- Run `node generateLogs.js` to create sample data
- Check MongoDB connection in backend logs
- Verify Socket.IO connection in browser console

## 📝 Development Notes

### Adding New Log Sources

To integrate with your application:

```javascript
// Example: Node.js application
const axios = require('axios');

async function sendLog(level, message, service, metadata) {
  await axios.post('http://localhost:5000/api/logs', {
    service,
    level, // 'INFO' | 'WARN' | 'ERROR'
    message,
    metadata // Optional object with additional context
  });
}

// Usage
sendLog('ERROR', 'Database connection failed', 'api-server', {
  host: 'db.example.com',
  port: 5432
});
```

### Customizing AI Prompts

Edit `services/aiService.js` to modify the AI analysis prompt:

```javascript
const prompt = `Your custom prompt here...`;
```

### Adjusting Batch Processing Interval

Edit `services/batchProcessor.js`:

```javascript
const BATCH_INTERVAL = 5 * 60 * 1000; // Change to desired interval
```

## 📊 Performance Considerations

- **MongoDB Indexes**: Automatically created on log level, timestamp, service, hash
- **AI Caching**: Reduces OpenAI API calls by 70-90% for common errors
- **Deduplication**: Prevents database bloat from repeated errors
- **Batch Processing**: Aggregates data efficiently instead of real-time calculations

## 🛡️ Security Best Practices

1. **Change default admin password** immediately in production
2. **Use strong JWT secret** (32+ random characters)
3. **Enable MongoDB authentication** in production
4. **Use HTTPS** for production deployment
5. **Rotate OpenAI API keys** regularly
6. **Implement rate limiting** for public APIs

## 📄 License

This project is for educational and demonstration purposes.

## 👨‍💻 Author

Built with ❤️ for intelligent log analytics and debugging assistance.

---

**Need Help?** Check the troubleshooting section or review the backend logs at `server.js` startup.
