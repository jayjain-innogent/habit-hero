import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import SideBar from './components/common/SideBar';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <SideBar />
          <main className="main-content">
            <AppRoutes />
          </main>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
