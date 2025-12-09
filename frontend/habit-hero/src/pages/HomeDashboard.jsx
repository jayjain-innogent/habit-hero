import React, { useEffect, useState } from "react";
import { getAllHabits } from "../api/habits";
import { createLog, deleteLog, getTodayStatus } from "../api/habitLogs";
import HabitRow from "../components/habits/HabitRow";
import QuoteWidget from "../components/common/QuoteWidget";
import { getCacheKey, updateTodayStatusCache } from "../utils/cache";
import { useNavigate } from "react-router-dom";

export default function HomeDashboard() {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = 1;
    const navigate = useNavigate();

    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split("T")[0];
            const habitsCacheKey = `habits_list_${userId}`;

            let habitList = null;
            try {
                const cached = localStorage.getItem(habitsCacheKey);
                if (cached) habitList = JSON.parse(cached);
            } catch (e) { console.error("Cache error", e); }

            if (!habitList) {
                habitList = await getAllHabits(userId);
                localStorage.setItem(habitsCacheKey, JSON.stringify(habitList));
            }

            const todayStatus = await getTodayStatus(userId);

            let list = Array.isArray(habitList) ? habitList : [];
            list = list.map(h => ({
                ...h,
                completedToday: todayStatus?.status?.[h.id]?.completedToday || false,
                actualValue: todayStatus?.status?.[h.id]?.actualValue ?? 0,
                logId: todayStatus?.status?.[h.id]?.logId ?? null
            }));

            setHabits(list);
        } catch (err) {
            console.error("Failed to load dashboard", err);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (habitId, actualValue) => {
        try {
            // Optimistic Update
            setHabits(prev => prev.map(h =>
                h.id === habitId ? { ...h, completedToday: true, actualValue } : h
            ));

            const resp = await createLog(userId, habitId, { actualValue });

            // Update with real logId
            setHabits(prev => prev.map(h =>
                h.id === habitId ? { ...h, logId: resp.logId } : h
            ));

            updateTodayStatusCache(userId, habitId, actualValue);

        } catch (error) {
            console.error("Completion failed", error);
            // Revert
            setHabits(prev => prev.map(h =>
                h.id === habitId ? { ...h, completedToday: false, actualValue: 0 } : h
            ));
        }
    };

    const handleUncomplete = async (habitId) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit || !habit.logId) return;

        try {
            // Optimistic
            setHabits(prev => prev.map(h =>
                h.id === habitId ? { ...h, completedToday: false, actualValue: 0 } : h
            ));

            await deleteLog(userId, habit.logId);

            // Note: cache update for uncomplete is tricky if we don't have a helper, 
            // but for now relying on state is fine.

        } catch (error) {
            console.error("Uncompletion failed", error);
            // Revert
            setHabits(prev => prev.map(h =>
                h.id === habitId ? { ...h, completedToday: true, logId: habit.logId } : h
            ));
        }
    };

    // --- Derived State ---
    const formattedDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const activeHabits = habits.filter(h => h.status === "ACTIVE" && !h.completedToday);
    const completedHabits = habits.filter(h => h.status === "ACTIVE" && h.completedToday);

    const sortHabits = (list) => {
        return [...list].sort((a, b) => {
            if (a.category < b.category) return -1;
            if (a.category > b.category) return 1;
            return a.title.localeCompare(b.title);
        });
    };

    const sortedActive = sortHabits(activeHabits);
    const sortedCompleted = sortHabits(completedHabits);

    const totalActiveCount = habits.filter(h => h.status === "ACTIVE").length;
    const totalCompletedCount = habits.filter(h => h.status === "ACTIVE" && h.completedToday).length;
    const progress = totalActiveCount === 0 ? 0 : Math.round((totalCompletedCount / totalActiveCount) * 100);

    const renderGroupedHabits = (list) => {
        let lastCategory = null;
        return list.map(habit => {
            const showHeader = habit.category !== lastCategory;
            lastCategory = habit.category;
            return (
                <div key={habit.id}>
                    {showHeader && (
                        <h6 className="text-secondary fw-bold mt-4 mb-2 small text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>
                            {habit.category}
                        </h6>
                    )}
                    <HabitRow
                        habit={habit}
                        onComplete={handleComplete}
                        onUncomplete={handleUncomplete}
                    />
                </div>
            );
        });
    };

    return (
        <div className="" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '40px' }}>
            <div className="container" style={{ maxWidth: '600px' }}> {/* Limit width for "Vertical Stack" app feel */}

                {/* 1. Top Header */}
                <div className="d-flex justify-content-between align-items-end pt-4 pb-2">
                    <div>
                        <h2 className="fw-bolder text-dark mb-0">Welcome back, Baby!</h2>
                    </div>
                    <div>
                        <span className="text-secondary small fw-bold">
                            {formattedDate}
                        </span>
                    </div>
                </div>

                {/* 2. Quote Section */}
                <div className="mb-4">
                    <QuoteWidget />
                </div>

                {/* 3. Progress Section */}
                <div className="card border-0 shadow-sm mb-4 bg-white rounded-4">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-end mb-2">
                            <h5 className="fw-bold mb-0">Your Daily Goal</h5>
                            <span className="h4 fw-bold text-primary mb-0">{progress}%</span>
                        </div>
                        <div className="progress" style={{ height: '12px', borderRadius: '10px', backgroundColor: '#e9ecef' }}>
                            <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{ width: `${progress}%`, borderRadius: '10px', transition: 'width 0.5s ease' }}
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                        <div className="text-muted small mt-2">
                            {totalCompletedCount} of {totalActiveCount} habits completed
                        </div>
                    </div>
                </div>

                {/* 4. Habits List (Main Content) */}
                <div className="mb-3">
                    <h6 className="fw-bold text-secondary mb-3">⬇️ TODAY'S TASKS</h6>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : (
                        renderGroupedHabits(sortedActive)
                    )}

                    {!loading && sortedActive.length === 0 && totalActiveCount > 0 && (
                        <div className="text-center py-5 text-muted bg-white rounded-4 shadow-sm mb-3">
                            <span className="display-4">🎉</span>
                            <p className="mb-0 mt-2">All tasks completed!</p>
                        </div>
                    )}
                </div>

                {/* Completed Section (if any) */}
                {sortedCompleted.length > 0 && (
                    <div className="mt-5">
                        <h6 className="fw-bold text-secondary mb-3">✅ COMPLETED</h6>
                        {renderGroupedHabits(sortedCompleted)}
                    </div>
                )}
            </div>
        </div>
    );
}
