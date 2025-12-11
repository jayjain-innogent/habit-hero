import React, { createContext, useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Trophy, Users, Activity as ActivityIcon, User, Settings } from "lucide-react";

import HabitCreate from "../pages/Habits/HabitCreate";
import HabitEdit from "../pages/Habits/HabitEdit";
import HabitsList from "../pages/Habits/HabitsList";
import HabitStats from "../pages/HabitStats";
import Dashboard from "../pages/Dashboard/Dashboard";
import SideBar from "../components/common/SideBar";
import Activity from "../pages/Activity";
import FriendsPage from "../pages/Friends/FriendsPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import FriendListPage from "../pages/Profile/FriendListPage";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export default function AppRoutes() {
  const navigate = useNavigate();
  const [currentUserId] = useState(() => {
    return parseInt(localStorage.getItem('currentUserId') || '1');
  });

  useEffect(() => {
    localStorage.setItem('currentUserId', currentUserId.toString());
  }, [currentUserId]);

  const menuItems = [
    { id: "/dashboard", label: "Dashboard", icon: <Trophy size={20} /> },
    { id: "/habits", label: "Habits", icon: <Trophy size={20} /> },
    { id: "/friends", label: "Friends", icon: <Users size={20} /> },
    { id: "/activity", label: "Activity", icon: <ActivityIcon size={20} /> },
    { id: "/profile", label: "Profile", icon: <User size={20} /> },
    { id: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const handleClick = (path) => {
    navigate(path);
  };

  const contextValue = {
    currentUserId,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div style={{ display: "flex", height: "100vh" }}>
        <SideBar items={menuItems} onItemClick={handleClick} />
        <div style={{ 
          flex: 1, 
          marginLeft: "280px", 
          padding: "24px",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          minHeight: "100vh"
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/habits" element={<HabitsList />} />
            <Route path="/habits/create" element={<HabitCreate />} />
            <Route path="/habits/:habitId/edit" element={<HabitEdit />} />
            <Route path="/habits/:habitId/report" element={<HabitStats />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/settings" element={<div style={{padding:'20px'}}><h2>Settings</h2><p>Coming soon...</p></div>} />
            <Route path="/profile" element={<ProfilePage currentUserId={currentUserId} />} />
            <Route path="/profile/:userId" element={<ProfilePage currentUserId={currentUserId} />} />
            <Route path="/profile/:userId/friends" element={<FriendListPage currentUserId={currentUserId} />} />
          </Routes>
        </div>
      </div>
    </AppContext.Provider>
  );
}
