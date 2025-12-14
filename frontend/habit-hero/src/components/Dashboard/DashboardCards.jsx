import React from 'react';
import { Percent, Flame, Star, Trophy, Calendar, Award, TrendingUp, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
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
          <h3><Percent size={20} style={{ marginRight: '8px' }} /> Overall Score</h3>
          <div className="card-value score">{scorePercentage}%</div>
          <div className="card-detail">{totalCompleted}/{totalTarget} tasks completed</div>
        </div>

        <div className="card">
          <h3><Flame size={20} style={{ marginRight: '8px' }} /> Current Streak</h3>
          <div className="card-value">{currentStreak}</div>
          <div className="card-detail">days in a row</div>
        </div>

        <div className="card">
          <h3><Star size={20} style={{ marginRight: '8px' }} /> Perfect Days</h3>
          <div className="card-value">{perfectDays}</div>
          <div className="card-detail">100% completion</div>
        </div>

        <div className="card">
          <h3><Trophy size={20} style={{ marginRight: '8px' }} /> Longest Streak</h3>
          <div className="card-value">{longestStreak}</div>
          <div className="card-detail">personal best</div>
        </div>

        <div className="card">
          <h3><Calendar size={20} style={{ marginRight: '8px' }} /> Active Days</h3>
          <div className="card-value">{activeDaysCount}</div>
          <div className="card-detail">this period</div>
        </div>

        <div className="card">
          <h3><Award size={20} style={{ marginRight: '8px' }} /> Best Category</h3>
          <div className="card-value category">{bestCategory}</div>
          <div className="card-detail">top performer</div>
        </div>

        <div className="card">
          <h3><TrendingUp size={20} style={{ marginRight: '8px' }} /> Consistency</h3>
          <div className="card-value">{consistencyScore}%</div>
          <div className="card-detail">reliability score</div>
        </div>
      </div>

      <div className="weekly-trend-graph">
        <h3><CalendarDays size={20} style={{ marginRight: '8px' }} /> Weekly Progress</h3>

        <div className="progress-cards">
          {weeklyTrend && weeklyTrend.length > 0 ? (
            weeklyTrend.map((completed, index) => (
              <div key={index} className={`progress-card ${completed ? 'completed' : 'missed'}`}>
                <div className="card-icon">
                  {completed ? <CheckCircle size={20} style={{ color: '#16a34a' }} /> : <XCircle size={20} style={{ color: '#dc2626' }} />}
                </div>
                <span className="card-day">{dayLabels[index]}</span>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#64748b' }}>
              No weekly data available
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardCards;