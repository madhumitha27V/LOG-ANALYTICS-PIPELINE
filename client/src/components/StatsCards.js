/**
 * Stats Cards Component
 * Displays key metrics (total logs, errors, etc.)
 */

import React from 'react';
import './StatsCards.css';

function StatsCards({ stats }) {
  return (
    <div className="stats-cards">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3>Total Logs</h3>
          <p className="stat-value">{stats.totalLogs.toLocaleString()}</p>
        </div>
      </div>

      <div className="stat-card error">
        <div className="stat-icon">❌</div>
        <div className="stat-content">
          <h3>Errors</h3>
          <p className="stat-value">{stats.errorCount.toLocaleString()}</p>
        </div>
      </div>

      <div className="stat-card warning">
        <div className="stat-icon">⚠️</div>
        <div className="stat-content">
          <h3>Warnings</h3>
          <p className="stat-value">{stats.warnCount.toLocaleString()}</p>
        </div>
      </div>

      <div className="stat-card info">
        <div className="stat-icon">ℹ️</div>
        <div className="stat-content">
          <h3>Info</h3>
          <p className="stat-value">{stats.infoCount.toLocaleString()}</p>
        </div>
      </div>

      <div className="stat-card rate">
        <div className="stat-icon">📈</div>
        <div className="stat-content">
          <h3>Error Rate</h3>
          <p className="stat-value">{stats.errorRate}%</p>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
