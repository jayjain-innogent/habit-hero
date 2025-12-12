import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { FaArrowLeft, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./SideBar.css";

const SideBar = ({ items = [], onItemClick = () => { }, isOpen = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar-container d-flex flex-column" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}>
      <div className="d-flex justify-content-between align-items-center px-3 py-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
        <h1 className="sidebar-title mb-0 p-0 border-0">Habit Hero</h1>
        <button onClick={onClose} className="btn btn-link p-0 border-0" style={{ color: '#fff' }}>
          <FaArrowLeft size={20} />
        </button>
      </div>
      <ul className="sidebar-list">
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`sidebar-item ${active === item.id ? "active" : ""}`}
            style={{ cursor: 'pointer' }}
          >
            {item.icon && <span className="sidebar-icon">{item.icon}</span>}
            <span className="sidebar-label">{item.label}</span>
          </li>
        ))}
      </ul>

      <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
        <div
          onClick={handleLogout}
          className="sidebar-item"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <span className="sidebar-icon"><FaSignOutAlt /></span>
          <span className="sidebar-label">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
