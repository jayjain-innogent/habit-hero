import React, { useState, useRef, useEffect } from "react";
import "../../styles/habits.css";
import { useNavigate } from "react-router-dom";
import { createLog, deleteLog } from "../../api/habitLogs";
import NoteModal from "./NoteModal";
import ConfirmationModal from "../common/ConfirmationModal";

const getCategoryColor = (category) => {
    if (!category) return "secondary";
    const lower = category.toLowerCase();

    if (lower.includes("health") || lower.includes("fitness") || lower.includes("sport") || lower.includes("diet")) return "success"; // Green
    if (lower.includes("work") || lower.includes("career") || lower.includes("job") || lower.includes("business")) return "primary"; // Blue
    if (lower.includes("learn") || lower.includes("study") || lower.includes("read") || lower.includes("school")) return "info"; // Cyan
    if (lower.includes("mind") || lower.includes("meditation") || lower.includes("spirit")) return "secondary"; // Grey
    if (lower.includes("finance") || lower.includes("money") || lower.includes("budget")) return "warning"; // Yellow
    if (lower.includes("social") || lower.includes("family") || lower.includes("friend")) return "danger"; // Red/Pink
    if (lower.includes("art") || lower.includes("creat") || lower.includes("hobby")) return "pink"; // Custom? default to something else if pink not generic. Bootstrap has 'danger' or 'dark'. Let's stick to standard bootstrap.

    // Hash fallback for consistency if not matched
    const colors = ["primary", "success", "info", "warning", "danger", "secondary", "dark"];
    let hash = 0;
    for (let i = 0; i < lower.length; i++) {
        hash = lower.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const CATEGORY_HEX_COLORS = {
    primary: "#0d6efd", // Blue (Work)
    success: "#198754", // Green (Health)
    info: "#0dcaf0",    // Cyan (Study)
    warning: "#ffc107", // Yellow (Finance)
    danger: "#dc3545",  // Red (Social)
    secondary: "#6c757d", // Grey (Mind)
    dark: "#212529",    // Black
    pink: "#d63384"     // Pink (Art)
};

export default function HabitCard({ habit, onComplete, onUncomplete }) {
    const navigate = useNavigate();
    const userId = 1;

    const [completing, setCompleting] = useState(false);
    const [currentValue, setCurrentValue] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const scrubberRef = useRef(null);

    const [showNoteModal, setShowNoteModal] = useState(false);
    const [localNote, setLocalNote] = useState(habit.note || "");

    const [showUncompleteWarning, setShowUncompleteWarning] = useState(false);

    const isCompleted = habit.completedToday === true;
    const isPaused = habit.status === "PAUSED";
    const hasGoal = habit.goalType !== "OFF";

    const today = new Date().toISOString().split('T')[0];
    const startDate = habit.startDate ? new Date(habit.startDate).toISOString().split('T')[0] : null;
    const isFuture = startDate && startDate > today;

    const handleComplete = async () => {
        try {
            setCompleting(true);
            const actualValue = hasGoal ? currentValue : 1;

            const resp = await createLog(userId, habit.id, { actualValue });
            const newLogId = resp.logId;

            if (onComplete) onComplete(habit.id, actualValue, newLogId);
        } catch (err) {
            alert("Failed to complete habit");
        } finally {
            setCompleting(false);
        }
    };

    const handleUncomplete = async () => {
        if (!habit.logId) return;
        try {
            setCompleting(true);
            await deleteLog(userId, habit.logId);

            // Update cache to remove completion status (simplified)
            // Ideally we should refetch or have a robust cache update for deletion

            if (onUncomplete) onUncomplete(habit.id);
            setShowUncompleteWarning(false);
        } catch (err) {
            alert("Failed to uncomplete habit");
        } finally {
            setCompleting(false);
        }
    };

    const handleFireClick = () => {
        if (isCompleted) {
            setShowUncompleteWarning(true);
        } else if (!completing && (!hasGoal || currentValue > 0) && !isFuture) {
            handleComplete();
        }
    };

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
        if (isCompleted || isPaused || isFuture) return;
        setIsDragging(true);
        updateScrubberValue(e.clientX);
    };

    const handleMouseMove = (e) => {
        if (isDragging) updateScrubberValue(e.clientX);
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

    const progressPercent = hasGoal ? (currentValue / habit.targetValue) * 100 : 0;

    const catColor = getCategoryColor(habit.category);

    return (
        <>
            {showNoteModal && (
                <NoteModal
                    logId={habit.logId}
                    userId={userId}
                    show={showNoteModal}
                    onClose={() => setShowNoteModal(false)}
                    onUpdated={(text) => setLocalNote(text)}
                />
            )}

            <ConfirmationModal
                show={showUncompleteWarning}
                onClose={() => setShowUncompleteWarning(false)}
                onConfirm={handleUncomplete}
                title="Uncomplete Habit?"
                message="Are you sure you want to mark this habit as incomplete? This will remove your progress for today."
                confirmText="Yes, Uncomplete"
                variant="warning"
            />

            <div
                className={`card border-0 shadow-sm h-100 bg-white`}
                style={{
                    transition: "all 0.3s ease",
                    transition: "all 0.3s ease",
                    opacity: isCompleted ? 0.6 : (isPaused || isFuture) ? 0.7 : 1,
                    borderTop: `6px solid ${CATEGORY_HEX_COLORS[catColor] || "#6c757d"}`
                }}
            >
                <div className="card-body d-flex flex-column p-3">

                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold text-dark mb-0">
                            {habit.title}
                        </h5>
                        <div className="d-flex gap-2">
                            {isCompleted && (
                                <span className="badge bg-success-subtle text-success rounded-pill">Done</span>
                            )}
                            {isFuture && (
                                <span className="badge bg-secondary-subtle text-secondary rounded-pill">Upcoming</span>
                            )}
                        </div>
                    </div>

                    <p className="card-text text-secondary small mb-2" style={{ minHeight: "20px" }}>
                        {habit.description
                            ? habit.description.length > 70
                                ? habit.description.substring(0, 70) + "..."
                                : habit.description
                            : "No description"}
                    </p>

                    <div className="mb-3 d-flex flex-wrap gap-2">
                        <span className={`badge bg-${catColor}-subtle text-${catColor}-emphasis border border-${catColor}-subtle`}>
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

                        {!isCompleted && hasGoal && !isPaused && !isFuture && (
                            <div className="mb-3">
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
                                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                                        Slide to set value
                                    </small>
                                </div>
                            </div>
                        )}

                        {isPaused && !isCompleted && (
                            <div className="alert alert-warning mb-3 py-2 px-3" style={{ fontSize: "0.875rem", borderRadius: "8px" }}>
                                <strong>Habit Paused</strong> - Completion is disabled. Edit to resume.
                            </div>
                        )}

                        {isFuture && !isCompleted && (
                            <div className="alert alert-secondary mb-3 py-2 px-3" style={{ fontSize: "0.875rem", borderRadius: "8px" }}>
                                <strong>Upcoming</strong> - Starts on {new Date(habit.startDate).toLocaleDateString()}.
                            </div>
                        )}

                        {!isPaused && !isFuture && !isCompleted && (
                            <button
                                className="btn w-100 rounded-3 py-2 fw-bold mb-3"
                                onClick={handleFireClick}
                                disabled={completing || (hasGoal && currentValue === 0)}
                                style={{
                                    background: 'linear-gradient(135deg, #8CA9FF, #6B8EFF)',
                                    color: '#fff',
                                    border: '2px solid #6B8EFF',
                                    boxShadow: '0 4px 12px rgba(140,169,255,0.3)'
                                }}
                            >
                                Complete Habit
                            </button>
                        )}

                        {isCompleted && (
                            <>
                                <button
                                    className="btn w-100 rounded-3 py-2 fw-bold mb-2"
                                    onClick={() => setShowNoteModal(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #8CA9FF, #6B8EFF)',
                                        color: '#fff',
                                        border: '2px solid #6B8EFF',
                                        boxShadow: '0 4px 12px rgba(140,169,255,0.3)'
                                    }}
                                >
                                    Add Note
                                </button>
                                <button
                                    className="btn w-100 rounded-3 py-2 fw-bold mb-3"
                                    onClick={() => setShowUncompleteWarning(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #94a3b8, #64748b)',
                                        color: '#fff',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(148,163,184,0.3)'
                                    }}
                                >
                                    Mark Incomplete
                                </button>
                            </>
                        )}

                        <div className="d-flex justify-content-between border-top pt-2 mt-2">
                            <button
                                className="btn btn-link text-decoration-none text-secondary p-0 btn-sm"
                                onClick={() => navigate(`/habits`)}
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
        </>
    );
}
