import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HabitCreate from "../pages/Habits/HabitCreate";
import HabitEdit from "../pages/Habits/HabitEdit";
import HabitsList from "../pages/Habits/HabitsList";
import SingleReportPage from "../pages/SingleReportPage.jsx";


export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/habits" replace />} />
            <Route path="/habits" element={<HabitsList />} />
            <Route path="/habits/create" element={<HabitCreate />} />
            <Route path="/habits/:habitId/report" element={<SingleReportPage />} />
            <Route path="/habits/:habitId/edit" element={<HabitEdit />} />
        </Routes>
    )
}