import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeeklyReport } from '../services/api';
import ReportSummary from '../components/Report/ReportSummary';
import ReportCalendar from '../components/Report/ReportCalendar';
import WeekStats from '../components/Report/WeekStats';
import WeekComparison from '../components/Report/WeekComparison';
import TrendChart from '../components/Report/TrendChart';
import './SingleReportPage.css';
import { FaChartBar } from "react-icons/fa";

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
  const [habitId] = useState(6); 

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
          <h2><i class="bi bi-x-lg"></i>Error Loading Report</h2>
          <p>{error}</p>
          <button onClick={loadReportData} className="retry-btn"><i class="bi bi-arrow-repeat"></i></button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="single-report-page">
        <div className="no-data-container">
          <h2><i class="bi bi-graph-up"></i>No Data Available</h2>
          <p>No report data found for the selected period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="single-report-page">
      <div className="report-header">
        <h1><FaChartBar size={24} color= "White" /> Habit Progress Report</h1>
        <p className="report-subtitle">Track your journey to better habits</p>
           {/* Summary Cards */}
      <ReportSummary 
        summary={reportData.summary}
        habitName={reportData.habit.habitName}
      />
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
      {/* Calendar and Stats Container */}
      <div className="report-content">
        {/* Left Column - Calendar and Trend */}
        <div className="calendar-section">
          <ReportCalendar 
            habitId={habitId}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          
          <WeekComparison 
            comparison={reportData.habit.weekOverWeekChange}
          />
        </div>

        {/* Right Column - Stats and Comparison */}
        <div className="stats-section">
          <WeekStats 
            title=<i class="bi bi-calendar-event">  Current Week</i>
            stats={reportData.habit.thisWeek}
            weekRange={reportData.weekRange}
          />

          <WeekStats 
            title=<i class="bi bi-calendar-event-fill">  Previous Week</i>
            stats={reportData.habit.previousWeek}
          />
         <TrendChart 
            trendData={reportData.habit.dailyTrend}
            startDate={dateRange.startDate}
          />
          
        </div>
      </div>
      <div className="quick-actions">
        <button onClick={loadReportData} className="action-btn primary">🔄 Refresh Report</button>
        <button className="action-btn secondary">📤 Export Report</button>
      </div>
    </div>
  );
};

export default SingleReportPage;