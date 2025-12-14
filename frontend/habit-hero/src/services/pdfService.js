import html2pdf from 'html2pdf.js';

const generateHTMLReport = (dashboardData) => {
  console.log('Processing dashboard data for PDF:', dashboardData);
  
  const currentDate = new Date().toLocaleDateString();
  

  const reportTitle = dashboardData.reportTitle ||  'Habit Tracking Report';
  const startDate = dashboardData.startDate  || new Date().toISOString().split('T')[0];
  const endDate = dashboardData.endDate  || new Date().toISOString().split('T')[0];
  const motivationMessage = dashboardData.motivationMessage || 'Keep building great habits!';
  
  // Extract actual data from API response and map to expected format
  let cardData = [];
  if (Array.isArray(dashboardData.cardData)) {
    cardData = dashboardData.cardData.map(card => ({
      title: card.title || 'Unknown',
      value: card.value !== undefined ? card.value : 'N/A'
    }));
  } else if (dashboardData.cardData && typeof dashboardData.cardData === 'object') {
    // Handle object structure from DashboardCards component
    const data = dashboardData.cardData;
    cardData = [
      { title: 'Overall Score', value: `${data.scorePercentage || 0}%` },
      { title: 'Current Streak', value: data.currentStreak || 0 },
      { title: 'Perfect Days', value: data.perfectDays || 0 },
      { title: 'Longest Streak', value: data.longestStreak || 0 },
      { title: 'Active Days', value: data.activeDaysCount || 0 }
    ];
  } else {
    // Create default cards from available data
    cardData = [
      { title: 'Overall Score', value: `${dashboardData.scorePercentage || 0}%` },
      { title: 'Current Streak', value: dashboardData.currentStreak || 0 },
      { title: 'Perfect Days', value: dashboardData.perfectDays || 0 },
      { title: 'Active Days', value: dashboardData.activeDaysCount || 0 }
    ];
  }
  
  // Handle tableData - could be different field names
  let tableData = [];
  if (Array.isArray(dashboardData.tableData)) {
    tableData = dashboardData.tableData;
  }
  
  // Normalize table data fields
  tableData = tableData.map(habit => ({
    habitName: habit.habitName || 'Unknown Habit',
    completionRate: habit.efficiency || 0,
    streak: cardData.currentStreak || 0,
    category: habit.category || 'OTHER'
  }));
  
  const totalHabits = tableData.length || 0;
  const completedHabits = tableData.filter(h => h.taskCompletedCount > 0).length || 0;
  const overallScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  
  // Calculate category performance
  const categories = {};
  tableData.forEach(habit => {
    const category = habit.category || 'OTHER';
    if (!categories[category]) {
      categories[category] = { completed: 0, total: 0, efficiency: 0 };
    }
    categories[category].total++;
    if (habit.completionRate > 0) categories[category].completed++;
    categories[category].efficiency = Math.round((categories[category].completed / categories[category].total) * 100);
    
  });
  
  const topPerformers = tableData.filter(h => h.completionRate >= 80).slice(0, 3) || [];
  const needsImprovement = tableData.filter(h => h.completionRate < 40).slice(0, 3) || [];
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; color: #333; line-height: 1.6; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; }
        .header { text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 32px; color: #2c3e50; margin-bottom: 10px; }
        .header-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 15px; padding-top: 15px; font-size: 14px; color: #666; }
        .meta-item { text-align: center; }
        .meta-label { font-weight: bold; color: #2c3e50; }
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
        .section-title { font-size: 20px; font-weight: bold; color: #2c3e50; border-left: 4px solid #667eea; padding-left: 15px; margin-bottom: 20px; }
        .progress-item { margin-bottom: 20px; }
        .progress-label { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; font-weight: 500; }
        .progress-bar { height: 25px; background-color: #e0e0e0; border-radius: 12px; overflow: hidden; position: relative; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: white; font-size: 12px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
        th { background-color: #2c3e50; color: white; padding: 12px; text-align: left; font-weight: 600; }
        td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status-excellent { color: #27ae60; font-weight: bold; }
        .status-good { color: #3498db; font-weight: bold; }
        .status-warning { color: #e67e22; font-weight: bold; }
        .status-critical { color: #e74c3c; font-weight: bold; }
        .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 HABIT TRACKING DASHBOARD</h1>
            <h3 style="color: #666; margin-top: 10px;">Monthly Performance Report</h3>
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
                    <div class="meta-label">Total Habits</div>
                    <div>${totalHabits} Active</div>
                </div>
            </div>
        </div>

        <div class="kpi-grid">
            ${cardData.slice(0, 5).map((card, index) => {
                const cardTypes = ['danger', 'info', 'success', 'primary', 'warning'];
                const cardType = cardTypes[index % cardTypes.length];
                return `
                <div class="kpi-card ${cardType}">
                    <div class="kpi-value">${card.value || 'N/A'}</div>
                    <div class="kpi-label">${card.title || 'N/A'}</div>
                </div>`;
            }).join('')}
            ${cardData.length < 5 ? `
            <div class="kpi-card success">
                <div class="kpi-value">${Math.max(...(tableData.map(h => h.streak) || [0]))} 🔥</div>
                <div class="kpi-label">Best Streak</div>
            </div>` : ''}
        </div>

        <div class="section">
            <h2 class="section-title">🎯 Overall Progress</h2>
            <div class="progress-item">
                <div class="progress-label">
                    <span>Overall Achievement Score</span>
                    <span style="font-weight: bold; color: ${overallScore >= 60 ? '#27ae60' : '#e74c3c'};">${overallScore}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${overallScore}%;">${overallScore}%</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">📈 Performance by Category</h2>
            <table>
                <thead>
                    <tr><th>Category</th><th>Completed</th><th>Total</th><th>Efficiency</th><th>Status</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(categories).map(([cat, data]) => `
                        <tr>
                            <td><strong>${cat}</strong></td>
                            <td>${data.completed}</td>
                            <td>${data.total}</td>
                            <td style="font-weight: bold;">${data.efficiency}%</td>
                            <td><span class="${data.efficiency >= 80 ? 'status-excellent' : data.efficiency >= 60 ? 'status-good' : data.efficiency >= 40 ? 'status-warning' : 'status-critical'}">
                                ${data.efficiency >= 80 ? '✅ Excellent' : data.efficiency >= 60 ? '✅ Good' : data.efficiency >= 40 ? '⚠️ Needs Focus' : '🔴 Critical'}
                            </span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="two-column">
            <div class="section">
                <h2 class="section-title">🏆 Top Performers</h2>
                <table>
                    <thead><tr><th>Habit</th><th>Completion</th><th>Streak</th></tr></thead>
                    <tbody>
                        ${topPerformers.map(habit => `
                            <tr>
                                <td>${habit.habitName}</td>
                                <td style="color: #27ae60; font-weight: bold;">${habit.completionRate}%</td>
                                <td>${habit.streak} days</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="section">
                <h2 class="section-title">⚠️ Needs Improvement</h2>
                <table>
                    <thead><tr><th>Habit</th><th>Completion</th><th>Streak</th></tr></thead>
                    <tbody>
                        ${needsImprovement.map(habit => `
                            <tr>
                                <td>${habit.habitName}</td>
                                <td style="color: #e74c3c; font-weight: bold;">${habit.completionRate}%</td>
                                <td>${habit.streak} days</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">💡 Key Insights & Analysis</h2>
            <div class="insight-box success">
                <div class="insight-title">✅ What's Working Well</div>
                <div class="insight-content">
                    <strong>Top Performance:</strong> ${topPerformers.length} habits showing excellent completion rates (80%+)<br>
                    <strong>Consistency:</strong> Best streak of ${Math.max(...(tableData.map(h => h.streak) || [0]))} days shows good momentum
                </div>
            </div>
            <div class="insight-box critical">
                <div class="insight-title">🔴 Areas Needing Focus</div>
                <div class="insight-content">
                    <strong>Low Performance:</strong> ${needsImprovement.length} habits below 40% completion need immediate attention<br>
                    <strong>Overall Score:</strong> ${overallScore}% - ${overallScore < 60 ? 'Significant improvement needed' : 'Good progress, aim higher'}
                </div>
            </div>
        </div>

        <div class="motivational-section">
            <h2>🌟 Keep Building Your Habits!</h2>
            <p>${motivationMessage}</p>
        </div>

        <div class="footer">
            <p><strong>📋 Report Metadata</strong><br>
            Generated: ${currentDate} | Total Habits: ${totalHabits} | Report Version: Professional PDF Template</p>
        </div>
    </div>
</body>
</html>`;
};

export const generateDashboardPDF = (dashboardData) => {
  try {
    const htmlContent = generateHTMLReport(dashboardData);
    
    const options = {
      margin: 0.5,
      filename: `habit-report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(options).from(htmlContent).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF report. Please try again.');
  }
};