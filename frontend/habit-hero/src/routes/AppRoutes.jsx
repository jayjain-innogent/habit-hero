import React, { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HabitCreate from "../pages/Habits/HabitCreate";
import HabitEdit from "../pages/Habits/HabitEdit";
import HabitsList from "../pages/Habits/HabitsList";
import HabitStats from "../pages/HabitStats";
import ActivityFeed from "../pages/Activity/ActivityFeed";
import FriendsPage from "../pages/Friends/FriendsPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import FriendListPage from "../pages/Profile/FriendListPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import OtpVerificationPage from "../pages/OtpVerificationPage";
import DashboardLayout from "../components/common/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

import { useAuth } from "../context/AuthContext";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export default function AppRoutes() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get authenticated user

  // Derive currentUserId from auth context, fallback to safe default or null
  // Note: API calls should fail gracefully or check if user is loaded
  const currentUserId = user?.userId || null;

  const contextValue = {
    currentUserId,
  };

  // Defined menu items for the dashboard
  const menuItems = [
    { id: "/habits", label: "Home" },
    { id: "/dashboard", label: "Dashboard" },
    { id: "/friends", label: "Friends" },
    { id: "/activity", label: "Activity" },
    { id: "/profile", label: "Profile" },
    { id: "/settings", label: "Settings" },
  ];

  const handleClick = (path) => {
    navigate(path);
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout menuItems={menuItems} onItemClick={handleClick} />}>
            <Route path="/habits" element={<HabitsList />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/habits/create" element={<HabitCreate />} />
            <Route path="/habits/:habitId/edit" element={<HabitEdit />} />
            <Route path="/habits/:habitId/report" element={<HabitStats />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/activity" element={<ActivityFeed />} />
            <Route path="/settings" element={<div style={{ padding: '20px' }}><h2>Settings</h2><p>Coming soon...</p></div>} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/profile/:userId/friends" element={<FriendListPage />} />
          </Route>
        </Route>
      </Routes>
    </AppContext.Provider>
  );
}