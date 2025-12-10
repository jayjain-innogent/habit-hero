import React, { useState, useEffect } from 'react';
import { fetchWeeklyReport } from '../services/api';
import './SingleReportPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Award, Target, Download} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
const SingleReportPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState('percentage');
    const [hoveredBar, setHoveredBar] = useState(null);
    const [hoveredDay, setHoveredDay] = useState(null);
    const { habitId } = useParams();
    const navigate = useNavigate();

     const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const generatePDFReport = () => {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.width;
        let yPosition = 20;

        pdf.setFontSize(20);
        pdf.setFont(undefined, 'bold');
        pdf.text('HABIT TRACKING REPORT', pageWidth/2, yPosition, { align: 'center' });
        
        yPosition += 15;
        pdf.setFontSize(16);
        pdf.text(habit.habitName, pageWidth/2, yPosition, { align: 'center' });
        
        yPosition += 10;
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Report Period: ${weekRange.startDate} to ${weekRange.endDate}`, pageWidth/2, yPosition, { align: 'center' });
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth/2, yPosition + 5, { align: 'center' });
        
        yPosition += 25;
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('PERFORMANCE SUMMARY', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Current Streak: ${summary.currentStreak || 0} days`, 20, yPosition);
        pdf.text(`Longest Streak: ${summary.longestStreak || 0} days`, 20, yPosition + 7);
        pdf.text(`Completion Rate: ${summary.completionRate || 0}%`, 20, yPosition + 14);
        pdf.text(`Total Missed Days: ${Math.abs(summary.totalMissedDays || 0)}`, 20, yPosition + 21);
        
        yPosition += 35;
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('WEEKLY BREAKDOWN', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        weekDates.forEach((date, i) => {
            const dateIndex = completionDates.findIndex(d => d.startsWith(date));
            const value = dateIndex >= 0 ? completionValues[dateIndex] : 0;
            const dayName = new Date(date).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'});
            const status = value > 0 ? 'Completed' : 'Missed';
            pdf.text(`${dayName}: ${status} ${value > 0 ? `(${value} ${habit.goalUnit || 'units'})` : ''}`, 20, yPosition);
            yPosition += 7;
        });
        
        if (completionValues.length > 0) {
            yPosition += 15;
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text('AGGREGATE DATA', 20, yPosition);
            yPosition += 15;
            
            const totalValue = completionValues.reduce((sum, val) => sum + val, 0);
            const avgValue = Math.round(totalValue / completionValues.length);
            
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Total ${habit.goalUnit || 'Units'}: ${totalValue}`, 20, yPosition);
            pdf.text(`Average per Day: ${avgValue} ${habit.goalUnit || 'units'}`, 20, yPosition + 7);
        }
        
        pdf.save(`${habit.habitName}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };
    useEffect(() => {
        loadReportData();
    }, [habitId]);

    const loadReportData = async () => {
        try {
            setLoading(true);
            const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const endDate = new Date(Date.now()).toISOString().split('T')[0];
            const data = await fetchWeeklyReport(startDate, endDate, habitId);
            setReportData(data);
            setError(null);
        } catch (err) {
            setError('Failed to load report data');
            console.error('Error loading report:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() - 1);
        setCurrentMonth(newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + 1);
        setCurrentMonth(newMonth);
    };

    const toggleViewMode = () => {
        const modes = ['percentage', 'days', 'value'];
        const currentIndex = modes.indexOf(viewMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setViewMode(modes[nextIndex]);
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
    if (error) return <div className="error-container"><p>{error}</p><button onClick={loadReportData} className="retry-btn">Retry</button></div>;
    if (!reportData?.habit || !reportData?.summary) return <div className="loading-container"><p>No data available</p></div>;

    const { summary, habit, weekRange } = reportData;
    
    const habitStartDate = new Date(habit.startDate);
    const today = new Date();
    const canGoPrevious = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) > new Date(habitStartDate.getFullYear(), habitStartDate.getMonth(), 1);
    const canGoNext = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) < new Date(today.getFullYear(), today.getMonth(), 1);

    const weekDates = [];
    const start = new Date(weekRange.startDate);
    const end = new Date(weekRange.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        weekDates.push(new Date(d).toISOString().split('T')[0]);
    }

    const completionDates = summary.habitCompletionsData?.completaionDate || [];
    const completionValues = summary.habitCompletionsData?.completionValue || [];
    const maxValue = completionValues.length > 0 ? Math.max(...completionValues) : 1;

    const getSnapshotValue = (weekData) => {
        if (viewMode === 'percentage') {
            return `${weekData?.completionPercentage || 0}%`;
        } else if (viewMode === 'days') {
            return `${weekData?.completedDays || 0}/${habit.sessionCount || 7}`;
        } else {
            return `${weekData?.completionsValue || 0}`;
        }
    };

   const getSnapshotDifferent = (weekChange) => {
        if (viewMode === 'percentage') {
            return `${weekChange?.percentageDiff || 0}%`;
        } else if (viewMode === 'days') {
            return `${weekChange.completedDaysDiff || 0}`;
        } else {
            return `${weekChange?.completionsDiff || 0}`;
        }
    };
  const getSubText = (goalUnit) => {
        if (viewMode === 'percentage') {
            return '% Completed';
        } else if (viewMode === 'days') {
            return 'Days Completed';
        } else {
            return (goalUnit == 'MINUTES' ? 'Minutes' :  goalUnit == 'REPEATS' ? 'Repeates' : 'Meters') + ' Completed';
        }
    };

    const getButtonLabel = () => {
        if (viewMode === 'percentage') return '% Percentage';
        if (viewMode === 'days') return 'Days';
        return 'Value';
    };

    return (
        <div className="report-page">
            <div className="report-container">
               <div className="header">
                   <div className="header-left">
                       {!isGeneratingPDF && (
                           <button onClick={() => navigate('/habits')} className="back-btn">
                               <ArrowLeft size={24} />
                           </button>
                       )}
                       <div>
                           {isGeneratingPDF ? (
                               <>
                                   <h1 className="title-GeneratingPdf">Habit Report: {habit.habitName}</h1>
                                   <h1 className="tagline-GeneratingPdf">Report Period: {weekRange.startDate} to {weekRange.endDate}</h1>
                               </>
                           ) : (
                               <>
                                   <h1 className="title">{habit.habitName}</h1>
                                   <h1 className="tagline">{habit.description}</h1>
                               </>
                           )}
                       </div>
                   </div>
                   {!isGeneratingPDF && (
                       <button onClick={generatePDFReport} className="generate-report-btn">
                           <Download size={20} />
                           Generate Report
                       </button>
                   )}
               </div>

                <div className="banner">
                    <div>
                        <h2 className="banner-title">"You're becoming consistent!"</h2>
                        <p className="banner-text">You've completed {summary.completionRate}% this week. Keep that momentum going!</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Current Streak</span>
                            <Zap size={20} />
                        </div>
                        <div className="stat-value">{summary.currentStreak || 0} <span className="stat-unit">Days</span></div>
                        <p className="stat-subtext">Goal: {summary.longestStreak || 0} Days</p>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Longest Streak</span>
                            <Award size={20} />
                        </div>
                        <div className="stat-value">{summary.longestStreak || 0} <span className="stat-unit">Days</span></div>
                        <p className="stat-subtext">Achieved in {new Date().toLocaleString('default', { month: 'short' })}</p>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Missed Days</span>
                            <Award size={20} />
                        </div>
                        <div className="stat-value">{Math.abs(summary.totalMissedDays)} <span className="stat-unit">Days</span></div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Next Milestone</span>
                            <Target size={20} />
                        </div>
                        <div className="stat-value">30 Days</div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{width: `${Math.min(((summary.currentStreak || 0)/30)*100, 100)}%`}}></div>
                        </div>
                        <p className="stat-subtext">{Math.max(30 - (summary.currentStreak || 0), 0)} days to go</p>
                    </div>
                </div>

                <div className="content-grid">
                    <div className="left-column">
                        <div className="card-header">
                            <h3>Habit Insights</h3>
                              <span className="card-label">Volume</span>
                        </div>
                        <div className="card">
                            <div className="chart-container">
                                {weekDates.length > 0 ? weekDates.map((date, i) => {
                                    const dateIndex = completionDates.findIndex(d => d.startsWith(date));
                                    const value = dateIndex >= 0 ? completionValues[dateIndex] : 0;
                                    const height = value > 0 ? (value / maxValue) * 100 : 0;
                                    return (
                                         <div
                                             key={i}
                                               className="bar-wrapper"
                                                   onMouseEnter={() => setHoveredBar(i)}
                                                   onMouseLeave={() => setHoveredBar(null)}>
                                                      <div className="bar-bg">
                                                          <div className={`bar-fill ${value > 0 ? 'completed' : 'missed'}`} style={{height: `${Math.max(height, 5)}%`}}></div>
                                                              </div>
                                                                 {hoveredBar === i && (
                                                                     <div className="bar-tooltip">
                                                                         {value} {habit.goalUnit}
                                                                     <div>Date: {date}</div>
                                                            </div>
                                                       )}
                                                   <span className="bar-label">{new Date(date).toLocaleDateString('en-US', {weekday: 'short'})[0]}</span>
                                         </div>
                                    );
                                }) : <p className="no-data">No data</p>}
                            </div>
                        </div>

                        <div className="card-header">
                                <h3>Weekly Snapshot</h3>
                                <button className="card-label" onClick={toggleViewMode}>{getButtonLabel()}</button>
                        </div>

                            <div className="snapshot-grid">
                                <div className="snapshot-card">
                                    <p className="snapshot-label">Last Week</p>
                                    <p className="snapshot-value">{getSnapshotValue(habit.previousWeek)}</p>
                                    <p className="snapshot-subtext">{getSubText(habit.goalUnit)}</p>
                                </div>
                                <div className="snapshot-card current">
                                    <p className="snapshot-label">Current Week</p>
                                    <p className="snapshot-value">{getSnapshotValue(habit.thisWeek)}</p>
                                    <p className="snapshot-change">{ getSnapshotDifferent(habit.weekOverWeekChange)} </p>
                                    <p className="snapshot-subtext">{getSubText(habit.goalUnit)}</p>
                                </div>
                                <div className="snapshot-card">
                                    <p className="snapshot-label">Missed Days</p>
                                    <p className="snapshot-value">{habit.thisWeek?.missedDays || 0}</p>
                                    <p className="snapshot-subtext">This week</p>
                                </div>
                            </div>

                    </div>

                    <div className="right-column">
                        <h3>Recent Activity</h3>
                        <div className="card">
                            <div className="activity-list">
                                {completionDates.length > 0 ? completionDates.slice(0, 5).map((dateTime, i) => (
                                    <div key={i} className="activity-item">
                                        <div className="activity-left">
                                            <div className="activity-dot completed"></div>
                                            <div>
                                                <p className="activity-date">{i === 0 ? 'Today' : new Date(dateTime).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</p>
                                                <p className="activity-value">{completionValues[i]} Units</p>
                                            </div>
                                        </div>
                                        <span className="activity-time">{new Date(dateTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</span>
                                    </div>
                                )) : <p className="no-data">No activity</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="month-grid">
                    <div className="card-header">
                        <h3>Monthly Activity</h3>
                        <div className="month-nav">
                            <button onClick={handlePreviousMonth} disabled={!canGoPrevious}>←</button>
                            <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            <button onClick={handleNextMonth} disabled={!canGoNext}>→</button>
                        </div>
                    </div>
                 <div className="calendar-grid">
                     {Array.from({length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()}, (_, i) => {
                         const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1).toISOString().split('T')[0];
                         const dateIndex = completionDates.findIndex(d => d.startsWith(dayDate));
                         const dayValue = dateIndex >= 0 ? completionValues[dateIndex] : null;
                         const completed = dayValue !== null;
                         const intensity = completed ? 'high' : 'none';
                         return <div key={i}
                                     className={`calendar-day ${intensity}`}
                                     onMouseEnter={() => setHoveredDay(i)}
                                     onMouseLeave={() => setHoveredDay(null)}>
                                    {hoveredDay === i && (
                                        <div className="calendar-tooltip">
                                            <div>{dayValue || 0 } {habit.goalUnit}</div>
                                            <div>Date: {new Date(dayDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
                                        </div>
                                    )}
                                 </div>;
                     })}
                 </div>
                    <div className="legend">
                        <div className="legend-item"><div className="legend-box none"></div> Not Done</div>
                        <div className="legend-item"><div className="legend-box high"></div> Completed</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleReportPage;
