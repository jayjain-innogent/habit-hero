import React from 'react';
import './CalendarCell.css';

function CalendarCell({ date, completed, onClick, onAddNote }) {
    return (
        <div
            className={`calendar-cell ${completed ? 'completed' : ''}`}
            onClick={onClick}
        >
            {completed ? '✔' : date}
            <button className="note-btn" onClick={e => { e.stopPropagation(); onAddNote(); }}>
                + Add Note
            </button>
        </div>
    );
}
export default CalendarCell;
