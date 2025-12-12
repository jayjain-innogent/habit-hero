import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
import Navbar from '../Navbar';

const DashboardLayout = ({ menuItems, onItemClick }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="app d-flex h-100">
            <SideBar items={menuItems} onItemClick={onItemClick} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0, marginLeft: sidebarOpen ? '280px' : '0', transition: 'margin-left 0.3s ease' }}>
                <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
                <main className="main-content flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
