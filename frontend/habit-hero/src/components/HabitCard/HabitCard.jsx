import React from 'react';
import './HabitCard.css';

function HabitCard({ habit }) {
    if (!habit) return null;
    
    return (
        <div className="habit-header">
            <button className="back-btn">←</button>
            <div className="habit-info">
                <div className="habit-icon">📖</div>
                <div className="habit-details">
                    <h1 className="habit-title">{habit.habitName}</h1>
                    <p className="habit-category">{habit.category}</p>
                    <div className="habit-meta">
                        <span className="frequency">{habit.cadence} • {habit.sessionCount}</span>
                        <span className="status on-track">{habit.status}</span>
                    </div>
                </div>
            </div>
            <button className="view-reports-btn">View Reports</button>
        </div>
    );
}

export default HabitCard;
