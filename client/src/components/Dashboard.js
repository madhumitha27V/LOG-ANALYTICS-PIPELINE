/**
 * Dashboard Component
 * Main dashboard with real-time updates via WebSocket
 * Shows: Total logs, Error count, Recent errors, AI analysis
 */

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import StatsCards from './StatsCards';
import ErrorList from './ErrorList';
import AIAnalysisPanel from './AIAnalysisPanel';
import './Dashboard.css';

function Dashboard({ token, user, onLogout }) {
  const [stats, setStats] = useState({
    totalLogs: 0,
    errorCount: 0,
    warnCount: 0,
    infoCount: 0,
    errorRate: 0
  });
  const [errors, setErrors] = useState([]);
  const [selectedError, setSelectedError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for new errors
    newSocket.on('log:new-error', (error) => {
      console.log('New error received:', error);
      setErrors(prev => [error, ...prev].slice(0, 10));
      setLastUpdate(new Date());
    });

    // Listen for analytics updates
    newSocket.on('analytics:update', (data) => {
      console.log('Analytics update:', data);
      loadDashboardData();
    });

    // Listen for AI analysis completion
    newSocket.on('ai:analysis-complete', ({ logId, analysis }) => {
      console.log('AI analysis complete:', logId);
      // Update the error in the list
      setErrors(prev => prev.map(err => 
        err._id === logId ? { ...err, aiAnalysis: analysis } : err
      ));
      // If this is the selected error, update it
      if (selectedError && selectedError._id === logId) {
        setSelectedError(prev => ({ ...prev, aiAnalysis: analysis }));
      }
    });

    return () => newSocket.close();
  }, []);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setStats({
          totalLogs: data.data.totalLogs,
          errorCount: data.data.errorCount,
          warnCount: data.data.warnCount,
          infoCount: data.data.infoCount,
          errorRate: data.data.errorRate
        });
        setErrors(data.data.recentErrors);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Handle error selection
  const handleErrorClick = async (error) => {
    try {
      const response = await fetch(`/api/logs/${error._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedError(data.data);
      }
    } catch (err) {
      console.error('Failed to load error details:', err);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('Reading file...');

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      setUploadStatus(`Uploading ${lines.length} logs...`);
      
      let successCount = 0;
      let errorCount = 0;

      // Parse and send each log line
      for (let i = 0; i < lines.length; i++) {
        try {
          const line = lines[i].trim();
          if (!line) continue;

          // Try to parse as JSON first
          let logData;
          try {
            logData = JSON.parse(line);
          } catch {
            // If not JSON, parse as plain text log
            logData = parseLogLine(line);
          }

          // Send to API
          const response = await fetch('/api/logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData)
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }

          // Update progress every 10 logs
          if ((i + 1) % 10 === 0) {
            setUploadStatus(`Uploaded ${i + 1}/${lines.length} logs...`);
          }
        } catch (err) {
          errorCount++;
        }
      }

      setUploadStatus(`✅ Complete! ${successCount} logs uploaded, ${errorCount} failed`);
      setTimeout(() => {
        setUploadStatus('');
        loadDashboardData();
      }, 3000);

    } catch (error) {
      setUploadStatus(`❌ Upload failed: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 3000);
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  // Parse plain text log line
  const parseLogLine = (line) => {
    // Detect log level
    let level = 'INFO';
    if (/error|failed|exception|fatal/i.test(line)) {
      level = 'ERROR';
    } else if (/warn|warning/i.test(line)) {
      level = 'WARN';
    }

    // Try to extract timestamp
    const timestampMatch = line.match(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/);
    const timestamp = timestampMatch ? new Date(timestampMatch[0]) : new Date();

    // Try to extract service name
    const serviceMatch = line.match(/\[([\w-]+)\]/);
    const service = serviceMatch ? serviceMatch[1] : 'uploaded-service';

    return {
      level,
      message: line,
      service,
      timestamp,
      source: 'file-upload'
    };
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>🤖 AI Log Analytics</h1>
          <p className="last-update">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
        <div className="header-actions">
          <span className="user-info">👤 {user.email}</span>
          <label className="btn-upload">
            📁 Upload Logs
            <input 
              type="file" 
              accept=".log,.txt,.json" 
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={loadDashboardData} className="btn-refresh">
            🔄 Refresh
          </button>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* Upload Status */}
      {uploadStatus && (
        <div className={`upload-status ${uploading ? 'uploading' : 'complete'}`}>
          {uploading && <span className="spinner-small">⏳</span>}
          {uploadStatus}
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Error List */}
        <div className="error-list-section">
          <h2>Recent Errors</h2>
          <ErrorList 
            errors={errors} 
            onErrorClick={handleErrorClick}
            selectedError={selectedError}
          />
        </div>

        {/* AI Analysis Panel */}
        <div className="ai-panel-section">
          <h2>AI Debug Assistant</h2>
          <AIAnalysisPanel error={selectedError} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
