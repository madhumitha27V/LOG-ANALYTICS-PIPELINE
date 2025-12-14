/**
 * AI Analysis Panel Component
 * Displays AI-generated root cause, explanation, and fixes
 */

import React from 'react';
import './AIAnalysisPanel.css';

function AIAnalysisPanel({ error }) {
  if (!error) {
    return (
      <div className="ai-panel empty">
        <p>Select an error from the list to see AI analysis</p>
      </div>
    );
  }

  if (!error.aiAnalysis || !error.aiAnalysis.rootCause) {
    return (
      <div className="ai-panel analyzing">
        <div className="spinner"></div>
        <p>AI is analyzing this error...</p>
      </div>
    );
  }

  const { aiAnalysis } = error;

  return (
    <div className="ai-panel">
      <div className="error-details">
        <h3>Error Details</h3>
        <div className="detail-row">
          <strong>Service:</strong> {error.service}
        </div>
        <div className="detail-row">
          <strong>Timestamp:</strong> {new Date(error.timestamp).toLocaleString()}
        </div>
        <div className="detail-row">
          <strong>Message:</strong> {error.message}
        </div>
        {error.duplicateCount > 1 && (
          <div className="detail-row">
            <strong>Occurrences:</strong> {error.duplicateCount}
          </div>
        )}
      </div>

      <div className="ai-analysis">
        <div className="analysis-section root-cause">
          <h4>🎯 Root Cause</h4>
          <p>{aiAnalysis.rootCause}</p>
        </div>

        <div className="analysis-section explanation">
          <h4>💡 Explanation</h4>
          <p>{aiAnalysis.explanation}</p>
        </div>

        <div className="analysis-section suggested-fix">
          <h4>🔧 Suggested Fix</h4>
          <p>{aiAnalysis.suggestedFix}</p>
        </div>

        {aiAnalysis.cached && (
          <div className="cache-badge">
            ⚡ Cached Response (similar error analyzed previously)
          </div>
        )}
      </div>
    </div>
  );
}

export default AIAnalysisPanel;
