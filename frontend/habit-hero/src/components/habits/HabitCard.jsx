import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLog } from "../../api/habitLogs";
import { updateTodayStatusCache } from "../../utils/cache";

export default function HabitCard({ habit, onComplete }) {
    const navigate = useNavigate();
    const userId = 1;

    const [completing, setCompleting] = useState(false);
    const [currentValue, setCurrentValue] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const scrubberRef = useRef(null);

    const isCompleted = habit.completedToday === true;
    const isPaused = habit.status === "PAUSED";
    const hasGoal = habit.goalType !== "OFF";

    const handleComplete = async () => {
        try {
            setCompleting(true);
            const actualValue = hasGoal ? currentValue : 1;

            await createLog(userId, habit.id, { actualValue });
            updateTodayStatusCache(userId, habit.id, actualValue);

            if (onComplete) onComplete(habit.id, actualValue);
        } catch (err) {
            alert("Failed to complete habit");
        } finally {
            setCompleting(false);
        }
    };

    // Scrubber Logic
    const updateScrubberValue = (clientX) => {
        if (!scrubberRef.current || !hasGoal) return;

        const rect = scrubberRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const width = rect.width;

        let percentage = x / width;
        percentage = Math.max(0, Math.min(1, percentage));

        const newValue = Math.round(percentage * habit.targetValue);
        setCurrentValue(newValue);
    };

    const handleMouseDown = (e) => {
        if (isCompleted || isPaused) return;
        setIsDragging(true);
        updateScrubberValue(e.clientX);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            updateScrubberValue(e.clientX);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    // Calculate progress percentage for visual bar
    const progressPercent = hasGoal
        ? (currentValue / habit.targetValue) * 100
        : 0;

    return (
        <div
            className={`card border-0 shadow-sm h-100 bg-white`}
            style={{
                transition: "all 0.3s ease",
                opacity: isCompleted ? 0.8 : isPaused ? 0.7 : 1,
                borderLeft: isCompleted
                    ? "4px solid #10b981"
                    : isPaused
                        ? "4px solid #f59e0b"
                        : "4px solid transparent"
            }}
        >
            <div className="card-body d-flex flex-column p-4">

                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title fw-bold text-dark mb-0">{habit.title}</h5>
                    <div className="d-flex gap-2">
                        {isCompleted && <span className="badge bg-success-subtle text-success rounded-pill">Done</span>}
                    </div>
                </div>

                <p className="card-text text-secondary small mb-3" style={{ minHeight: "40px" }}>
                    {habit.description
                        ? habit.description.length > 70
                            ? habit.description.substring(0, 70) + "..."
                            : habit.description
                        : "No description"}
                </p>

                <div className="mb-4 d-flex flex-wrap gap-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                        {habit.category}
                    </span>
                    <span className="badge bg-light text-secondary border">
                        {habit.cadence}
                    </span>
                    {hasGoal && (
                        <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                            Goal: {habit.targetValue} {habit.unit}
                        </span>
                    )}
                </div>

                <div className="mt-auto">

                    {!isCompleted && hasGoal && !isPaused && (
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-end mb-2">
                                <label className="form-label small fw-bold text-secondary mb-0">LOG PROGRESS</label>
                                <div className="text-primary fw-bold">
                                    <span className="fs-5">{currentValue}</span>
                                    <span className="small text-muted"> / {habit.targetValue} {habit.unit}</span>
                                </div>
                            </div>

                            <div
                                ref={scrubberRef}
                                onMouseDown={handleMouseDown}
                                className="position-relative rounded-pill"
                                style={{
                                    height: "12px",
                                    backgroundColor: "#e9ecef",
                                    cursor: "pointer",
                                    overflow: "hidden"
                                }}
                            >
                                <div
                                    className="h-100 bg-primary"
                                    style={{
                                        width: `${progressPercent}%`,
                                        transition: isDragging ? "none" : "width 0.2s ease"
                                    }}
                                />
                            </div>
                            <div className="text-center mt-1">
                                <small className="text-muted" style={{ fontSize: "0.7rem" }}>Slide to set value</small>
                            </div>
                        </div>
                    )}

                    {isPaused && !isCompleted && (
                        <div className="alert alert-warning mb-3 py-2 px-3" style={{ fontSize: "0.875rem", borderRadius: "8px" }}>
                            <strong>Habit Paused</strong> - Completion is disabled. Edit to resume.
                        </div>
                    )}

                    {!isCompleted && !isPaused && (
                        <button
                            className="btn btn-primary w-100 mb-3 py-2 fw-semibold shadow-sm"
                            onClick={handleComplete}
                            disabled={completing || (hasGoal && currentValue === 0)}
                        >
                            {completing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Saving...
                                </>
                            ) : (
                                "Mark Complete"
                            )}
                        </button>
                    )}

                    <div className="d-flex justify-content-between border-top pt-3">
                        <button
                            className="btn btn-link text-decoration-none text-secondary p-0 btn-sm"
                            onClick={() => navigate(`/habits/${habit.id}/report`)}
                        >
                            View Stats
                        </button>

                        <button
                            className="btn btn-link text-decoration-none text-secondary p-0 btn-sm"
                            onClick={() => navigate(`/habits/${habit.id}/edit`)}
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
