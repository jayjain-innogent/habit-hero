import React from 'react';
import './DashboardCards.css';

const DashboardCards = ({ cardData }) => {
  const {
    totalCompleted,
    totalTarget,
    scorePercentage,
    currentStreak,
    perfectDays,
    bestCategory,
    weeklyTrend
  } = cardData;

  return (
    <div className="dashboard-cards">
      <div className="card">
        <h3>Completion Rate</h3>
        <div className="card-value">{scorePercentage}%</div>
        <div className="card-detail">{totalCompleted}/{totalTarget} completed</div>
      </div>

      <div className="card">
        <h3>Current Streak</h3>
        <div className="card-value">{currentStreak}</div>
        <div className="card-detail">days</div>
      </div>

      <div className="card">
        <h3>Perfect Days</h3>
        <div className="card-value">{perfectDays}</div>
        <div className="card-detail">this period</div>
      </div>

      <div className="card">
        <h3>Best Category</h3>
        <div className="card-value category">{bestCategory}</div>
      </div>

      <div className="card weekly-trend">
        <h3>Weekly Trend</h3>
        <div className="trend-dots">
          {weeklyTrend.map((completed, index) => (
            <div
              key={index}
              className={`trend-dot ${completed ? 'completed' : 'missed'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;