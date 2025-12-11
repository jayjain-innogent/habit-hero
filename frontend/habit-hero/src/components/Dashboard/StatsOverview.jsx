import React from 'react';
import './StatsOverview.css';

const StatsOverview = ({ cardData, tableData }) => {
  const categoryStats = tableData.reduce((acc, habit) => {
    if (!acc[habit.category]) {
      acc[habit.category] = { total: 0, completed: 0, habits: 0 };
    }
    acc[habit.category].total += habit.totalTargetTask;
    acc[habit.category].completed += habit.taskCompletedCount;
    acc[habit.category].habits += 1;
    return acc;
  }, {});

  const topPerformers = tableData
    .filter(habit => habit.efficiency >= 80)
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 3);

  const needsAttention = tableData
    .filter(habit => habit.efficiency < 50)
    .sort((a, b) => a.efficiency - b.efficiency)
    .slice(0, 3);

  return (
    <div className="stats-overview">
      <div className="stats-section">
        <h3>📊 Category Performance</h3>
        <div className="category-grid">
          {Object.entries(categoryStats).map(([category, stats]) => {
            const percentage = Math.round((stats.completed / stats.total) * 100) || 0;
            return (
              <div key={category} className="category-stat">
                <div className="category-header">
                  <span className="category-name">{category}</span>
                  <span className="category-percentage">{percentage}%</span>
                </div>
                <div className="category-details">
                  <span>{stats.completed}/{stats.total} tasks</span>
                  <span>{stats.habits} habits</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {topPerformers.length > 0 && (
        <div className="stats-section">
          <h3>🏆 Top Performers</h3>
          <div className="performers-list">
            {topPerformers.map((habit, index) => (
              <div key={index} className="performer-item top">
                <span className="habit-name">{habit.habitName}</span>
                <span className="efficiency">{habit.efficiency}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {needsAttention.length > 0 && (
        <div className="stats-section">
          <h3>⚠️ Needs Attention</h3>
          <div className="performers-list">
            {needsAttention.map((habit, index) => (
              <div key={index} className="performer-item attention">
                <span className="habit-name">{habit.habitName}</span>
                <span className="efficiency">{habit.efficiency}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;