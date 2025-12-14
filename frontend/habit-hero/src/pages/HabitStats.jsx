import React, { useState, useEffect } from 'react';
import { fetchWeeklyReport } from '../services/api';
import './HabitStats.css';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Award, Target, Download, ThumbsDown, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
const HabitStats = () => {
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

    const generatePDFReport = async () => {
        setIsGeneratingPDF(true);

        try {
            // Validate data exists
            if (!reportData || !reportData.summary || !reportData.habit || !reportData.weekRange) {
                alert('Report data is not available. Please try again.');
                setIsGeneratingPDF(false);
                return;
            }

            const { summary, habit, weekRange } = reportData;

            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.width;
            const pageHeight = pdf.internal.pageSize.height;
            let yPosition = 20;

            // Calculate week dates
            const weekDates = [];
            const start = new Date(weekRange.startDate);
            const end = new Date(weekRange.endDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                weekDates.push(new Date(d).toISOString().split('T')[0]);
            }

            // Debug logging
            console.log('GeneratePDF - Report Data:', { summary, habit, weekRange });
            console.log('GeneratePDF - Habit Completions Data:', summary.habitCompletionsData);

            // Handle both property name variations (typo fix)
            const completionDates = summary.habitCompletionsData?.completaionDate;
            const completionValues = summary.habitCompletionsData?.completionValue || [];

            console.log('GeneratePDF - Completion Data:', {
                completionDates,
                completionValues,
                completionDatesCount: completionDates.length,
                completionValuesCount: completionValues.length
            });

            const totalDays = weekDates.length;
            const completedDays = completionDates.length;
            const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
            const totalRepetitions = completionValues.reduce((sum, val) => sum + (val || 0), 0);
            const avgRepetitions = completedDays > 0 ? (totalRepetitions / completedDays).toFixed(1) : 0;

            console.log('GeneratePDF - Calculated Metrics:', {
                totalDays,
                completedDays,
                completionRate,
                totalRepetitions,
                avgRepetitions
            });

            const addNewPageIfNeeded = (requiredSpace) => {
                if (yPosition + requiredSpace > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 20;
                }
            };

            // Header
            pdf.setFontSize(20);
            pdf.setFont(undefined, 'bold');
            pdf.text(`${habit.habitName.toUpperCase()} HABIT REPORT`, pageWidth / 2, yPosition, { align: 'center' });

            yPosition += 15;
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Report Period: ${new Date(weekRange.startDate).toLocaleDateString()} - ${new Date(weekRange.endDate).toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 7;
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 7;
            pdf.text(`Tracking Duration: ${totalDays} days`, pageWidth / 2, yPosition, { align: 'center' });

            yPosition += 25;

            // Add Circular Progress Indicators
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text('KEY METRICS', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Draw circular progress for completion rate
            const centerX1 = 60;
            const centerY1 = yPosition + 20;
            const radius = 15;

            // Background circle
            pdf.setDrawColor(220, 220, 220);
            pdf.setLineWidth(3);
            pdf.circle(centerX1, centerY1, radius);

            // Progress arc
            const progressAngle = (completionRate / 100) * 360;
            pdf.setDrawColor(34, 197, 94);
            pdf.setLineWidth(4);

            // Draw progress arc (simplified as multiple small lines)
            for (let angle = 0; angle < progressAngle; angle += 5) {
                const x1 = centerX1 + (radius - 2) * Math.cos((angle - 90) * Math.PI / 180);
                const y1 = centerY1 + (radius - 2) * Math.sin((angle - 90) * Math.PI / 180);
                const x2 = centerX1 + (radius + 2) * Math.cos((angle - 90) * Math.PI / 180);
                const y2 = centerY1 + (radius + 2) * Math.sin((angle - 90) * Math.PI / 180);
                pdf.line(x1, y1, x2, y2);
            }

            // Add percentage text
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            pdf.text(`${completionRate}%`, centerX1, centerY1 + 2, { align: 'center' });
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'normal');
            pdf.text('Completion', centerX1, centerY1 + 30, { align: 'center' });

            // Draw streak indicator
            const centerX2 = 130;
            const centerY2 = yPosition + 20;

            // Streak circle
            pdf.setDrawColor(251, 191, 36);
            pdf.setLineWidth(3);
            pdf.circle(centerX2, centerY2, radius);

            // Streak progress
            const streakProgress = Math.min((summary.currentStreak || 0) / 7, 1) * 360;
            pdf.setDrawColor(245, 158, 11);
            pdf.setLineWidth(4);

            for (let angle = 0; angle < streakProgress; angle += 5) {
                const x1 = centerX2 + (radius - 2) * Math.cos((angle - 90) * Math.PI / 180);
                const y1 = centerY2 + (radius - 2) * Math.sin((angle - 90) * Math.PI / 180);
                const x2 = centerX2 + (radius + 2) * Math.cos((angle - 90) * Math.PI / 180);
                const y2 = centerY2 + (radius + 2) * Math.sin((angle - 90) * Math.PI / 180);
                pdf.line(x1, y1, x2, y2);
            }

            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            pdf.text(`${summary.currentStreak || 0}`, centerX2, centerY2 + 2, { align: 'center' });
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'normal');
            pdf.text('Day Streak', centerX2, centerY2 + 30, { align: 'center' });

            yPosition += 50;

            // Performance Summary with Visual Progress Bars
            addNewPageIfNeeded(80);
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('PERFORMANCE SUMMARY', 20, yPosition);
            yPosition += 15;

            // Add visual progress bar for completion rate
            pdf.setFontSize(12);
            pdf.text(`Completion Rate: ${completionRate}%`, 25, yPosition);

            // Draw progress bar
            const barWidth = 100;
            const barHeight = 8;
            const barX = 25;
            const barY = yPosition + 5;

            // Background bar
            pdf.setFillColor(240, 240, 240);
            pdf.rect(barX, barY, barWidth, barHeight, 'F');

            // Progress fill
            const fillWidth = (completionRate / 100) * barWidth;
            const fillColor = completionRate >= 80 ? [34, 197, 94] : completionRate >= 60 ? [251, 191, 36] : [239, 68, 68];
            pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
            pdf.rect(barX, barY, fillWidth, barHeight, 'F');

            yPosition += 20;

            pdf.setFontSize(14);
            pdf.text('Key Metrics at a Glance', 20, yPosition);
            yPosition += 10;

            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            const metrics = [
                [`Completion Rate: ${completionRate}%`, completionRate >= 90 ? 'Excellent' : completionRate >= 70 ? 'Good' : 'Needs Focus'],
                [`Days Completed: ${completedDays}/${totalDays}`, completedDays >= totalDays * 0.7 ? 'Good' : 'Needs Focus'],
                [`Current Streak: ${summary.currentStreak || 0} days`, summary.currentStreak > 0 ? 'Active' : 'Inactive'],
                [`Longest Streak: ${summary.longestStreak || 0} days`, 'Best'],
                [`Days Missed: ${totalDays - completedDays}`, totalDays - completedDays <= 2 ? 'Good' : 'Needs Focus']
            ];

            metrics.forEach(([metric, status]) => {
                pdf.text(metric, 25, yPosition);
                pdf.text(status, 140, yPosition);
                yPosition += 7;
            });

            yPosition += 15;

            // Add Bar Chart Visual
            addNewPageIfNeeded(100);
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('WEEKLY PERFORMANCE CHART', 20, yPosition);
            yPosition += 15;

            try {
                const chartElement = document.querySelector('.chart-container');
                if (chartElement) {
                    const canvas = await html2canvas(chartElement, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                        useCORS: true
                    });
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = 160;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    pdf.addImage(imgData, 'PNG', 25, yPosition, imgWidth, imgHeight);
                    yPosition += imgHeight + 15;
                }
            } catch (error) {
                console.error('Error capturing chart:', error);
                pdf.setFontSize(11);
                pdf.text('Chart visualization unavailable', 25, yPosition);
                yPosition += 10;
            }

            // Add Monthly Calendar Visual
            addNewPageIfNeeded(120);
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('MONTHLY ACTIVITY HEATMAP', 20, yPosition);
            yPosition += 15;

            try {
                const calendarElement = document.querySelector('.calendar-grid');
                if (calendarElement) {
                    const canvas = await html2canvas(calendarElement, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                        useCORS: true
                    });
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = 160;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    pdf.addImage(imgData, 'PNG', 25, yPosition, imgWidth, imgHeight);
                    yPosition += imgHeight + 15;
                }
            } catch (error) {
                console.error('Error capturing calendar:', error);
                pdf.setFontSize(11);
                pdf.text('Calendar visualization unavailable', 25, yPosition);
                yPosition += 10;
            }

            // Weekly Breakdown
            addNewPageIfNeeded(80);
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('WEEKLY BREAKDOWN', 20, yPosition);
            yPosition += 15;

            pdf.setFontSize(14);
            pdf.text('Daily Performance', 20, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            pdf.text('Date', 25, yPosition);
            pdf.text('Day', 55, yPosition);
            pdf.text('Status', 85, yPosition);
            pdf.text('Time', 125, yPosition);
            pdf.text('Notes', 155, yPosition);
            yPosition += 7;

            pdf.setFont(undefined, 'normal');
            weekDates.forEach(date => {
                const dateIndex = completionDates.findIndex(d => d.startsWith(date));
                const value = dateIndex >= 0 ? completionValues[dateIndex] : 0;
                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                const dateFormatted = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const status = value > 0 ? 'Completed' : 'Missed';
                const time = value > 0 ? new Date(completionDates[dateIndex] || date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
                const notes = value > 0 ? `${value} ${habit.goalUnit?.toLowerCase() || 'rep'}` : '—';

                addNewPageIfNeeded(7);
                pdf.text(dateFormatted, 25, yPosition);
                pdf.text(dayName, 55, yPosition);
                pdf.text(status, 85, yPosition);
                pdf.text(time, 125, yPosition);
                pdf.text(notes, 155, yPosition);
                yPosition += 7;
            });

            yPosition += 15;

            // Add Statistics Visual Chart
            addNewPageIfNeeded(100);
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('STATISTICS OVERVIEW', 20, yPosition);
            yPosition += 15;

            // Create a simple bar chart for weekly performance
            const chartData = weekDates.map(date => {
                const dateIndex = completionDates.findIndex(d => d.startsWith(date));
                return dateIndex >= 0 ? completionValues[dateIndex] : 0;
            });

            const chartWidth = 140;
            const chartHeight = 60;
            const chartX = 25;
            const chartY = yPosition;
            const maxChartValue = Math.max(...chartData, 1);

            // Draw chart background
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(chartX, chartY, chartWidth, chartHeight);

            // Draw bars
            const chartBarWidth = chartWidth / (chartData.length > 0 ? chartData.length : 1);
            chartData.forEach((value, index) => {
                const barHeight = (value / maxChartValue) * (chartHeight - 10);
                const barX = chartX + (index * chartBarWidth) + 2;
                const barY = chartY + chartHeight - barHeight - 5;

                const barColor = value > 0 ? [34, 197, 94] : [239, 68, 68];
                pdf.setFillColor(barColor[0], barColor[1], barColor[2]);
                pdf.rect(barX, barY, chartBarWidth - 4, barHeight, 'F');
            });

            // Add day labels
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            weekDates.forEach((date, index) => {
                const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' })[0];
                const labelX = chartX + (index * chartBarWidth) + (chartBarWidth / 2);
                pdf.text(dayLabel, labelX, chartY + chartHeight + 8, { align: 'center' });
            });

            pdf.setTextColor(0, 0, 0);
            yPosition += chartHeight + 20;

            // Aggregate Data & Insights
            addNewPageIfNeeded(80);
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('AGGREGATE DATA & INSIGHTS', 20, yPosition);
            yPosition += 15;

            pdf.setFontSize(14);
            pdf.text('Summary Statistics', 20, yPosition);
            yPosition += 10;

            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            const stats = [
                `Total Completions: ${completedDays} days`,
                `Total ${habit.goalUnit || 'Repetitions'}: ${totalRepetitions}`,
                `Average Daily ${habit.goalUnit || 'Repetitions'}: ${(totalRepetitions / totalDays).toFixed(2)}`,
                `Completion Consistency: ${Math.min(Math.floor(completionRate / 20), 5)}/5 stars`
            ];

            stats.forEach(stat => {
                pdf.text(`• ${stat}`, 25, yPosition);
                yPosition += 7;
            });

            yPosition += 10;

            // Performance Analysis
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text('Performance Analysis', 20, yPosition);
            yPosition += 10;

            pdf.setFontSize(12);
            pdf.text('What\'s Working Well:', 25, yPosition);
            yPosition += 7;

            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            const workingWell = [
                completedDays > 0 ? `Consistent execution: ${completedDays}/${totalDays} days completed` : 'Getting started with habit tracking',
                summary.currentStreak > 0 ? `Active ${summary.currentStreak}-day streak shows momentum` : null,
                totalRepetitions > completedDays ? `Strong performance: ${avgRepetitions} avg per completion` : null
            ].filter(Boolean);

            workingWell.forEach(item => {
                addNewPageIfNeeded(7);
                pdf.text(`• ${item}`, 30, yPosition);
                yPosition += 7;
            });

            yPosition += 5;
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('Areas for Improvement:', 25, yPosition);
            yPosition += 7;

            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            const improvements = [
                totalDays - completedDays > 0 ? `Consistency gap: ${totalDays - completedDays} missed days` : null,
                completionRate < 70 ? `Target achievement: Currently at ${completionRate}%` : null,
                summary.currentStreak === 0 ? 'Streak building: Focus on consecutive days' : null
            ].filter(Boolean);

            improvements.forEach(item => {
                addNewPageIfNeeded(7);
                pdf.text(`• ${item}`, 30, yPosition);
                yPosition += 7;
            });

            yPosition += 15;

            // Insights & Recommendations
            addNewPageIfNeeded(60);
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('INSIGHTS & RECOMMENDATIONS', 20, yPosition);
            yPosition += 15;

            pdf.setFontSize(14);
            pdf.text('Key Findings', 20, yPosition);
            yPosition += 10;

            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            const findings = [
                `Weekly Pattern: ${completionRate >= 70 ? `Strong ${completionRate}% completion rate` : `${completionRate}% completion - room for improvement`}`,
                `Streak Status: ${summary.currentStreak > 0 ? `Active ${summary.currentStreak}-day streak` : 'No active streak - focus needed'}`,
                `Performance: ${totalRepetitions > 0 ? `Averaging ${avgRepetitions} ${habit.goalUnit?.toLowerCase() || 'reps'}` : 'No completions this week'}`
            ];

            findings.forEach((finding, i) => {
                addNewPageIfNeeded(7);
                pdf.text(`${i + 1}. ${finding}`, 25, yPosition);
                yPosition += 7;
            });

            yPosition += 10;

            // Action Items
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text('Action Items to Improve', 20, yPosition);
            yPosition += 10;

            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            const actions = [
                `High Priority: ${totalDays - completedDays > 3 ? 'Establish daily routine' : 'Maintain current routine'}`,
                'Medium Priority: Set daily reminders',
                'Low Priority: Track completion time for insights'
            ];

            actions.forEach(action => {
                addNewPageIfNeeded(7);
                pdf.text(`• ${action}`, 25, yPosition);
                yPosition += 7;
            });

            yPosition += 10;

            // Motivational Notes
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text('Motivational Notes', 20, yPosition);
            yPosition += 10;

            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            const motivation = completedDays > 0
                ? `Great progress! You completed ${completedDays} days this week. ${summary.currentStreak > 0 ? `Your ${summary.currentStreak}-day streak shows commitment!` : 'Focus on building a streak next week.'}`
                : 'Every journey starts with a single step! This week is your baseline.';

            const motivationLines = pdf.splitTextToSize(motivation, pageWidth - 50);
            motivationLines.forEach(line => {
                addNewPageIfNeeded(7);
                pdf.text(line, 25, yPosition);
                yPosition += 7;
            });

            yPosition += 5;
            const nextGoal = completedDays < totalDays
                ? `Next Goal: Achieve ${Math.min(completedDays + 2, totalDays)}/7 completions next week`
                : 'Next Goal: Maintain your perfect performance!';
            pdf.text(nextGoal, 25, yPosition);

            yPosition += 15;

            // Next Steps
            addNewPageIfNeeded(40);
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('NEXT STEPS', 20, yPosition);
            yPosition += 15;

            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            const nextSteps = [
                `This Week: ${summary.currentStreak > 0 ? `Extend your ${summary.currentStreak}-day streak` : 'Start building a streak'}`,
                `Focus Area: ${totalDays - completedDays > 2 ? 'Improve consistency by planning ahead' : 'Maintain current performance'}`,
                `Next Report: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
            ];

            nextSteps.forEach((step, i) => {
                pdf.text(`${i + 1}. ${step}`, 25, yPosition);
                yPosition += 7;
            });

            yPosition += 15;

            // Footer
            addNewPageIfNeeded(30);
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            const footerMessage = completedDays > 0
                ? 'Keep up the momentum! You\'re building a strong foundation for this habit.'
                : 'Every expert was once a beginner. Start your journey today!';
            pdf.text(footerMessage, pageWidth / 2, yPosition, { align: 'center' });

            yPosition += 10;
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'italic');
            pdf.text('For questions or feedback about this report, contact support or review app settings.', pageWidth / 2, yPosition, { align: 'center' });

            pdf.save(`${habit.habitName}_Report_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
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
    const start = new Date(weekRange.startDate);
    const end = new Date(weekRange.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        weekDates.push(new Date(d).toISOString().split('T')[0]);
    }

    const completionDates = summary.habitCompletionsData?.completaionDate || [];
    const completionValues = summary.habitCompletionsData?.completionValue || [];
    const maxValue = 100;

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
                        {!isGeneratingPDF && (
                            <button onClick={() => navigate('/habits')} className="back-btn">
                                <ArrowLeft size={24} />
                            </button>
                        )}
                        <div>
                            <h1 className="title">{habit.habitName}</h1>
                            <h1 className="tagline">{taglineText}</h1>
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
                                    return (
                                        <div
                                            key={i}
                                            className="bar-wrapper"
                                            onMouseEnter={() => setHoveredBar(i)}
                                            onMouseLeave={() => setHoveredBar(null)}>
                                            <div className="bar-bg">
                                                <div className={`bar-fill ${value > 0 ? 'completed' : 'missed'}`} style={{ height: `${Math.max(height, 5)}%` }}></div>
                                            </div>
                                            {hoveredBar === i && (
                                                <div className="bar-tooltip">
                                                    {value} {habit.goalUnit}
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
                                <p className="snapshot-change">{getSnapshotDifferent(habit.weekOverWeekChange)} </p>
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
