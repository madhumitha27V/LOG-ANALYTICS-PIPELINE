# Quick Start Guide

## ⚡ Fast Setup (5 minutes)

### 1. Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment

Create `.env` file in root directory:

```env
MONGODB_URI=mongodb://localhost:27017/log_analytics_ai
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=supersecretkey12345
ADMIN_EMAIL=admin@loganalytics.com
ADMIN_PASSWORD=admin123
PORT=5000
NODE_ENV=development
```

**Get OpenAI API Key**: https://platform.openai.com/api-keys

### 3. Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Compass** to start MongoDB service.

### 4. Start Backend

Open **Terminal 1**:
```bash
npm start
```

You should see:
```
✓ Connected to MongoDB
✓ Socket.IO initialized
✓ Batch processing started
✅ Server running on http://localhost:5000
```

### 5. Start Frontend

Open **Terminal 2**:
```bash
cd client
npm start
```

Browser will automatically open at `http://localhost:3000`

### 6. Login

Use default credentials:
- **Email**: admin@loganalytics.com
- **Password**: admin123

### 7. Generate Sample Logs

Open **Terminal 3**:
```bash
node generateLogs.js
```

This creates 50 synthetic logs across different services and log levels.

## 🎯 What to Expect

### Dashboard Features

1. **Stats Cards** (Top row)
   - Total Logs count
   - Error count (red)
   - Warning count (yellow)
   - Info count (blue)
   - Error Rate percentage

2. **Recent Errors** (Left panel)
   - Scrollable list of ERROR-level logs
   - Click any error to see AI analysis
   - Badges show duplicate count and AI analysis status

3. **AI Analysis Panel** (Right panel)
   - Click an error from the list
   - AI automatically analyzes root cause
   - Shows explanation and suggested fix
   - Cached results appear instantly

4. **Real-Time Updates**
   - New errors appear automatically
   - Stats update every 5 minutes
   - WebSocket connection indicator

## 🔧 Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Fix**: Start MongoDB service
```bash
net start MongoDB
```

### OpenAI API Error

```
Error: OpenAI API key not set
```

**Fix**: Add valid API key to `.env` file

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix**: Kill process on port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Frontend Can't Connect

**Fix**: Ensure backend is running on port 5000
- Check Terminal 1 shows "Server running on http://localhost:5000"
- Open browser console (F12) and check for errors

## 📝 Test the System

### 1. Generate Logs
```bash
node generateLogs.js
```

### 2. Check Dashboard
- Refresh browser
- Stats should show 50+ total logs
- Recent errors panel should show ERROR-level logs
- Click any error to trigger AI analysis

### 3. Watch Real-Time Updates
- Keep dashboard open
- Run `node generateLogs.js` again
- Watch new errors appear automatically without refresh

### 4. Test AI Analysis
- Click different errors
- First click: AI calls OpenAI (2-3 seconds)
- Second click on same error: Instant (cached)
- Check "Cached Response" badge

## 🚀 Next Steps

1. **Integrate with Your Application**
   - Use POST `/api/logs` endpoint
   - Send logs from your services
   - See README.md for integration code

2. **Customize**
   - Change admin password
   - Modify AI prompts
   - Adjust batch processing interval

3. **Deploy**
   - Use MongoDB Atlas for database
   - Deploy backend to Heroku/Railway
   - Deploy frontend to Vercel/Netlify

## 📚 Key Files

- `server.js` - Backend entry point
- `client/src/App.js` - Frontend entry point
- `.env` - Configuration
- `README.md` - Full documentation

## 🆘 Need Help?

Check the full README.md for:
- Complete API documentation
- Architecture diagrams
- Development notes
- Security best practices

---

**🎉 You're all set! Happy debugging with AI assistance!**
