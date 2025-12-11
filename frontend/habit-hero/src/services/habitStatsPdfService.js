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

  const completionDates = summary.habitCompletionsData?.completaionDate || [];
  const completionValues = summary.habitCompletionsData?.completionValue || [];
  const totalDays = weekDates.length;
  const completedDays = completionDates.length;
  const completionRate = Math.round((completedDays / totalDays) * 100);
  const totalRepetitions = completionValues.reduce((sum, val) => sum + val, 0);
  const avgRepetitions = completedDays > 0 ? (totalRepetitions / completedDays).toFixed(1) : 0;

  const addNewPageIfNeeded = (requiredSpace) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Header
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${habit.habitName.toUpperCase()} HABIT REPORT`, pageWidth/2, yPosition, { align: 'center' });

  yPosition += 15;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Report Period: ${new Date(weekRange.startDate).toLocaleDateString()} - ${new Date(weekRange.endDate).toLocaleDateString()}`, pageWidth/2, yPosition, { align: 'center' });
  yPosition += 7;
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth/2, yPosition, { align: 'center' });
  yPosition += 7;
  pdf.text(`Tracking Duration: ${totalDays} days`, pageWidth/2, yPosition, { align: 'center' });

  yPosition += 25;

  // Key Metrics with Circular Progress
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('KEY METRICS', pageWidth/2, yPosition, { align: 'center' });
  yPosition += 15;

  // Completion Rate Circle
  const centerX1 = 60;
  const centerY1 = yPosition + 20;
  const radius = 15;

  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(3);
  pdf.circle(centerX1, centerY1, radius);

  const progressAngle = (completionRate / 100) * 360;
  pdf.setDrawColor(34, 197, 94);
  pdf.setLineWidth(4);

  for (let angle = 0; angle < progressAngle; angle += 5) {
    const x1 = centerX1 + (radius - 2) * Math.cos((angle - 90) * Math.PI / 180);
    const y1 = centerY1 + (radius - 2) * Math.sin((angle - 90) * Math.PI / 180);
    const x2 = centerX1 + (radius + 2) * Math.cos((angle - 90) * Math.PI / 180);
    const y2 = centerY1 + (radius + 2) * Math.sin((angle - 90) * Math.PI / 180);
    pdf.line(x1, y1, x2, y2);
  }

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${completionRate}%`, centerX1, centerY1 + 2, { align: 'center' });
  pdf.setFontSize(8);
  pdf.setFont(undefined, 'normal');
  pdf.text('Completion', centerX1, centerY1 + 30, { align: 'center' });

  // Streak Circle
  const centerX2 = 130;
  const centerY2 = yPosition + 20;

  pdf.setDrawColor(251, 191, 36);
  pdf.setLineWidth(3);
  pdf.circle(centerX2, centerY2, radius);

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

  // Performance Summary
  addNewPageIfNeeded(80);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('PERFORMANCE SUMMARY', 20, yPosition);
  yPosition += 15;

  // Progress Bar
  pdf.setFontSize(12);
  pdf.text(`Completion Rate: ${completionRate}%`, 25, yPosition);

  const barWidth = 100;
  const barHeight = 8;
  const barX = 25;
  const barY = yPosition + 5;

  pdf.setFillColor(240, 240, 240);
  pdf.rect(barX, barY, barWidth, barHeight, 'F');

  const fillWidth = (completionRate / 100) * barWidth;
  const fillColor = completionRate >= 80 ? [34, 197, 94] : completionRate >= 60 ? [251, 191, 36] : [239, 68, 68];
  pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
  pdf.rect(barX, barY, fillWidth, barHeight, 'F');

  yPosition += 20;

  // Key Metrics
  const metrics = [
    [`Completion Rate: ${completionRate}%`, completionRate >= 90 ? 'Excellent' : completionRate >= 70 ? 'Good' : 'Needs Focus'],
    [`Days Completed: ${completedDays}/${totalDays}`, completedDays >= totalDays * 0.7 ? 'Good' : 'Needs Focus'],
    [`Current Streak: ${summary.currentStreak || 0} days`, summary.currentStreak > 0 ? 'Active' : 'Inactive'],
    [`Longest Streak: ${summary.longestStreak || 0} days`, 'Best'],
    [`Days Missed: ${totalDays - completedDays}`, totalDays - completedDays <= 2 ? 'Good' : 'Needs Focus']
  ];

  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  metrics.forEach(([metric, status]) => {
    pdf.text(metric, 25, yPosition);
    pdf.text(status, 140, yPosition);
    yPosition += 7;
  });

  yPosition += 15;

  // Capture Charts
  try {
    addNewPageIfNeeded(100);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('WEEKLY PERFORMANCE CHART', 20, yPosition);
    yPosition += 15;

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

  // Calendar Heatmap
  try {
    addNewPageIfNeeded(120);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('MONTHLY ACTIVITY HEATMAP', 20, yPosition);
    yPosition += 15;

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

  // Insights & Recommendations
  addNewPageIfNeeded(60);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('INSIGHTS & RECOMMENDATIONS', 20, yPosition);
  yPosition += 15;

  const findings = [
    `Weekly Pattern: ${completionRate >= 70 ? `Strong ${completionRate}% completion rate` : `${completionRate}% completion - room for improvement`}`,
    `Streak Status: ${summary.currentStreak > 0 ? `Active ${summary.currentStreak}-day streak` : 'No active streak - focus needed'}`,
    `Performance: ${totalRepetitions > 0 ? `Averaging ${avgRepetitions} ${habit.goalUnit?.toLowerCase() || 'reps'}` : 'No completions this week'}`
  ];

  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  findings.forEach((finding, i) => {
    addNewPageIfNeeded(7);
    pdf.text(`${i + 1}. ${finding}`, 25, yPosition);
    yPosition += 7;
  });

  // Footer
  yPosition += 15;
  addNewPageIfNeeded(30);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  const footerMessage = completedDays > 0 
    ? 'Keep up the momentum! You\'re building a strong foundation for this habit.'
    : 'Every expert was once a beginner. Start your journey today!';
  pdf.text(footerMessage, pageWidth/2, yPosition, { align: 'center' });

  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'italic');
  pdf.text('For questions or feedback about this report, contact support or review app settings.', pageWidth/2, yPosition, { align: 'center' });

  pdf.save(`${habit.habitName}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};