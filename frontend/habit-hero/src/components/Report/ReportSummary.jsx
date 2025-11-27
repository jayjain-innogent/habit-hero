import React from 'react';
import './ReportSummary.css';

const ReportSummary = ({ summary, habitName }) => {
  return (
    <div className="report-summary">
      <h2>Summary for {habitName}</h2>
      <div className="summary-cards">
        <div className="summary-card completion-rate">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Completion Rate</h3>
            <div className="metric-value">{summary.completionRate}%</div>
          </div>
        </div>
        
        <div className="summary-card streak">
          <div className="card-icon">🔥</div>
          <div className="card-content">
            <h3>Current Streak</h3>
            <div className="metric-value">{summary.currentStreak} days</div>
          </div>
        </div>
          {/*<div className="summary-card streak">*/}
          {/*    <div className="card-icon">🔥</div>*/}
          {/*    <div className="card-content">*/}
          {/*        <h3>Longest Streak</h3>*/}
          {/*        <div className="metric-value">{summary.longestStreak} days</div>*/}
          {/*    </div>*/}
          {/*</div>*/}
        <div className="summary-card missed-days">
          <div className="card-icon">⏰</div>
          <div className="card-content">
            <h3>Missed Days</h3>
            <div className="metric-value">{summary.totalMissedDays}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;