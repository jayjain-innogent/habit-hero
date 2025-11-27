import React from 'react';
import './StatSummary.css';

function StatSummary({ completionRate, currentStreak, longestStreak, totalMissedDays }) {
    return (
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                    <span className="stat-label">Completion Rate</span>
                    <span className="stat-value">{completionRate}%</span>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                    <span className="stat-label">Current Streak</span>
                    <span className="stat-value">{currentStreak} days</span>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                    <span className="stat-label">Longest Streak</span>
                    <span className="stat-value">{longestStreak} days</span>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">❌</div>
                <div className="stat-content">
                    <span className="stat-label">Missed Days</span>
                    <span className="stat-value">{totalMissedDays}</span>
                </div>
            </div>
        </div>
    );
}

export default StatSummary;
