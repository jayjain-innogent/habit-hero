import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeeklyReport } from '../services/api';
import ReportSummary from '../components/Report/ReportSummary';
import ReportCalendar from '../components/Report/ReportCalendar';
import WeekStats from '../components/Report/WeekStats';
import WeekComparison from '../components/Report/WeekComparison';
import './SingleReportPage.css';

const SingleReportPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [inputDate, setInputDate] = useState(
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  const dateRange = {
    startDate,
    endDate: new Date(new Date(startDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  const [habitId] = useState(6); // Default habit ID

  useEffect(() => {
    loadReportData();
  }, [startDate, habitId]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const data = await fetchWeeklyReport(
        dateRange.startDate,
        dateRange.endDate,
        habitId
      );
      setReportData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load report data');
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="single-report-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your habit report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="single-report-page">
        <div className="error-container">
          <h2>❌ Error Loading Report</h2>
          <p>{error}</p>
          <button onClick={loadReportData} className="retry-btn">🔄 Retry</button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="single-report-page">
        <div className="no-data-container">
          <h2>📊 No Data Available</h2>
          <p>No report data found for the selected period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="single-report-page">
      <div className="report-header">
        <h1>📊 Habit Progress Report</h1>
        <p className="report-subtitle">Track your journey to better habits</p>
        <div className="date-controls">
          <input
            type="date"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            onBlur={(e) => {
              const date = new Date(e.target.value);
              if (!isNaN(date.getTime()) && e.target.value.length === 10) {
                setStartDate(e.target.value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime()) && e.target.value.length === 10) {
                  setStartDate(e.target.value);
                }
              }
            }}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            readOnly
            className="readonly-date"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <ReportSummary 
        summary={reportData.summary}
        habitName={reportData.habit.habitName}
      />

      {/* Calendar and Stats Container */}
      <div className="report-content">
        {/* Left Column - Calendar */}
        <div className="calendar-section">
          <ReportCalendar 
            habitId={habitId}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>

        {/* Right Column - Stats */}
        <div className="stats-section">
          <WeekStats 
            title="📅 Current Week"
            stats={reportData.habit.thisWeek}
            weekRange={reportData.weekRange}
          />

          <WeekStats 
            title="📋 Previous Week"
            stats={reportData.habit.previousWeek}
          />
        </div>
      </div>

      {/* Full Width Comparison */}
      <WeekComparison 
        comparison={reportData.habit.weekOverWeekChange}
      />

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={loadReportData} className="action-btn primary">🔄 Refresh Report</button>
        <button className="action-btn secondary">📤 Export Report</button>
      </div>
    </div>
  );
};

export default SingleReportPage;