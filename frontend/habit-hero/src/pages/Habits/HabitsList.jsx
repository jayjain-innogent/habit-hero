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

    const loadHabits = async () => {
        try {
            setLoading(true);
            setError("");

            const today = new Date().toISOString().split("T")[0];
            const cacheKey = getCacheKey(userId);
            const habitsCacheKey = `habits_list_${userId}`;
            const shouldBypassCache = window.forceReloadHabits;

            let habitList;

            if (!shouldBypassCache) {
                const cachedHabits = localStorage.getItem(habitsCacheKey);
                if (cachedHabits) {
                    habitList = JSON.parse(cachedHabits);
                }
            }

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
                actualValue: todayStatus?.status?.[h.id]?.actualValue ?? null,
                logId: todayStatus?.status?.[h.id]?.logId ?? null
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

    const handleCompleteCallback = (habitId, actualValue, newLogId) => {
        setHabits(prev =>
            prev.map(h =>
                h.id === habitId
                    ? { ...h, completedToday: true, actualValue, logId: newLogId }
                    : h
            )
        );

        const cacheKey = getCacheKey(userId);
        const cached = JSON.parse(localStorage.getItem(cacheKey));
        if (cached) {
            const updated = cached.data.map(h =>
                h.id === habitId
                    ? { ...h, completedToday: true, actualValue, logId: newLogId }
                    : h
            );
            localStorage.setItem(cacheKey, JSON.stringify({ date: cached.date, data: updated }));
        }
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

                {/* HEADER, PROGRESS, LOADING, EMPTY STATE — UNCHANGED */}

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
