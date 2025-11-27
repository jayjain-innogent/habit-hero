import { useState, useEffect } from 'react'
import './App.css'
import Header from "./components/Header/Header.jsx";
import SingleReportPage from "./pages/SingleReportPage.jsx";
import { fetchWeeklyReport, fetchHabitData } from './services/api.js';


function App() {
    const [loading, setLoading] = useState(false);



    // Removed useEffect since SingleReportPage handles its own data loading
    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="app-container">
            <SingleReportPage />
        </div>
    );
}

export default App;
