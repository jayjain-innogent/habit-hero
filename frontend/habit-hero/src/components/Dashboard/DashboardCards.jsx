import React from 'react';
import './DashboardCards.css';

const DashboardCards = ({ cardData }) => {
  const {
    totalCompleted,
    totalTarget,
    scorePercentage,
    currentStreak,
    perfectDays,
    consistencyScore,
    longestStreak,
    activeDaysCount,
    bestCategory,
    weeklyTrend
  } = cardData;

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <>
      <div className="dashboard-cards">
        <div className="card primary">
          <h3><i className="bi bi-percent"></i> Overall Score</h3>
          <div className="card-value score">{scorePercentage}%</div>
          <div className="card-detail">{totalCompleted}/{totalTarget} tasks completed</div>
        </div>

        <div className="card">
          <h3><i className="bi bi-fire"></i> Current Streak</h3>
          <div className="card-value">{currentStreak}</div>
          <div className="card-detail">days in a row</div>
        </div>

        <div className="card">
          <h3><i className="bi bi-star-fill"></i> Perfect Days</h3>
          <div className="card-value">{perfectDays}</div>
          <div className="card-detail">100% completion</div>
        </div>

        <div className="card">
          <h3><i className="bi bi-trophy-fill"></i> Longest Streak</h3>
          <div className="card-value">{longestStreak}</div>
          <div className="card-detail">personal best</div>
        </div>

        <div className="card">
          <h3><i className="bi bi-calendar-check"></i> Active Days</h3>
          <div className="card-value">{activeDaysCount}</div>
          <div className="card-detail">this period</div>
        </div>

        <div className="card">
          <h3><i className="bi bi-award-fill"></i> Best Category</h3>
          <div className="card-value category">{bestCategory}</div>
          <div className="card-detail">top performer</div>
        </div>

        <div className="card">
          <h3><i className="bi bi-graph-up"></i> Consistency</h3>
          <div className="card-value">{consistencyScore}%</div>
          <div className="card-detail">reliability score</div>
        </div>
      </div>

      <div className="weekly-trend-graph">
        <h3><i className="bi bi-calendar-week"></i> Weekly Progress</h3>

        {/* Option 3: Card Grid */}
        <div className="progress-cards">
          {weeklyTrend.map((completed, index) => (
            <div key={index} className={`progress-card ${completed ? 'completed' : 'missed'}`}>
              <div className="card-icon">
                <i className={`bi ${completed ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
              </div>
              <span className="card-day">{dayLabels[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardCards;