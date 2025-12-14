import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateHabitStatsPDF = async (reportData) => {
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

  const completionDates = summary.habitCompletionsData?.completionDate || 
                          summary.habitCompletionsData?.completaionDate || [];
  const completionValues = summary.habitCompletionsData?.completionValue || [];
  const totalDays = weekDates.length;
  const completedDays = completionDates.length;
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const totalRepetitions = completionValues.reduce((sum, val) => sum + (val || 0), 0);
  const avgRepetitions = completedDays > 0 ? (totalRepetitions / completedDays).toFixed(1) : 0;
  const missedDays = totalDays - completedDays;

  console.log('PDF Service - Calculated Data:', {
    completionDates: completionDates.slice(0, 5),
    completionValues,
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

  // Header with Background Color
  pdf.setFillColor(41, 128, 185);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text(`${habit.habitName.toUpperCase()}`, pageWidth/2, 20, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text('Weekly Habit Tracking Report', pageWidth/2, 32, { align: 'center' });

  yPosition = 60;
  pdf.setTextColor(0, 0, 0);
  
  // Report Details
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  const reportPeriodStart = new Date(weekRange.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const reportPeriodEnd = new Date(weekRange.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  
  pdf.text(`📅 Report Period: ${reportPeriodStart} - ${reportPeriodEnd}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`📆 Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`📊 Tracking Duration: ${totalDays} days`, 20, yPosition);
  yPosition += 6;
  pdf.text(`📋 Habit Type: ${habit.category || 'General'} | Frequency: ${habit.cadence || 'Daily'}`, 20, yPosition);

  yPosition += 25;

  // Key Metrics Section with Cards
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('📊 KEY METRICS AT A GLANCE', 20, yPosition);
  yPosition += 12;

  // Metrics Grid (2x2)
  const metrics = [
    { label: 'Completion Rate', value: `${completionRate}%`, color: [52, 211, 153] },
    { label: 'Days Completed', value: `${completedDays}/${totalDays}`, color: [59, 130, 246] },
    { label: 'Current Streak', value: `${summary.currentStreak || 0} days`, color: [251, 146, 60] },
    { label: 'Longest Streak', value: `${summary.longestStreak || 0} days`, color: [168, 85, 247] }
  ];

  const cardWidth = 40;
  const cardHeight = 25;
  const startX = 20;
  const spacing = 10;
  
  metrics.forEach((metric, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const x = startX + col * (cardWidth + spacing);
    const y = yPosition + row * (cardHeight + spacing);

    // Card background
    pdf.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    pdf.setOpacity(0.1);
    pdf.rect(x, y, cardWidth, cardHeight, 'F');
    pdf.setOpacity(1);
    
    // Card border
    pdf.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
    pdf.setLineWidth(1);
    pdf.rect(x, y, cardWidth, cardHeight);

    // Text
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
    pdf.text(metric.value, x + cardWidth/2, y + 8, { align: 'center' });
    
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(metric.label, x + cardWidth/2, y + 18, { align: 'center' });
  });

  yPosition += 65;

  // Performance Summary
  addNewPageIfNeeded(80);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('📈 DETAILED PERFORMANCE ANALYSIS', 20, yPosition);
  yPosition += 15;

  // Completion Progress Bar
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Overall Completion: ${completionRate}%`, 25, yPosition);
  yPosition += 8;

  const barWidth = 150;
  const barHeight = 6;
  const barX = 25;
  const barY = yPosition;

  pdf.setFillColor(240, 240, 240);
  pdf.rect(barX, barY, barWidth, barHeight, 'F');

  const fillWidth = (completionRate / 100) * barWidth;
  let fillColor = [239, 68, 68]; // Red
  if (completionRate >= 90) fillColor = [34, 197, 94]; // Green
  else if (completionRate >= 70) fillColor = [251, 146, 60]; // Orange
  else if (completionRate >= 50) fillColor = [251, 191, 36]; // Yellow

  pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
  pdf.rect(barX, barY, fillWidth, barHeight, 'F');

  // Status indicator
  const status = completionRate >= 90 ? '✓ Excellent' : completionRate >= 70 ? '⚠ Good' : '✗ Needs Focus';
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  pdf.text(status, barX + barWidth + 10, yPosition + 4);

  yPosition += 20;

  // Detailed Metrics Table
  const detailedMetrics = [
    ['📅 Days Completed', `${completedDays}/${totalDays}`, 'Days', completedDays >= totalDays * 0.7 ? 'Good' : 'Fair'],
    ['❌ Days Missed', `${missedDays}`, 'Days', missedDays <= 2 ? 'Excellent' : 'Needs Work'],
    ['🔥 Current Streak', `${summary.currentStreak || 0}`, 'Days', summary.currentStreak > 0 ? 'Active' : 'Inactive'],
    ['🏆 Best Streak', `${summary.longestStreak || 0}`, 'Days', 'Personal Record'],
    ['📊 Total Repetitions', `${totalRepetitions}`, habit.goalUnit || 'Units', 'Accumulated'],
    ['📈 Average per Session', `${avgRepetitions}`, habit.goalUnit || 'Units', 'Per Completion']
  ];

  pdf.setFontSize(10);
  yPosition += 2;
  
  detailedMetrics.forEach((row, idx) => {
    pdf.setFont(undefined, idx === 0 ? 'bold' : 'normal');
    pdf.text(row[0], 25, yPosition);
    pdf.text(row[1], 95, yPosition);
    pdf.text(row[2], 130, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(row[3], 160, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 7;
  });

  yPosition += 10;

  // Day-by-Day Breakdown
  addNewPageIfNeeded(80);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('📅 WEEKLY BREAKDOWN', 20, yPosition);
  yPosition += 12;

  pdf.setFontSize(9);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let currentDay = new Date(weekRange.startDate);
  
  for (let i = 0; i < totalDays; i++) {
    const dateStr = currentDay.toISOString().split('T')[0];
    const dayName = dayNames[currentDay.getDay()];
    const dateNum = currentDay.getDate();
    const isCompleted = completionDates.includes(dateStr);
    const completionValue = completionValues[completionDates.indexOf(dateStr)] || 0;

    // Box for each day
    const boxX = 20 + (i % 4) * 45;
    const boxY = yPosition + Math.floor(i / 4) * 35;

    if (isCompleted) {
      pdf.setFillColor(52, 211, 153);
      pdf.setTextColor(255, 255, 255);
    } else {
      pdf.setFillColor(240, 240, 240);
      pdf.setTextColor(100, 100, 100);
    }
    
    pdf.rect(boxX, boxY, 40, 30, 'F');
    
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(10);
    pdf.text(dayName, boxX + 20, boxY + 6, { align: 'center' });
    
    pdf.setFontSize(11);
    pdf.text(dateNum.toString(), boxX + 20, boxY + 13, { align: 'center' });
    
    pdf.setFontSize(8);
    pdf.text(isCompleted ? `✓ ${completionValue}` : '✗', boxX + 20, boxY + 22, { align: 'center' });
    
    currentDay.setDate(currentDay.getDate() + 1);
  }

  pdf.setTextColor(0, 0, 0);
  yPosition += Math.ceil(totalDays / 4) * 35 + 10;

  // Insights & Recommendations
  addNewPageIfNeeded(70);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('💡 PERFORMANCE INSIGHTS & ANALYSIS', 20, yPosition);
  yPosition += 15;

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');

  const insights = [];
  
  // Completion insights
  if (completionRate >= 90) {
    insights.push('✓ OUTSTANDING PERFORMANCE\nYou\'re consistently exceeding expectations with excellent dedication.');
  } else if (completionRate >= 70) {
    insights.push('⚠ GOOD PROGRESS\nYou\'re on track! Focus on small improvements to reach 90%+ completion.');
  } else if (completionRate >= 50) {
    insights.push('⚡ BUILDING MOMENTUM\nYou\'re halfway there! Identify your barriers and create solutions.');
  } else {
    insights.push('🎯 NEEDS ATTENTION\nLow completion rate detected. Consider breaking down into smaller steps.');
  }

  // Streak insights
  if (summary.currentStreak > 0) {
    insights.push(`🔥 ACTIVE STREAK: ${summary.currentStreak} DAYS\nYou\'re on fire! Maintain this momentum to build lasting habits.`);
  } else {
    insights.push('⏰ NO ACTIVE STREAK\nFocus on completing today to start building your next streak!');
  }

  // Consistency insights
  const consistencyScore = ((completedDays / totalDays) * 100).toFixed(0);
  if (missedDays === 0) {
    insights.push('✓ PERFECT CONSISTENCY\nYou didn\'t miss a single day - this is exceptional dedication!');
  } else if (missedDays <= 1) {
    insights.push(`💪 EXCELLENT WEEK\nOnly ${missedDays} missed day${missedDays > 1 ? 's' : ''} out of ${totalDays} - fantastic consistency!`);
  } else if (missedDays <= 3) {
    insights.push(`📊 ROOM FOR IMPROVEMENT\n${missedDays} missed days detected. Schedule dedicated time daily.`);
  } else {
    insights.push(`⚠ CONSISTENCY CHALLENGE\nToo many missed days (${missedDays}). Create a commitment strategy.`);
  }

  // Best streak comparison
  if (summary.longestStreak > summary.currentStreak) {
    insights.push(`🏆 PERSONAL RECORD: ${summary.longestStreak} DAYS\nYou've achieved longer streaks before - you have the capability!`);
  } else if (summary.longestStreak > 0) {
    insights.push(`🏆 MATCHING YOUR BEST\nYour current streak equals your personal best!`);
  }

  insights.forEach((insight, idx) => {
    addNewPageIfNeeded(12);
    const lines = pdf.splitTextToSize(`${idx + 1}. ${insight}`, 160);
    lines.forEach((line) => {
      pdf.text(line, 25, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  });

  yPosition += 5;

  // Action Items & Tips
  addNewPageIfNeeded(60);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('🎯 ACTION ITEMS FOR NEXT WEEK', 20, yPosition);
  yPosition += 12;

  const actionItems = [];
  if (missedDays > 0) {
    actionItems.push('• Schedule specific times for this habit each day');
  }
  if (completionRate < 70) {
    actionItems.push('• Break the habit into smaller, manageable steps');
  }
  if (completionRate < 50) {
    actionItems.push('• Remove obstacles that prevent habit completion');
  }
  actionItems.push('• Track your progress daily to build awareness');
  actionItems.push('• Celebrate small wins to maintain motivation');
  if (summary.currentStreak > 0) {
    actionItems.push(`• Protect your ${summary.currentStreak}-day streak - it's your momentum!`);
  }

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  actionItems.forEach((item) => {
    addNewPageIfNeeded(7);
    pdf.text(item, 25, yPosition);
    yPosition += 7;
  });

  // Footer Section
  yPosition += 15;
  addNewPageIfNeeded(40);
  
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  
  yPosition += 10;
  
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  const motivationalMessage = 
    completionRate >= 90 ? '🌟 You\'re a habit champion! Keep crushing your goals!' :
    completionRate >= 70 ? '💪 Great work! You\'re building strong habits!' :
    completionRate >= 50 ? '📈 Keep pushing! Every day counts toward your goal.' :
    '🚀 Start today! Every expert was once a beginner.';
  
  const footerLines = pdf.splitTextToSize(motivationalMessage, 160);
  footerLines.forEach((line) => {
    pdf.text(line, pageWidth/2, yPosition, { align: 'center' });
    yPosition += 6;
  });

  yPosition += 8;
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'italic');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Habit Hero - Building Better Habits, One Day at a Time', pageWidth/2, yPosition, { align: 'center' });
  yPosition += 5;
  pdf.text(`Report Generated: ${new Date().toLocaleString('en-US')}`, pageWidth/2, yPosition, { align: 'center' });

  pdf.save(`${habit.habitName}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};