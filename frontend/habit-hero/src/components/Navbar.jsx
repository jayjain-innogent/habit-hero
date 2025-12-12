import React from 'react';
import { FaLeaf, FaBars } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

import NotificationDropdown from './Notification/NotificationDropdown';

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
    return (
        <nav className="navbar navbar-expand-lg px-4" style={{ background: 'rgba(255, 248, 222, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '2px solid #8CA9FF', boxShadow: '0 2px 10px rgba(140,169,255,0.3)', position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                    {!sidebarOpen && (
                        <button onClick={onToggleSidebar} className="btn btn-link p-0 border-0" style={{ color: '#8CA9FF' }}>
                            <FaBars size={24} />
                        </button>
                    )}
                    <div className="d-flex align-items-center gap-2">
                        <FaLeaf size={28} style={{ color: '#8CA9FF' }} />
                        <span className="fw-bold fs-4" style={{ color: '#2C3E50' }}>Habit<span style={{ color: '#8CA9FF' }}>Hero</span></span>
                    </div>
                </div>
                <NotificationDropdown />
            </div>
        </nav>
    );
};

export default Navbar;
