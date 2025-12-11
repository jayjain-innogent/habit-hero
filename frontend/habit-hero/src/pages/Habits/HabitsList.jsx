import React, { useEffect, useState } from "react";
import { getAllHabits } from "../../api/habits";
import { getTodayStatus } from "../../api/habitLogs";
import HabitCard from "../../components/habits/HabitCard";
import { useNavigate } from "react-router-dom";
import ProgressRing from "../../components/common/ProgressRing";

import { FaClipboardList, FaBullseye, FaSeedling, FaPlus } from "react-icons/fa";
import { QUOTES } from "../../data/quotes";

const sortHabits = (list) => {
    const today = new Date().toISOString().split("T")[0];

    return [...list].sort((a, b) => {
        const getScore = (h) => {
            const isCompleted = h.completedToday;
            const isPaused = h.status === "PAUSED";
            const startDate = h.startDate ? new Date(h.startDate).toISOString().split('T')[0] : null;
            const isUpcoming = startDate && startDate > today;

            if (isUpcoming) return 4;
            if (isPaused) return 3;
            if (isCompleted) return 2;
            return 1;
        };

        const scoreA = getScore(a);
        const scoreB = getScore(b);

        if (scoreA !== scoreB) return scoreA - scoreB;

        if (scoreA === 1) {
            const catCompare = (a.category || "").toLowerCase().localeCompare((b.category || "").toLowerCase());
            if (catCompare !== 0) return catCompare;
            return (a.title || "").toLowerCase().localeCompare((b.title || "").toLowerCase());
        }

        return 0;
    });
};

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

            list = sortHabits(list);
            setHabits(list);
        } catch (err) {
            setError("Failed to load habits. Please try again.");
            setHabits([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteCallback = (habitId, actualValue, newLogId) => {
        setHabits(prev => {
            const updated = prev.map(h =>
                h.id === habitId
                    ? { ...h, completedToday: true, actualValue, logId: newLogId }
                    : h
            );
            return sortHabits(updated);
        });
    };

    const handleUncompleteCallback = (habitId) => {
        setHabits(prev => {
            const updated = prev.map(h =>
                h.id === habitId
                    ? { ...h, completedToday: false, actualValue: null, logId: null }
                    : h
            );
            return sortHabits(updated);
        });
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
            background: 'linear-gradient(135deg, #FFF8DE 0%, #8CA9FF 100%)',
            paddingBottom: '40px'
        }}>
            <div className="container py-4">

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="fw-bold mb-2" style={{ color: '#000', fontSize: '2rem' }}>Welcome back, Hero!</h1>
                        <p className="text-muted mb-1" style={{ fontSize: '1rem', fontStyle: 'italic' }}>
                            "{QUOTES[Math.floor(Math.random() * QUOTES.length)].text}"
                        </p>
                        <p className="text-muted mb-0 small">{formattedDate}</p>
                    </div>
                    <button
                        className="btn rounded-pill px-4 py-2 shadow-lg fw-semibold d-flex align-items-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #8CA9FF, #6B8EFF)', color: '#fff', border: '2px solid #6B8EFF' }}
                        onClick={() => navigate("/habits/create")}
                    >
                        <FaPlus size={14} />
                        <span>Create Habit</span>
                    </button>
                </div>

                <div className="card border-0 shadow-lg mb-4 overflow-hidden rounded-4" style={{ background: 'linear-gradient(135deg, #8CA9FF 0%, #6B8EFF 100%)', border: '3px solid #6B8EFF' }}>
                    <div className="card-body p-4">
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <FaBullseye size={24} style={{ color: '#fff' }} />
                                    <h4 className="fw-bold mb-0" style={{ color: '#fff' }}>Daily Progress</h4>
                                </div>
                                <p className="mb-0" style={{ color: '#fff', opacity: 0.95 }}>
                                    You've completed <span className="fw-bold">{completed}</span> out of <span className="fw-bold">{total}</span> habits today.
                                    Keep it up!
                                </p>
                            </div>
                            <div className="col-md-4 text-center text-md-end mt-3 mt-md-0">
                                <div style={{ width: 90, height: 90, display: 'inline-block' }}>
                                    <ProgressRing radius={45} stroke={9} progress={progress} />
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
                    <div className="card border-0 shadow-lg rounded-4 text-center py-5" style={{ background: 'white', border: '2px solid #8CA9FF' }}>
                        <FaSeedling size={80} className="mb-3" style={{ color: '#8CA9FF' }} />
                        <h5 className="fw-bold" style={{ color: '#2C3E50' }}>No habits yet</h5>
                        <p className="text-muted">Start your journey by creating your first habit!</p>
                    </div>
                )}

                <div className="row g-3">
                    {habits.map((habit, index) => {
                        const showCategoryHeader = index === 0 || habits[index - 1].category !== habit.category;
                        return (
                            <React.Fragment key={habit.id}>
                                {showCategoryHeader && (
                                    <div className="col-12 mt-3">
                                        <h5 className="fw-bold mb-0" style={{ color: '#2C3E50', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                                            {habit.category}
                                        </h5>
                                        <hr style={{ borderTop: '2px solid #8CA9FF', opacity: 0.3, margin: '8px 0 16px 0' }} />
                                    </div>
                                )}
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <HabitCard
                                        habit={habit}
                                        onComplete={handleCompleteCallback}
                                        onUncomplete={handleUncompleteCallback}
                                    />
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
