import React, { useEffect, useState, useMemo } from "react";
import { getAllHabits } from "../../api/habits";
import { getTodayStatus } from "../../api/habitLogs";
import { fetchDashboardData } from "../../services/api";
import HabitCard from "../../components/habits/HabitCard";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaFire, FaClock, FaTrophy } from "react-icons/fa";
import PerfectDayPopup from "../../components/habits/PerfectDayPopup";
import "./HabitsList.css";

const sortHabits = (list) => {
    const getTodayDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const today = getTodayDate();

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
    const [activeCategory, setActiveCategory] = useState("All");
    const [showPerfectPopup, setShowPerfectPopup] = useState(false);
    const [perfectDays, setPerfectDays] = useState(0);

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

            // Fetch dashboard data for perfectDays
            try {
                const dashboardData = await fetchDashboardData();
                setPerfectDays(dashboardData?.cardData?.perfectDays || 0);
            } catch (e) {
                // Ignore dashboard errors
            }

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
            // Check if all active habits are now completed
            const activeHabits = updated.filter(h => h.status === "ACTIVE");
            const allCompleted = activeHabits.every(h => h.completedToday);
            if (allCompleted && activeHabits.length > 0) {
                setShowPerfectPopup(true);
            }
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

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(habits.map(h => h.category).filter(Boolean));
        return ["All", ...Array.from(cats)];
    }, [habits]);

    // Filter habits by category
    const filteredHabits = useMemo(() => {
        if (activeCategory === "All") return habits;
        return habits.filter(h => h.category === activeCategory);
    }, [habits, activeCategory]);

    // Get priority habit (first incomplete)
    const priorityHabit = useMemo(() => {
        return habits.find(h => !h.completedToday && h.status === "ACTIVE");
    }, [habits]);

    const activeHabits = habits.filter(h => h.status === "ACTIVE");
    const total = activeHabits.length;
    const completed = activeHabits.filter(h => h.completedToday).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const formattedDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    // Calculate highest streak (max of all habit streaks)
    const highestStreak = habits.length > 0
        ? Math.max(...habits.map(h => h.currentStreak || h.streak || 0))
        : 0;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="habits-page">
            {/* Perfect Day Popup */}
            <PerfectDayPopup
                show={showPerfectPopup}
                onClose={() => setShowPerfectPopup(false)}
            />

            {/* Header */}
            <div className="habits-header">
                <div className="habits-header-left">
                    <h1 className="habits-title">Welcome back, Hero!</h1>
                    <p className="habits-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

                </div>
                <button
                    className="add-habit-btn"
                    onClick={() => navigate("/habits/create")}
                >
                    <FaPlus size={14} />
                    <span>Add New Habit</span>
                </button>
            </div>

            {/* Daily Progress Card */}
            <div className="daily-progress-card">
                <div className="progress-main">
                    <div className="progress-info">
                        <h3 className="progress-title">Daily Progress</h3>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="progress-text">
                            {completed === total && total > 0
                                ? "All habits completed! Great job!"
                                : `${total - completed} habits remaining today`}
                        </p>
                    </div>
                    <div className="progress-percentage">{progress}%</div>
                </div>
                <div className="progress-stats">
                    <div className="stat-item">
                        {(total === 0 || total - completed > 0) ? (
                            <>
                                <span className="stat-icon pending"><FaClock /></span>
                                <span className="stat-value">{total - completed}</span>
                                <span className="stat-label">PENDING</span>
                            </>
                        ) : (
                            <>
                                <span className="stat-icon perfect"><FaTrophy /></span>
                                <span className="stat-value">{perfectDays}</span>
                                <span className="stat-label">PERFECT DAYS</span>
                            </>
                        )}
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon streak"><FaFire /></span>
                        <span className="stat-value">{highestStreak}</span>
                        <span className="stat-label">BEST STREAK</span>
                    </div>
                </div>
            </div>

            {/* Category Tabs - Below Daily Progress */}
            <div className="category-tabs">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading habits...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="error-state">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && habits.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🌱</div>
                    <h3>No habits yet</h3>
                    <p>Start your journey by creating your first habit!</p>
                    <button
                        className="add-habit-btn"
                        onClick={() => navigate("/habits/create")}
                    >
                        <FaPlus /> Create Your First Habit
                    </button>
                </div>
            )}

            {/* Habits Grid */}
            {!loading && !error && filteredHabits.length > 0 && (
                <div className="habits-grid">
                    {filteredHabits.map(habit => (
                        <div key={habit.id} className="habit-grid-item">
                            <HabitCard
                                habit={habit}
                                onComplete={handleCompleteCallback}
                                onUncomplete={handleUncompleteCallback}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
