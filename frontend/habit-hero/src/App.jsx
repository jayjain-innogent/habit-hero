import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import SideBar from './components/common/SideBar';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const App = () => {
  return (
    <AppProvider>
      <NotificationProvider>
        <Router>
          <div className="app">
            <SideBar />
            <div className="d-flex flex-column flex-grow-1">
              <Navbar />
              <main className="main-content">
                <AppRoutes />
              </main>
            </div>
          </div>
        </Router>
      </NotificationProvider>
    </AppProvider>
  );
};

export default App;
