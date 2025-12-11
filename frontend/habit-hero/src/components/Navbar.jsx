import React from 'react';
import NotificationDropdown from './Notification/NotificationDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom px-4">
            <div className="container-fluid d-flex justify-content-end">
                {/* We can add other navbar items here if needed, but for now just the notification */}
                <div className="d-flex align-items-center">
                    {/* Placeholder for User Profile Dropdown or other items if needed later */}
                    <div className="me-3">
                        <i className="bi bi-person-circle fs-4 text-muted"></i>
                    </div>
                    {/* Notification Dropdown */}
                    <NotificationDropdown />
                </div>
            </div>
        </nav>
    );
};
export default Navbar;