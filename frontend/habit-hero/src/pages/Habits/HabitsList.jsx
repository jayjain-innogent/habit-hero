import React, { useEffect, useState } from "react";
import { getAllHabits } from "../../api/habits";
import { getTodayStatus } from "../../api/habitLogs";
import HabitCard from "../../components/habits/HabitCard";
import { useNavigate } from "react-router-dom";
import ProgressRing from "../../components/common/ProgressRing";
import { getCacheKey } from "../../utils/cache";

export default function HabitsList() {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const userId = 1;

    useEffect(() => {
        loadHabits();
    }, []);

    //load habits + today status + caching
    const loadHabits = async () => {
        try {
            setLoading(true);
            setError("");

            const today = new Date().toISOString().split("T")[0];
            const cacheKey = getCacheKey(userId);
            const habitsCacheKey = `habits_list_${userId}`;

            // Check if we should bypass cache
            const shouldBypassCache = window.forceReloadHabits;

            let habitList;

            // Try to use cached habit list
            if (!shouldBypassCache) {
                const cachedHabits = localStorage.getItem(habitsCacheKey);
                if (cachedHabits) {
                    habitList = JSON.parse(cachedHabits);
                }
            }

            // If no cached habits, fetch from API
            if (!habitList) {
                habitList = await getAllHabits(userId);
                localStorage.setItem(habitsCacheKey, JSON.stringify(habitList));
            }


            const todayStatus = await getTodayStatus(userId);

            let list = Array.isArray(habitList) ? habitList : [];
            list = list.filter(h => h.status !== "ARCHIVED");

            list = list.map(h => ({
                ...h,
                completedToday: todayStatus?.status?.[h.id]?.completedToday || false,
                actualValue: todayStatus?.status?.[h.id]?.actualValue ?? null
            }));

            localStorage.setItem(
                cacheKey,
                JSON.stringify({ date: today, data: list })
            );

            setHabits(list);
            window.forceReloadHabits = false;
        } catch (err) {
            setError("Failed to load habits. Please try again.");
            setHabits([]);
        } finally {
            setLoading(false);
        }
    };

    //when the user completes a habit
    const handleCompleteCallback = (habitId, actualValue) => {
        setHabits(prev =>
            prev.map(h =>
                h.id === habitId ? { ...h, completedToday: true, actualValue } : h
            )
        );

        const cacheKey = getCacheKey(userId);
        const cached = JSON.parse(localStorage.getItem(cacheKey));
        if (cached) {
            const updated = cached.data.map(h =>
                h.id === habitId ? { ...h, completedToday: true, actualValue } : h
            );
            localStorage.setItem(cacheKey, JSON.stringify({ date: cached.date, data: updated }));
        }
    };

    //progress calculations
    const activeHabits = habits.filter(h => h.status === "ACTIVE");
    const total = activeHabits.length;
    const completed = activeHabits.filter(h => h.completedToday).length;
    const remaining = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const formattedDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            paddingBottom: '40px'
        }}>
            <div className="container py-4">

                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div>
                        <h2 className="mb-1 fw-bold" style={{ color: '#212529' }}>Welcome Back Hero</h2>

                    </div>
                    <button
                        className="btn btn-primary shadow-sm px-4"
                        onClick={() => navigate("/habits/create")}
                        style={{
                            borderRadius: '10px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        + Create Habit
                    </button>
                </div>

                <div className="mb-4">
                    <h5 className="mb-1 fw-semibold" style={{ color: '#495057' }}>{formattedDate}</h5>
                    <p className="text-muted mb-0">Keep up the great work!</p>
                </div>

                <div className="progress-summary-card mb-4">
                    <div className="progress-summary-left">
                        <ProgressRing progress={progress} size={110} stroke={10} />
                    </div>

                    <div className="progress-summary-right">
                        <h4 className="fw-semibold">Today's Progress</h4>
                        <p className="mb-2">
                            {completed} of {total} habits completed
                        </p>

                        <div className="progress-summary-stats">
                            <div className="progress-summary-pill">
                                <h5 className="mb-0">{completed}</h5>
                                <small>Done</small>
                            </div>

                            <div className="progress-summary-pill">
                                <h5 className="mb-0">{remaining}</h5>
                                <small>Remaining</small>
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                        <p className="text-muted mt-2">Loading your habits...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger shadow-sm" style={{ borderRadius: '12px' }}>
                        {error}
                    </div>
                )}

                {!loading && habits.length === 0 && !error && (
                    <div
                        className="alert alert-info shadow-sm text-center"
                        style={{
                            borderRadius: '12px',
                            padding: '2rem',
                            border: 'none',
                            backgroundColor: '#e7f1ff'
                        }}
                    >
                        <h5 className="mb-2">No habits yet</h5>
                        <p className="mb-3 text-muted">Start your journey by creating your first habit!</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/habits/create")}
                        >
                            Create Your First Habit
                        </button>
                    </div>
                )}

                <div className="row g-3">
                    {habits.map(habit => (
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={habit.id}>
                            <HabitCard habit={habit} onComplete={handleCompleteCallback} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
