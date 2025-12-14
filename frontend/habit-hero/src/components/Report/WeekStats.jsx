import React from 'react';
import './WeekStats.css';

const WeekStats = ({ title, stats, weekRange }) => {
  return (
    <div className="week-stats">
      <h3>{title}</h3>
      {weekRange && (
        <p className="week-range">
          {new Date(weekRange.startDate).toLocaleDateString()} - {new Date(weekRange.endDate).toLocaleDateString()}
        </p>
      )}
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Completions</div>
          <div className="stat-value">{stats.completions}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Completion %</div>
          <div className="stat-value">{stats.completionPercentage}%</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Missed Days</div>
          <div className="stat-value">{stats.missedDays}</div>
        </div>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${Math.min(stats.completionPercentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default WeekStats;