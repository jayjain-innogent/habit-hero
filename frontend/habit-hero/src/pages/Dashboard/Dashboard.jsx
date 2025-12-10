import React, { useState, useEffect } from 'react';
import { fetchDashboardData } from '../../services/api';
import DashboardCards from '../../components/Dashboard/DashboardCards';
import HabitsTable from '../../components/Dashboard/HabitsTable';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">Error: {error}</div>;
  if (!dashboardData) return <div className="dashboard-error">No data available</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{dashboardData.reportTitle}</h1>
        <p className="date-range">
          {dashboardData.startDate} to {dashboardData.endDate}
        </p>
      </div>

      <DashboardCards cardData={dashboardData.cardData} />
      
      <div className="habits-section">
        <h2>Habit Performance</h2>
        <HabitsTable tableData={dashboardData.tableData} />
      </div>

      <div className="motivation-section">
        <p className="motivation-message">{dashboardData.motivationMessage}</p>
      </div>
    </div>
  );
};

export default Dashboard;