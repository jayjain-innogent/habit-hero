import React, { useEffect, useState } from "react";
import { getAllHabits } from "../../api/habits";
import { getTodayStatus } from "../../api/habitLogs";
import { mockHabits, mockTodayStatus } from "../../api/mockData";
import HabitCard from "../../components/habits/HabitCard";
import { useNavigate } from "react-router-dom";
import ProgressRing from "../../components/common/ProgressRing";
import { ArrowLeft, Zap, Award, Target, Download, ChartColumn} from 'lucide-react';
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

            console.log("Fetching habits for userId:", userId);

            // Try to fetch from backend first
            let habitList, todayStatus;
            try {
                habitList = await getAllHabits(userId);
                todayStatus = await getTodayStatus(userId);
            } catch (apiError) {
                console.warn("Backend not available, using mock data:", apiError.message);
                // Use mock data when backend is not available
                habitList = mockHabits;
                todayStatus = mockTodayStatus;
            }

            console.log("Habits response:", habitList);
            console.log("Today status response:", todayStatus);

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
            console.error("Error loading habits:", err);
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
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const formattedDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    if (loading) return <div className="loading">Loading habits...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            paddingBottom: '40px'
        }}>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            margin: 0
                        }}>Welcome Back, Hero!</h1>
                        <p style={{
                            color: '#6b7280',
                            fontSize: '16px',
                            fontWeight: '500',
                            margin: 0
                        }}>{formattedDate}</p>
                    </div>
                    <button
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '15px',
                            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate("/habits/create")}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        + Create Habit
                    </button>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #f0f0f0',
                    marginBottom: '32px',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '32px' }}>
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <h4 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}><ChartColumn size={24} style={{ color: '#667eea' }} /> Daily Progress</h4>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '16px',
                                    margin: 0,
                                    lineHeight: '1.6'
                                }}>
                                    You've completed <span style={{ fontWeight: '600', color: '#1f2937' }}>{completed}</span> out of <span style={{ fontWeight: '600', color: '#1f2937' }}>{total}</span> habits today.
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

                {habits.length === 0 && (
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
