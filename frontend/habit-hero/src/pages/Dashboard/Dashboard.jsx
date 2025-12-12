import React, { useState, useEffect } from 'react';
import { fetchDashboardData } from '../../services/api';
import { generateDashboardPDF } from '../../services/pdfService';
import { formatDateRange } from '../../utils/dateUtils';
import { isTokenExpired } from '../../utils/jwtUtil';
import DashboardCards from '../../components/Dashboard/DashboardCards';
import HabitsTable from '../../components/Dashboard/HabitsTable';
import StatsOverview from '../../components/Dashboard/StatsOverview';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { ChartColumn, TrendingUp, Gauge, FileText } from 'lucide-react';
import '../../styles/theme.css';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('=== Dashboard Component Mount ===');
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token expired:', isTokenExpired(token));
    }
  }, []);

  const handleGenerateReport = () => {
    if (dashboardData) {
      console.log('=== DASHBOARD DATA FOR PDF ===');
      console.log('Full data:', dashboardData);
      console.log('cardData:', dashboardData.cardData);
      console.log('tableData:', dashboardData.tableData);
      
      // Validate and structure data for PDF generation
      const validatedData = {
        ...dashboardData,
        cardData: dashboardData.cardData || {},
        tableData: dashboardData.tableData || [],
        startDate: dashboardData.startDate || new Date().toISOString().split('T')[0],
        endDate: dashboardData.endDate || new Date().toISOString().split('T')[0],
        motivationMessage: dashboardData.motivationMessage || 'Keep building great habits!'
      };
      
      generateDashboardPDF(validatedData);
    } else {
      alert('No data available to generate report');
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      // Check if user is authenticated (token exists)
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
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
  
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  
  if (!token) return (
    <div className="dashboard-error">
      <h2>⚠️ Authentication Required</h2>
      <p>Please log in to view your dashboard</p>
    </div>
  );
  
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
          <h1><Gauge size={24} style={{ marginRight: '8px', color: 'var(--color-primary)' }} /> Analytics Dashboard</h1>
          <p className="date-range">
            {formatDateRange(dashboardData.startDate, dashboardData.endDate)}
          </p>
        </div>
        <button onClick={handleGenerateReport} className="generate-report-btn">
          <FileText size={20} style={{ marginRight: '8px' }} /> Generate PDF Report
        </button>
      </div>

      <DashboardCards cardData={dashboardData.cardData} />
      
      <StatsOverview 
        cardData={dashboardData.cardData} 
        tableData={dashboardData.tableData} 
      />
      
      <div className="habits-section">
         <h2><TrendingUp size={20} style={{ marginRight: '8px', color: 'var(--color-primary)' }} /> Habit Performance</h2>
        <HabitsTable tableData={dashboardData.tableData} />
      </div>

      <div className="motivation-section">
        <p className="motivation-message">{dashboardData.motivationMessage}</p>
      </div>
    </div>
  );
};

export default Dashboard;