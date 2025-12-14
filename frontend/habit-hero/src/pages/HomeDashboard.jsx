import React, { useEffect, useState } from "react";
import { getAllHabits } from "../api/habits";
import { createLog, deleteLog, getTodayStatus } from "../api/habitLogs";
import HabitRow from "../components/habits/HabitRow";
import QuoteWidget from "../components/common/QuoteWidget";
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

            const habitList = await getAllHabits(userId);
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
        <div style={{ background: 'linear-gradient(135deg, #FFF8DE 0%, #8CA9FF 100%)', minHeight: '100vh', paddingBottom: '40px' }}>
            <div className="container" style={{ maxWidth: '700px' }}>

                {/* 1. Top Header */}
                <div className="d-flex justify-content-between align-items-center pt-5 pb-3">
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: '#fff', fontSize: '2rem' }}>Welcome back! 👋</h2>
                        <p className="text-muted mb-0 small">Let's make today count</p>
                    </div>
                    <div className="text-end">
                        <span className="badge rounded-pill px-3 py-2" style={{ background: 'linear-gradient(135deg, #8CA9FF, #6B8EFF)', color: '#fff', fontSize: '0.85rem' }}>
                            {formattedDate}
                        </span>
                    </div>
                </div>

                {/* 2. Quote Section */}
                <div className="mb-4">
                    <QuoteWidget />
                </div>

                {/* 3. Progress Section */}
                <div className="card border-0 shadow-lg mb-4 rounded-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #8CA9FF 0%, #6B8EFF 100%)', border: '2px solid rgba(255,255,255,0.3)' }}>
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0" style={{ color: '#fff' }}>Daily Progress</h5>
                            <span className="h2 fw-bold mb-0" style={{ color: '#fff' }}>{progress}%</span>
                        </div>
                        <div className="progress" style={{ height: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.3)' }}>
                            <div className="progress-bar" role="progressbar" style={{ width: `${progress}%`, borderRadius: '12px', background: '#6B8EFF', transition: 'width 0.5s ease', boxShadow: '0 2px 8px rgba(107,142,255,0.5)' }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div className="mt-3 d-flex align-items-center gap-2" style={{ color: '#fff' }}>
                            <span className="small">{totalCompletedCount} of {totalActiveCount} habits completed</span>
                            {progress === 100 && <span className="ms-auto">🎉</span>}
                        </div>
                    </div>
                </div>

                {/* 4. Habits List (Main Content) */}
                <div className="mb-3">
                    <h6 className="fw-bold mb-3" style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Today's Tasks</h6>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : (
                        renderGroupedHabits(sortedActive)
                    )}

                    {!loading && sortedActive.length === 0 && totalActiveCount > 0 && (
                        <div className="text-center py-5 bg-white rounded-4 shadow-lg mb-3" style={{ border: '2px dashed #e2e8f0' }}>
                            <span className="display-3">🎉</span>
                            <h5 className="fw-bold mt-3 mb-1" style={{ color: '#2C3E50' }}>Amazing Work!</h5>
                            <p className="text-muted mb-0">All tasks completed for today</p>
                        </div>
                    )}
                </div>

                {/* Completed Section (if any) */}
                {sortedCompleted.length > 0 && (
                    <div className="mt-5">
                        <h6 className="fw-bold mb-3" style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Completed</h6>
                        {renderGroupedHabits(sortedCompleted)}
                    </div>
                )}
            </div>
        </div>
    );
}
