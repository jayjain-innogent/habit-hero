import React, { useState, useEffect } from 'react';
import { fetchWeeklyReport } from '../../services/api';
import './ReportCalendar.css';

const ReportCalendar = ({ habitId, startDate, endDate }) => {
  const [calendarData, setCalendarData] = useState([]);

  useEffect(() => {
    loadCalendarData();
  }, [habitId, startDate, endDate]);

  const loadCalendarData = async () => {
    try {
      // Validate start date
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        console.error('Invalid start date:', startDate);
        return;
      }
      
      // Always show exactly 30 days from start date
      const calendarEndDate = new Date(start);
      calendarEndDate.setDate(start.getDate() + 29);
      const calendarEnd = calendarEndDate.toISOString().split('T')[0];
      
      const reportData = await fetchWeeklyReport(startDate, calendarEnd, habitId);
      
      const completionDates = reportData?.summary?.habitCompletions || [];
      generateCalendarData(completionDates, startDate, calendarEnd);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        const calendarEndDate = new Date(start);
        calendarEndDate.setDate(start.getDate() + 29);
        generateCalendarData([], startDate, calendarEndDate.toISOString().split('T')[0]);
      }
    }
  };

  const generateCalendarData = (completionDates, rangeStart, rangeEnd) => {
    const start = new Date(rangeStart || startDate);
    const end = new Date(rangeEnd || endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Invalid date range:', rangeStart, rangeEnd);
      setCalendarData([]);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const days = [];
    
    const completedDates = new Set(completionDates);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === today;
      const isPastOrToday = dateStr <= today;
      const isCompleted = completedDates.has(dateStr);
      
      days.push({
        date: new Date(d),
        completed: isPastOrToday ? isCompleted : null,
        isToday,
        isPastOrToday,
        value: isCompleted ? 100 : 0
      });
    }
    
    setCalendarData(days);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="report-calendar">
      <h3>Completion Calendar</h3>
      <div className="calendar-grid month-view">
        {calendarData.map((day, index) => {
          let className = 'calendar-day';
          let status = '';
          let title = formatDate(day.date);
          
          if (day.isToday) {
            className += ' today';
            title += ' (Today)';
          }
          
          if (day.isPastOrToday) {
            if (day.completed) {
              className += ' completed';
              status = '✓';
              title += ': Completed';
            }
            else if (day.isToday) {
                className += ' pending';   // Orange ⏳ (for today)
            }
            else {
              className += ' missed';
              status = '✗';
              title += ': Missed';
            }
          }
          else {
            className += ' future';
            title += ': Future';
          }
          
          return (
            <div key={index} className={className} title={title}>
              <div className="day-date">{day.date.getDate()}</div>
              <div className="day-status">{status}</div>
            </div>
          );
        })}
      </div>
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color completed"></div>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-color missed"></div>
          <span>Missed</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <div className="legend-color future"></div>
          <span>Future</span>
        </div>
      </div>
    </div>
  );
};

export default ReportCalendar;