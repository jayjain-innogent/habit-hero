import React, { useState } from 'react';
import './HabitHero.css';

const HabitHero = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This week');
  const [calendarView, setCalendarView] = useState('Last 14 days');
  const [selectedDay, setSelectedDay] = useState(null);

  // Dummy data
  const habitData = {
    name: 'Meditation',
    subtitle: 'This week - 3 days goal',
    today: {
      status: 'Done',
      details: '20 min - at 7:15 AM'
    },
    streak: {
      days: 12,
      status: 'On track'
    },
    weekGoal: {
      completed: 3,
      total: 4,
      percentage: 75
    },
    calendar: [
      { date: '2024-01-15', status: 'done', duration: '25 min', note: 'Felt calm' },
      { date: '2024-01-16', status: 'missed' },
      { date: '2024-01-17', status: 'done', duration: '20 min', note: 'Good focus' },
      { date: '2024-01-18', status: 'done', duration: '30 min' },
      { date: '2024-01-19', status: 'missed' },
      { date: '2024-01-20', status: 'done', duration: '15 min' },
      { date: '2024-01-21', status: 'today' },
      { date: '2024-01-22', status: 'future' },
      { date: '2024-01-23', status: 'future' },
      { date: '2024-01-24', status: 'future' },
      { date: '2024-01-25', status: 'future' },
      { date: '2024-01-26', status: 'future' },
      { date: '2024-01-27', status: 'future' },
      { date: '2024-01-28', status: 'future' }
    ],
    trend: {
      data: [85, 90, 75, 95, 80, 88, 92],
      status: 'Improving'
    },
    stats: {
      avgCompletion: 78,
      bestStreak: 18,
      totalCompletions: 156,
      mostConsistent: 'Thu',
      mostMissed: 'Sun'
    },
    weeklyComparison: {
      thisWeek: {
        sessions: 3,
        totalTime: 65,
        avgDuration: 22,
        completion: 75
      },
      lastWeek: {
        sessions: 2,
        totalTime: 40,
        avgDuration: 20,
        completion: 50
      }
    },
    insights: [
      "You're 1 session away from this week's goal.",
      "Your morning sessions have 95% completion rate.",
      "Consider setting a backup time for Sundays."
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return '#22c55e';
      case 'missed': return '#ef4444';
      case 'today': return '#3b82f6';
      case 'future': return '#e5e7eb';
      default: return '#e5e7eb';
    }
  };

  const handleDayClick = (day) => {
    if (day.status === 'done') {
      setSelectedDay(day);
    }
  };

  return (
    <div className="habit-hero">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>{habitData.name}</h1>
          <p className="subtitle">{habitData.subtitle}</p>
        </div>
        <div className="header-right">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-selector"
          >
            <option>This week</option>
            <option>This month</option>
            <option>90 days</option>
          </select>
        </div>
      </div>

      {/* Today Cards Row */}
      <div className="today-cards">
        <div className="card">
          <h3><i className="bi bi-calendar-day"></i> Today</h3>
          <div className={`status ${habitData.today.status.toLowerCase()}`}>
            <i className="bi bi-check-circle-fill"></i> {habitData.today.status}
          </div>
          <p className="subtext">{habitData.today.details}</p>
        </div>

        <div className="card">
          <h3><i className="bi bi-fire"></i> Current streak</h3>
          <div className="streak-number">{habitData.streak.days} days</div>
          <span className={`chip ${habitData.streak.status === 'On track' ? 'green' : 'orange'}`}>
            <i className="bi bi-graph-up-arrow"></i> {habitData.streak.status}
          </span>
        </div>

        <div className="card">
          <h3><i className="bi bi-target"></i> This week goal</h3>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${habitData.weekGoal.percentage}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {habitData.weekGoal.completed} / {habitData.weekGoal.total} sessions ({habitData.weekGoal.percentage}%)
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="calendar-section">
        <div className="calendar-header">
          <h2><i className="bi bi-calendar3"></i> Recent days</h2>
          <select 
            value={calendarView} 
            onChange={(e) => setCalendarView(e.target.value)}
            className="calendar-toggle"
          >
            <option>Last 14 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
        
        <div className="calendar-strip">
          {habitData.calendar.map((day, index) => (
            <div 
              key={index}
              className={`calendar-day ${day.status}`}
              style={{ backgroundColor: getStatusColor(day.status) }}
              onClick={() => handleDayClick(day)}
            >
              <span className="day-number">{new Date(day.date).getDate()}</span>
            </div>
          ))}
        </div>

        {selectedDay && (
          <div className="day-popup">
            <div className="popup-content">
              <span className="close" onClick={() => setSelectedDay(null)}>&times;</span>
              <div className="popup-header">
                ✓ {selectedDay.duration}
              </div>
              {selectedDay.note && (
                <p className="popup-note">Note: {selectedDay.note}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trend and Stats Row */}
      <div className="trend-stats-row">
        <div className="card trend-card">
          <div className="card-header">
            <h3><i className="bi bi-graph-up"></i> Trend</h3>
            <span className={`trend-badge ${habitData.trend.status.toLowerCase()}`}>
              <i className="bi bi-arrow-up"></i> {habitData.trend.status}
            </span>
          </div>
          <div className="trend-chart">
            <svg width="100%" height="80" viewBox="0 0 280 80">
              <polyline
                points={habitData.trend.data.map((value, index) => 
                  `${index * 40 + 20},${80 - (value * 0.6)}`
                ).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              {habitData.trend.data.map((value, index) => (
                <circle
                  key={index}
                  cx={index * 40 + 20}
                  cy={80 - (value * 0.6)}
                  r="3"
                  fill="#3b82f6"
                />
              ))}
            </svg>
            <div className="chart-labels">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <span key={index} className="chart-label">{day}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="card stats-card">
          <h3><i className="bi bi-bar-chart"></i> Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{habitData.stats.avgCompletion}%</span>
              <span className="stat-label">Average completion</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{habitData.stats.bestStreak}</span>
              <span className="stat-label">Best streak</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{habitData.stats.totalCompletions}</span>
              <span className="stat-label">All-time completions</span>
            </div>
          </div>
          <div className="consistency-stats">
            <p>Most consistent day: <strong>{habitData.stats.mostConsistent}</strong></p>
            <p>Most missed: <strong>{habitData.stats.mostMissed}</strong></p>
          </div>
        </div>
      </div>

      {/* Weekly Summary Table */}
      <div className="weekly-summary">
        <h3><i className="bi bi-table"></i> Weekly Summary</h3>
        <div className="summary-table">
          <div className="table-header">
            <div className="metric">Metric</div>
            <div className="this-week">This Week</div>
            <div className="last-week">Last Week</div>
            <div className="change">Change</div>
          </div>
          <div className="table-row">
            <div className="metric">Sessions</div>
            <div className="this-week">{habitData.weeklyComparison.thisWeek.sessions}</div>
            <div className="last-week">{habitData.weeklyComparison.lastWeek.sessions}</div>
            <div className={`change ${habitData.weeklyComparison.thisWeek.sessions >= habitData.weeklyComparison.lastWeek.sessions ? 'positive' : 'negative'}`}>
              {habitData.weeklyComparison.thisWeek.sessions - habitData.weeklyComparison.lastWeek.sessions > 0 ? '+' : ''}
              {habitData.weeklyComparison.thisWeek.sessions - habitData.weeklyComparison.lastWeek.sessions}
            </div>
          </div>
          <div className="table-row">
            <div className="metric">Total Time (min)</div>
            <div className="this-week">{habitData.weeklyComparison.thisWeek.totalTime}</div>
            <div className="last-week">{habitData.weeklyComparison.lastWeek.totalTime}</div>
            <div className={`change ${habitData.weeklyComparison.thisWeek.totalTime >= habitData.weeklyComparison.lastWeek.totalTime ? 'positive' : 'negative'}`}>
              {habitData.weeklyComparison.thisWeek.totalTime - habitData.weeklyComparison.lastWeek.totalTime > 0 ? '+' : ''}
              {habitData.weeklyComparison.thisWeek.totalTime - habitData.weeklyComparison.lastWeek.totalTime}
            </div>
          </div>
          <div className="table-row">
            <div className="metric">Avg Duration (min)</div>
            <div className="this-week">{habitData.weeklyComparison.thisWeek.avgDuration}</div>
            <div className="last-week">{habitData.weeklyComparison.lastWeek.avgDuration}</div>
            <div className={`change ${habitData.weeklyComparison.thisWeek.avgDuration >= habitData.weeklyComparison.lastWeek.avgDuration ? 'positive' : 'negative'}`}>
              {habitData.weeklyComparison.thisWeek.avgDuration - habitData.weeklyComparison.lastWeek.avgDuration > 0 ? '+' : ''}
              {habitData.weeklyComparison.thisWeek.avgDuration - habitData.weeklyComparison.lastWeek.avgDuration}
            </div>
          </div>
          <div className="table-row">
            <div className="metric">Completion Rate (%)</div>
            <div className="this-week">{habitData.weeklyComparison.thisWeek.completion}%</div>
            <div className="last-week">{habitData.weeklyComparison.lastWeek.completion}%</div>
            <div className={`change ${habitData.weeklyComparison.thisWeek.completion >= habitData.weeklyComparison.lastWeek.completion ? 'positive' : 'negative'}`}>
              {habitData.weeklyComparison.thisWeek.completion - habitData.weeklyComparison.lastWeek.completion > 0 ? '+' : ''}
              {habitData.weeklyComparison.thisWeek.completion - habitData.weeklyComparison.lastWeek.completion}%
            </div>
          </div>
        </div>
      </div>

      {/* Insights and Actions */}
      <div className="insights-section">
        <h3><i className="bi bi-lightbulb"></i> Insights</h3>
        <ul className="insights-list">
          {habitData.insights.map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HabitHero;