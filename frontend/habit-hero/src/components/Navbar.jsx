import React from 'react';
import { FaLeaf, FaBars } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import NotificationDropdown from './Notification/NotificationDropdown';

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
    return (
        <nav className="navbar navbar-expand-lg px-4" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', backdropFilter: 'blur(10px)', borderBottom: 'none', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)', position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                    {!sidebarOpen && (
                        <button onClick={onToggleSidebar} className="btn btn-link p-0 border-0" style={{ color: 'white' }}>
                            <FaBars size={24} />
                        </button>
                    )}
                    <div className="d-flex align-items-center gap-2">
                        <FaLeaf size={28} style={{ color: 'white' }} />
                        <span className="fw-bold fs-4" style={{ color: 'white' }}>Habit<span style={{ color: 'rgba(255,255,255,0.8)' }}>Hero</span></span>
                    </div>
                </div>
                <NotificationDropdown />
            </div>
        </nav>
    );
};

export default Navbar;
