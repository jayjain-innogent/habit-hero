import React, { useEffect, useState } from "react";
import { getAllHabits } from "../../api/habits";
import { getTodayStatus } from "../../api/habitLogs";
import HabitCard from "../../components/habits/HabitCard";
import { useNavigate } from "react-router-dom";
import ProgressRing from "../../components/common/ProgressRing";

export default function HabitsList() {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const userId = 1;

    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = async () => {
        try {
            setLoading(true);
            setError("");

            const today = new Date().toISOString().split("T")[0];

            // Fetch fresh data from backend
            const habitList = await getAllHabits(userId);
            const todayStatus = await getTodayStatus(userId);

            let list = Array.isArray(habitList) ? habitList : [];
            list = list.filter(h => h.status !== "ARCHIVED");

            list = list.map(h => ({
                ...h,
                completedToday: todayStatus?.status?.[h.id]?.completedToday || false,
                actualValue: todayStatus?.status?.[h.id]?.actualValue ?? null,
                logId: todayStatus?.status?.[h.id]?.logId ?? null
            }));

            setHabits(list);
        } catch (err) {
            setError("Failed to load habits. Please try again.");
            setHabits([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteCallback = (habitId, actualValue, newLogId) => {
        setHabits(prev =>
            prev.map(h =>
                h.id === habitId
                    ? { ...h, completedToday: true, actualValue, logId: newLogId }
                    : h
            )
        );
    };

    const handleUncompleteCallback = (habitId) => {
        setHabits(prev =>
            prev.map(h =>
                h.id === habitId
                    ? { ...h, completedToday: false, actualValue: null, logId: null }
                    : h
            )
        );
    };

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

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="fw-bold mb-0 text-dark">Welcome Back, Hero!</h1>
                        <p className="text-muted mb-0">{formattedDate}</p>
                    </div>
                    <button
                        className="btn btn-primary rounded-pill px-4 shadow-sm fw-semibold"
                        onClick={() => navigate("/habits/create")}
                    >
                        + Create Habit
                    </button>
                </div>

                <div className="card border-0 shadow-sm mb-4 bg-white overflow-hidden">
                    <div className="card-body p-4">
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <h4 className="fw-bold text-primary mb-2">Daily Progress</h4>
                                <p className="text-muted mb-0">
                                    You've completed <span className="fw-bold text-dark">{completed}</span> out of <span className="fw-bold text-dark">{total}</span> habits today.
                                    Keep it up!
                                </p>
                            </div>
                            <div className="col-md-4 text-center text-md-end mt-3 mt-md-0">
                                <div style={{ width: 80, height: 80, display: 'inline-block' }}>
                                    <ProgressRing radius={40} stroke={8} progress={progress} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger shadow-sm border-0" role="alert">
                        {error}
                    </div>
                )}

                {!loading && !error && habits.length === 0 && (
                    <div className="text-center py-5 text-muted">
                        <div className="mb-3 display-1">🌱</div>
                        <h5>No habits yet</h5>
                        <p>Start your journey by creating your first habit!</p>
                    </div>
                )}

                <div className="row g-3">
                    {habits.map(habit => (
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={habit.id}>
                            <HabitCard
                                habit={habit}
                                onComplete={handleCompleteCallback}
                                onUncomplete={handleUncompleteCallback}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
