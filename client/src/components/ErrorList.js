/**
 * Error List Component
 * Shows recent errors with timestamps and services
 */

import React from 'react';
import './ErrorList.css';

function ErrorList({ errors, onErrorClick, selectedError }) {
  if (errors.length === 0) {
    return <div className="empty-state">No errors yet. System is running smoothly! ✅</div>;
  }

  return (
    <div className="error-list">
      {errors.map((error) => (
        <div
          key={error._id}
          className={`error-item ${selectedError && selectedError._id === error._id ? 'selected' : ''}`}
          onClick={() => onErrorClick(error)}
        >
          <div className="error-header">
            <span className="error-service">{error.service}</span>
            <span className="error-time">
              {new Date(error.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="error-message">{error.message}</div>
          {error.duplicateCount > 1 && (
            <div className="error-badge">
              🔁 {error.duplicateCount} occurrences
            </div>
          )}
          {error.aiAnalysis && (
            <div className="error-badge ai">
              🤖 AI Analyzed
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ErrorList;
