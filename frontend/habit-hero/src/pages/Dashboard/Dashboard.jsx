import React, { useState, useEffect } from 'react';
import { fetchDashboardData } from '../../services/api';
import { generateDashboardPDF } from '../../services/pdfService';
import { formatDateRange } from '../../utils/dateUtils';
import DashboardCards from '../../components/Dashboard/DashboardCards';
import HabitsTable from '../../components/Dashboard/HabitsTable';
import StatsOverview from '../../components/Dashboard/StatsOverview';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleGenerateReport = () => {
    if (dashboardData) {
      console.log('=== DASHBOARD DATA STRUCTURE ===');
      console.log('Full data:', JSON.stringify(dashboardData, null, 2));
      console.log('Keys:', Object.keys(dashboardData));
      console.log('cardData:', dashboardData.cardData);
      console.log('tableData:', dashboardData.tableData);
      generateDashboardPDF(dashboardData);
    } else {
      alert('No data available to generate report');
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;
  if (error) return (
    <div className="dashboard-error">
      <h2>⚠️ Something went wrong</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Try Again
      </button>
    </div>
  );
  if (!dashboardData) return (
    <div className="dashboard-error">
      <h2>📊 No Data Available</h2>
      <p>Start tracking your habits to see your dashboard</p>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1><i className="bi bi-speedometer2"></i> Analytics Dashboard</h1>
          <p className="date-range">
            {formatDateRange(dashboardData.startDate, dashboardData.endDate)}
          </p>
        </div>
        <button onClick={handleGenerateReport} className="generate-report-btn">
          <i className="bi bi-file-earmark-pdf"></i> Generate PDF Report
        </button>
      </div>

      <DashboardCards cardData={dashboardData.cardData} />
      
      <StatsOverview 
        cardData={dashboardData.cardData} 
        tableData={dashboardData.tableData} 
      />
      
      <div className="habits-section">
        <h2><i className="bi bi-list-check"></i> Habit Performance</h2>
        <HabitsTable tableData={dashboardData.tableData} />
      </div>

      <div className="motivation-section">
        <p className="motivation-message">{dashboardData.motivationMessage}</p>
      </div>
    </div>
  );
};

export default Dashboard;