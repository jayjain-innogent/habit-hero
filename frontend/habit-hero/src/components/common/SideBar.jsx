import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Trophy } from "lucide-react";
import "./SideBar.css";

const SideBar = ({ items = [], onItemClick = () => {} }) => {
  const location = useLocation();
  const [active, setActive] = useState(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = items.find(item => 
      currentPath === item.id || 
      (item.id === "/profile" && currentPath === "/profile") ||
      (item.id === "/habits" && (currentPath === "/" || currentPath.startsWith("/habits")))
    );
    if (activeItem) {
      setActive(activeItem.id);
    }
  }, [location.pathname, items]);

  const handleClick = (id) => {
    setActive(id);
    onItemClick(id);
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Trophy size={24} />
          </div>
          <div className="logo-text">
            <h1 className="sidebar-title">HabitHero</h1>
            <p className="sidebar-subtitle">Track & grow together</p>
          </div>
        </div>
      </div>
      <ul className="sidebar-list">
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`sidebar-item ${active === item.id ? "active" : ""}`}
          >
            {item.icon && <span className="sidebar-icon">{item.icon}</span>}
            <span className="sidebar-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBar;
