import React from 'react';
import './TrackingCalendar.css';

function TrackingCalendar({ reportData }) {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const generateCalendarDays = () => {
        const completions = reportData?.habit?.thisWeek?.completions || 0;
        return Array(21).fill().map((_, index) => ({
            completed: index < completions,
            date: index < 7 ? 17 + index : null,
            hasNote: false
        }));
    };
    
    const calendarDays = generateCalendarDays();

    return (
        <div className="tracking-calendar">
            <div className="calendar-header">
                <h2>Tracking Calendar</h2>
                <p>Click on a day to toggle completion. Click the note icon to add details.</p>
            </div>
            <div className="calendar-grid">
                <div className="weekday-headers">
                    {weekDays.map(day => (
                        <div key={day} className="weekday-header">{day}</div>
                    ))}
                </div>
                
                <div className="calendar-days">
                    {calendarDays.map((day, index) => (
                        <div
                            key={index}
                            className={`calendar-day ${day.completed ? 'completed' : 'incomplete'}`}
                        >
                            {day.completed && <span className="checkmark">✓</span>}
                            {day.date && <span className="date-number">{day.date}</span>}
                            <div className="day-actions">
                                {day.hasNote ? (
                                    <span className="note-indicator">📝 Note</span>
                                ) : (
                                    <span className="add-note">+ Add</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TrackingCalendar;
