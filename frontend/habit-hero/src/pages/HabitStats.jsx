import React, { useState, useEffect } from 'react';
import { fetchWeeklyReport } from '../services/api';
import './HabitStats.css';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Award, Target, Download, ThumbsDown, Info } from 'lucide-react';
const HabitStats = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState('value');
    const [hoveredBar, setHoveredBar] = useState(null);
    const [hoveredDay, setHoveredDay] = useState(null);
    const { habitId } = useParams();
    const navigate = useNavigate();



    const generatePDFReport = async () => {
        try {
            // Validate data exists
            if (!reportData || !reportData.summary || !reportData.habit || !reportData.weekRange) {
                alert('Report data is not available. Please try again.');
                return;
            }

            const { summary, habit, weekRange } = reportData;

            // Calculate week dates - last 7 days from today
            const weekDates = [];
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                weekDates.push(`${year}-${month}-${day}`);
            }

            // Handle both property name variations (typo fix)
            const completionDates = summary.habitCompletionsData?.completaionDate || [];
            const completionValues = summary.habitCompletionsData?.completionValue || [];

            const totalDays = weekDates.length;
            const completedDays = completionDates.length;
            const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
            const totalRepetitions = completionValues.reduce((sum, val) => sum + (val || 0), 0);
            const avgRepetitions = completedDays > 0 ? (totalRepetitions / completedDays).toFixed(1) : 0;

            // Create HTML content using Dashboard template structure
            const currentDate = new Date().toLocaleDateString();
            const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).toLocaleDateString();
            const endDate = new Date().toLocaleDateString();

            // Create card data for habit stats
            const cardData = [
                { title: 'Completion Rate', value: `${completionRate}%` },
                { title: 'Current Streak', value: `${summary.currentStreak || 0}` },
                { title: 'Longest Streak', value: `${summary.longestStreak || 0}` },
                { title: 'Days Completed', value: `${completedDays}/${totalDays}` },
                { title: 'Total ' + (habit.goalUnit || 'Reps'), value: `${totalRepetitions}` }
            ];

            // Create daily breakdown data
            const dailyData = weekDates.map(date => {
                const dateIndex = completionDates.findIndex(d => d.startsWith(date));
                const value = dateIndex >= 0 ? completionValues[dateIndex] : 0;
                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                const dateFormatted = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const status = value > 0 ? 'Completed' : 'Missed';
                const time = value > 0 ? new Date(completionDates[dateIndex] || date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
                const notes = value > 0 ? `${value} ${habit.goalUnit?.toLowerCase() || 'rep'}` : '—';
                return { date: dateFormatted, day: dayName, status, time, notes, value, completionRate: value > 0 ? 100 : 0 };
            });

            const topPerformers = dailyData.filter(d => d.value > 0).slice(0, 3);
            const needsImprovement = dailyData.filter(d => d.value === 0).slice(0, 3);

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; color: #333; line-height: 1.6; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; }
        .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; margin-bottom: 40px; border-radius: 16px; box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3); position: relative; overflow: hidden; }
        .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat; pointer-events: none; }
        .header h1 { font-size: 36px; color: white; margin-bottom: 8px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2); position: relative; z-index: 1; }
        .header-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; padding-top: 20px; font-size: 14px; color: rgba(255,255,255,0.9); border-top: 1px solid rgba(255,255,255,0.2); position: relative; z-index: 1; }
        .meta-item { text-align: center; }
        .meta-label { font-weight: bold; color: white; margin-bottom: 4px; display: block; }
        .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 40px; }
        .kpi-card { color: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .kpi-card.danger { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .kpi-card.warning { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        .kpi-card.success { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .kpi-card.info { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .kpi-card.primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .kpi-value { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
        .kpi-label { font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px; }
        .section { margin-bottom: 40px; }
        .section-title { font-size: 20px; font-weight: bold; color: #2c3e50; border-left: 4px solid #667eea; padding-left: 15px; margin-bottom: 20px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 12px 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .progress-item { margin-bottom: 20px; }
        .progress-label { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; font-weight: 500; }
        .progress-bar { height: 30px; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 15px; overflow: hidden; position: relative; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
        .progress-fill { height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: flex-end; padding-right: 12px; color: white; font-size: 13px; font-weight: bold; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 12px; text-align: left; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-size: 12px; }
        td { padding: 14px 12px; border-bottom: 1px solid #e2e8f0; transition: background-color 0.2s; }
        tr:nth-child(even) { background-color: #f8fafc; }
        tr:hover { background-color: #f1f5f9; }
        .status-excellent { color: #27ae60; font-weight: bold; }
        .status-good { color: #3498db; font-weight: bold; }
        .status-warning { color: #e67e22; font-weight: bold; }
        .status-critical { color: #e74c3c; font-weight: bold; }
        .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .two-column .section { background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .two-column .section-title { background: none; box-shadow: none; padding: 0 0 0 15px; margin-bottom: 15px; }
        .insight-box { background-color: #ecf0f1; border-left: 4px solid #3498db; padding: 15px; margin-bottom: 15px; border-radius: 4px; }
        .insight-box.success { background-color: #d5f4e6; border-left-color: #27ae60; }
        .insight-box.warning { background-color: #fdebd0; border-left-color: #e67e22; }
        .insight-box.critical { background-color: #fadbd8; border-left-color: #e74c3c; }
        .insight-title { font-weight: bold; margin-bottom: 8px; font-size: 14px; }
        .insight-content { font-size: 13px; color: #555; }
        .motivational-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center; }
        .motivational-section h2 { font-size: 24px; margin-bottom: 15px; }
        .footer { border-top: 2px solid #ecf0f1; padding-top: 20px; margin-top: 40px; text-align: center; font-size: 12px; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 ${habit.habitName.toUpperCase()} HABIT REPORT</h1>
            <h3 style="color: rgba(255,255,255,0.9); margin-top: 10px; font-weight: 400; position: relative; z-index: 1;">Weekly Performance Analysis</h3>
            <div class="header-meta">
                <div class="meta-item">
                    <div class="meta-label">Report Period</div>
                    <div>${startDate} to ${endDate}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Generated</div>
                    <div>${currentDate}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Tracking Days</div>
                    <div>${totalDays} Days</div>
                </div>
            </div>
        </div>

        <div class="kpi-grid">
            ${cardData.map((card, index) => {
                const cardTypes = ['danger', 'info', 'success', 'primary', 'warning'];
                const cardType = cardTypes[index % cardTypes.length];
                return `
                <div class="kpi-card ${cardType}">
                    <div class="kpi-value">${card.value}</div>
                    <div class="kpi-label">${card.title}</div>
                </div>`;
            }).join('')}
        </div>

        <div class="section">
            <h2 class="section-title">🎯 Overall Progress</h2>
            <div class="progress-item">
                <div class="progress-label">
                    <span>Weekly Completion Rate</span>
                    <span style="font-weight: bold; color: ${completionRate >= 60 ? '#27ae60' : '#e74c3c'};">${completionRate}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${completionRate}%;">${completionRate}%</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">📈 Daily Performance Breakdown</h2>
            <table>
                <thead>
                    <tr><th>Date</th><th>Day</th><th>Status</th><th>Value</th><th>Time</th></tr>
                </thead>
                <tbody>
                    ${dailyData.map(day => `
                        <tr>
                            <td><strong>${day.date}</strong></td>
                            <td>${day.day}</td>
                            <td><span class="${day.value > 0 ? 'status-excellent' : 'status-critical'}">
                                ${day.value > 0 ? '✅ Completed' : '❌ Missed'}
                            </span></td>
                            <td>${day.notes}</td>
                            <td>${day.time}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="two-column">
            <div class="section">
                <h2 class="section-title">🏆 Completed Days</h2>
                <table>
                    <thead><tr><th>Date</th><th>Value</th><th>Time</th></tr></thead>
                    <tbody>
                        ${topPerformers.map(day => `
                            <tr>
                                <td>${day.date}</td>
                                <td style="color: #27ae60; font-weight: bold;">${day.notes}</td>
                                <td>${day.time}</td>
                            </tr>
                        `).join('')}
                        ${topPerformers.length === 0 ? '<tr><td colspan="3" style="text-align: center; color: #666;">No completed days this week</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
            <div class="section">
                <h2 class="section-title">⚠️ Missed Days</h2>
                <table>
                    <thead><tr><th>Date</th><th>Day</th><th>Status</th></tr></thead>
                    <tbody>
                        ${needsImprovement.map(day => `
                            <tr>
                                <td>${day.date}</td>
                                <td>${day.day}</td>
                                <td style="color: #e74c3c; font-weight: bold;">Missed</td>
                            </tr>
                        `).join('')}
                        ${needsImprovement.length === 0 ? '<tr><td colspan="3" style="text-align: center; color: #666;">No missed days this week!</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">💡 Key Insights & Analysis</h2>
            <div class="insight-box ${completionRate >= 70 ? 'success' : completionRate >= 40 ? 'warning' : 'critical'}">
                <div class="insight-title">✅ Performance Summary</div>
                <div class="insight-content">
                    <strong>Completion Rate:</strong> ${completionRate}% (${completedDays}/${totalDays} days)<br>
                    <strong>Current Streak:</strong> ${summary.currentStreak || 0} days<br>
                    <strong>Total ${habit.goalUnit || 'Repetitions'}:</strong> ${totalRepetitions}<br>
                    <strong>Average per Day:</strong> ${avgRepetitions} ${habit.goalUnit?.toLowerCase() || 'reps'}
                </div>
            </div>
            <div class="insight-box ${summary.currentStreak > 0 ? 'success' : 'warning'}">
                <div class="insight-title">${summary.currentStreak > 0 ? '🔥 Streak Active' : '⚠️ Streak Building Needed'}</div>
                <div class="insight-content">
                    ${summary.currentStreak > 0 
                        ? `Great momentum! Your ${summary.currentStreak}-day streak shows consistency. Keep it going!`
                        : 'Focus on building a streak by completing the habit on consecutive days.'}
                </div>
            </div>
            ${completionRate < 60 ? `
            <div class="insight-box critical">
                <div class="insight-title">🎯 Areas for Improvement</div>
                <div class="insight-content">
                    <strong>Consistency:</strong> ${totalDays - completedDays} missed days this week<br>
                    <strong>Target:</strong> Aim for at least 5/7 days (71%) completion rate<br>
                    <strong>Recommendation:</strong> Set daily reminders and identify optimal timing
                </div>
            </div>` : ''}
        </div>

        <div class="motivational-section">
            <h2>🌟 Keep Building Your ${habit.habitName} Habit!</h2>
            <p>${completedDays > 0 
                ? `Great progress! You completed ${completedDays} days this week. ${summary.currentStreak > 0 ? `Your ${summary.currentStreak}-day streak shows commitment!` : 'Focus on building a streak next week.'}` 
                : 'Every journey starts with a single step! This week is your baseline - you can only go up from here.'}</p>
        </div>

        <div class="footer">
            <p><strong>📋 Report Metadata</strong><br>
            Generated: ${currentDate} | Habit: ${habit.habitName} | Goal: ${habit.targetValue || 'Daily'} ${habit.goalUnit || 'Completion'} | Report Version: Professional PDF Template</p>
        </div>
    </div>
</body>
</html>`;

            // Generate PDF using html2pdf
            const options = {
                margin: 0.5,
                filename: `${habit.habitName}_Report_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            // Import html2pdf dynamically
            const html2pdf = (await import('html2pdf.js')).default;
            html2pdf().set(options).from(htmlContent).save();

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report. Please try again.');
        }
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
    if (!reportData) {
        console.log('No report data:', reportData);
        return <div className="loading-container"><p>No data available</p></div>;
    }
    if (!reportData.habit || !reportData.summary) {
        console.log('Missing habit or summary:', reportData);
        return <div className="loading-container"><p>Invalid data structure</p></div>;
    }

    const { summary, habit, weekRange } = reportData;

    const habitStartDate = new Date(habit.startDate);
    const today = new Date();
    const canGoPrevious = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) > new Date(habitStartDate.getFullYear(), habitStartDate.getMonth(), 1);
    const canGoNext = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) < new Date(today.getFullYear(), today.getMonth(), 1);

    const weekDates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        weekDates.push(`${year}-${month}-${day}`);
    }

    const completionDates = summary.habitCompletionsData?.completaionDate || [];
    const completionValues = summary.habitCompletionsData?.completionValue || [];
    const maxValue = habit.targetValue || 100;

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
            return weekChange?.percentageDiff || 0;
        } else if (viewMode === 'days') {
            return weekChange?.completedDaysDiff || 0;
        } else {
            return weekChange?.completionsDiff || 0;
        }
    };
    const getSubText = (goalUnit) => {
        if (viewMode === 'percentage') {
            return '% Completed';
        } else if (viewMode === 'days') {
            return 'Days Completed';
        } else {
            return (goalUnit == 'MINUTES' ? 'Minutes' : goalUnit == 'REPEATS' ? 'Repeates' : 'Meters') + ' Completed';
        }
    };

    const getButtonLabel = () => {
        if (viewMode === 'percentage') return '% Percentage';
        if (viewMode === 'days') return 'Days';
        return 'Value';
    };

    // Compute tagline text based on cadence and goalType
    const taglineText = (() => {
        const cadence = habit?.cadence;
        const goalType = habit?.goalType;
        const sessionCount = habit?.sessionCount || 0;
        const targetValue = habit?.targetValue || 0;
        const goalUnit = habit?.goalUnit || '';
        const totalTarget = sessionCount * targetValue;

        if (cadence === 'DAILY' && goalType === 'OFF') return 'Daily';
        if (cadence === 'DAILY' && goalType !== 'OFF') return `${targetValue} ${goalUnit} / Daily`;
        if (cadence !== 'DAILY' && goalType === 'OFF') return `${habit?.sessionCount} days / ${cadence}`;
        return `${totalTarget} ${goalUnit} / ${cadence}`;
    })();

    return (
        <div className="report-page">
            <div className="report-container">
                <div className="header">
                    <div className="header-left">
                        <button onClick={() => navigate('/habits')} className="back-btn">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="title">{habit.habitName}</h1>
                            <h1 className="tagline">{taglineText}</h1>
                        </div>
                    </div>
                    <button onClick={generatePDFReport} className="generate-report-btn">
                        <Download size={20} />
                        Generate Report
                    </button>
                </div>

                <div className="banner">
                    <div>
                        <h2 className="banner-title">"You're becoming consistent!"</h2>
                        <p className="banner-text">You've completed {getSnapshotValue(habit.thisWeek)} days this week. Keep that momentum going!</p>
                    </div>
                </div>

                <div className="stats-grid">

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">
                                Total Completion <span className="small text-muted ms-1">(Lifetime)</span>
                                <span
                                    className="info-wrapper"
                                    tabIndex={0}
                                    aria-describedby={`lifetime-tooltip-${habit.habitId || habit.habitName}`}
                                >
                                    <Info size={14} className="info-icon" />
                                    <span
                                        id={`lifetime-tooltip-${habit.habitId || habit.habitName}`}
                                        role="tooltip"
                                        className="info-tooltip"
                                    >
                                        Lifetime completion:from habit start date to today
                                    </span>
                                </span>
                            </span>
                            <Target size={20} />
                        </div>
                        <div className="stat-value">{summary.currentCompletion} {habit.goalUnit ? habit.goalUnit : summary.currentCompletion >= 2 ? 'Days' : 'Day'}</div>
                    </div>

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
                            <ThumbsDown size={20} />
                        </div>
                        <div className="stat-value">{Math.abs(summary.totalMissedDays)} <span className="stat-unit">Days</span></div>
                    </div>
                </div>

                <div className="content-grid">
                    <div className="left-column">
                        <div className="card-header">
                            <h3>Habit Insights</h3>
                        </div>
                        <div className="card">
                            <div className="chart-container">
                                {weekDates.length > 0 ? weekDates.map((date, i) => {
                                    const dateIndex = completionDates.findIndex(d => d.startsWith(date));
                                    const value = dateIndex >= 0 ? completionValues[dateIndex] : 0;
                                    const height = habit.targetValue ? value > 0 ? (value / maxValue) * 100 : 0 : 100;
                                    const currentDate = new Date(date);
                                    const isBeforeHabitStart = currentDate < new Date(habit.startDate);
                                    const barClass = isBeforeHabitStart ? 'not-applicable' : (value > 0 ? 'completed' : 'missed');
                                    return (
                                        <div
                                            key={i}
                                            className="bar-wrapper"
                                            onMouseEnter={() => setHoveredBar(i)}
                                            onMouseLeave={() => setHoveredBar(null)}>
                                            <div className="bar-bg">
                                                <div className={`bar-fill ${barClass}`} style={{ height: `${Math.max(height, 5)}%` }}></div>
                                            </div>
                                            {hoveredBar === i && (
                                                <div className="bar-tooltip">
                                                    {isBeforeHabitStart ? 'Not started' : 
                                                     habit.goalUnit ? `${value} ${habit.goalUnit}` : 
                                                     (value > 0 ? 'Completed' : 'Missed')}
                                                    <div>Date: {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                                </div>
                                            )}
                                            <span className="bar-label">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })[0]}</span>
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
                            <div className="snapshot-card">
                                <p className="snapshot-label">Current Week</p>
                                <p className="snapshot-value">{getSnapshotValue(habit.thisWeek)}</p>
                                <p className={`snapshot-change ${getSnapshotDifferent(habit.weekOverWeekChange) > 0 ? 'positive' : getSnapshotDifferent(habit.weekOverWeekChange) < 0 ? 'negative' : 'neutral'}`}>
                                    {getSnapshotDifferent(habit.weekOverWeekChange) > 0 ? '↗' : getSnapshotDifferent(habit.weekOverWeekChange) < 0 ? '↘' : '→'} {getSnapshotDifferent(habit.weekOverWeekChange)}
                                     <p className="snapshot-subtext">{getSubText(habit.goalUnit)}</p>
                                </p>

                            </div>
                            <div className="snapshot-card">
                                <p className="snapshot-label">Missed Days</p>
                                <p className="snapshot-value">{habit.thisWeek?.missedDays || 0}</p>
                                <p className="snapshot-subtext">This week</p>
                            </div>
                        </div>

                    </div>

                    <div className="right-column">
                        <div className="card-header">

                            <h3>Recent Activity</h3>
                        </div>
                        <div className="card">
                            <div className="activity-list">
                                {completionDates.length > 0 ? completionDates.slice(0, 7).map((dateTime, i) => (
                                    <div key={i} className="activity-item">
                                        <div className="activity-left">
                                            <div className="activity-dot completed"></div>
                                            <div>
                                                <p className="activity-date">{i === 0 ? 'Today' : new Date(dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                                <p className="activity-value">{completionValues[i]} Units</p>
                                            </div>
                                        </div>
                                        <span className="activity-time">{new Date(dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
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
                        {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }, (_, i) => {
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
                                        <div>{dayValue || 0} {habit.goalUnit}</div>
                                        <div>Date: {new Date(dayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
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

export default HabitStats;
