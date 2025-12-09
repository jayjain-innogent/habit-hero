import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./SideBar.css";

const SideBar = ({ items = [], onItemClick = () => { } }) => {
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
      <h1 className="sidebar-title">Habit Hero</h1>
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
