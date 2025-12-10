import React, { createContext, useContext, useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HabitCreate from "../pages/Habits/HabitCreate";
import HabitEdit from "../pages/Habits/HabitEdit";
import HabitsList from "../pages/Habits/HabitsList";
import Explore from "../pages/Explore";
import FriendsPage from "../pages/Friends/FriendsPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import FriendListPage from "../pages/Profile/FriendListPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import OtpVerificationPage from "../pages/OtpVerificationPage";
import DashboardLayout from "../components/common/DashboardLayout";

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
    { id: "/habits", label: "Home" },
    { id: "/friends", label: "Friends" },
    { id: "/explore", label: "Explore" },
    { id: "/profile", label: "Profile" },
    { id: "/settings", label: "Settings" },
  ];

  const handleClick = (path) => {
    navigate(path);
  };

  const contextValue = {
    currentUserId,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<DashboardLayout menuItems={menuItems} onItemClick={handleClick} />}>
          <Route path="/habits" element={<HabitsList />} />
          <Route path="/habits/create" element={<HabitCreate />} />
          <Route path="/habits/:habitId/edit" element={<HabitEdit />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/settings" element={<div style={{ padding: '20px' }}><h2>Settings</h2><p>Coming soon...</p></div>} />
          <Route path="/profile" element={<ProfilePage currentUserId={currentUserId} />} />
          <Route path="/profile/:userId" element={<ProfilePage currentUserId={currentUserId} />} />
          <Route path="/profile/:userId/friends" element={<FriendListPage currentUserId={currentUserId} />} />
        </Route>
      </Routes>
    </AppContext.Provider>
  );
}
