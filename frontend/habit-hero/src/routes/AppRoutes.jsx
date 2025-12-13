import React, { createContext, useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Trophy, Users, Activity as ActivityIcon, User, Settings, ChartColumn } from "lucide-react";


import HabitCreate from "../pages/Habits/HabitCreate";
import HabitEdit from "../pages/Habits/HabitEdit";
import HabitsList from "../pages/Habits/HabitsList";
import HabitStats from "../pages/HabitStats";
import Dashboard from "../pages/Dashboard/Dashboard";
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
    { id: "/habits", label: "Habits", icon: <ChartColumn size={20} /> },
     { id: "/dashboard", label: "Dashboard", icon: <Trophy size={20} /> },
    { id: "/friends", label: "Friends", icon: <Users size={20} /> },
    { id: "/activity", label: "Activity", icon: <ActivityIcon size={20} /> },
    { id: "/profile", label: "Profile", icon: <User size={20} /> }
  ];

  const handleClick = (path) => {
    navigate(path);
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Routes>
        {/* Public routes without sidebar */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
        
        {/* Protected routes with sidebar */}
        <Route element={<DashboardLayout menuItems={menuItems} onItemClick={handleClick} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/habits" element={<HabitsList />} />
          <Route path="/habits/create" element={<HabitCreate />} />
          <Route path="/habits/:habitId/edit" element={<HabitEdit />} />
          <Route path="/habits/:habitId/report" element={<HabitStats />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/activity" element={<ActivityFeed />} />
          <Route path="/profile" element={<ProfilePage currentUserId={currentUserId} />} />
          <Route path="/profile/:userId" element={<ProfilePage currentUserId={currentUserId} />} />
          <Route path="/profile/:userId/friends" element={<FriendListPage currentUserId={currentUserId} />} />
        </Route>
      </Routes>
    </AppContext.Provider>
  );
}
