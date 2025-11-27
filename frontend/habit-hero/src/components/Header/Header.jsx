import React from 'react';
import './Header.css';

function Header() {
    return (
        <header className="header">
            <div className="header-left">
                <div className="logo">
                    <span className="logo-icon">📊</span>
                    <span className="logo-text">HabitHero</span>
                </div>
            </div>
            <div className="header-right">
                <button className="notification-btn">🔔</button>
                <div className="profile-avatar"></div>
                <button className="menu-btn">☰</button>
            </div>
        </header>
    );
}

export default Header;
