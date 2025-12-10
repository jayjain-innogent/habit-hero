import React from 'react';
import './HabitsTable.css';

const HabitsTable = ({ tableData }) => {
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'S': return '#27ae60';
      case 'A': return '#2ecc71';
      case 'B': return '#f39c12';
      case 'C': return '#e67e22';
      case 'D': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'FITNESS': return '#3498db';
      case 'PRODUCTIVITY': return '#9b59b6';
      case 'HEALTH': return '#27ae60';
      case 'SOCIAL': return '#e67e22';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="habits-table-container">
      <table className="habits-table">
        <thead>
          <tr>
            <th>Habit Name</th>
            <th>Category</th>
            <th>Progress</th>
            <th>Efficiency</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((habit, index) => (
            <tr key={index}>
              <td className="habit-name">{habit.habitName}</td>
              <td>
                <span 
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(habit.category) }}
                >
                  {habit.category}
                </span>
              </td>
              <td className="progress-cell">
                <div className="progress-info">
                  <span>{habit.completed}/{habit.target}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${habit.efficiency}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="efficiency">{habit.efficiency}%</td>
              <td>
                <span 
                  className="grade-badge"
                  style={{ backgroundColor: getGradeColor(habit.grade) }}
                >
                  {habit.grade}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HabitsTable;