import React, { useState, useRef, useEffect } from "react";
import "../../styles/habits.css";
import { useNavigate } from "react-router-dom";
import { createLog, deleteLog } from "../../api/habitLogs";
import NoteModal from "./NoteModal";
import ConfirmationModal from "../common/ConfirmationModal";
import { FaEllipsisV, FaEdit, FaChartBar, FaFire, FaUndo } from "react-icons/fa";

const getCategoryColor = (category) => {
    if (!category) return "secondary";
    const upper = category.toUpperCase();

    if (upper === "FITNESS") return "fitness";
    if (upper === "HEALTH") return "health";
    if (upper === "SOCIAL") return "social";
    if (upper === "PRODUCTIVITY") return "productivity";
    return "secondary";
};

const CATEGORY_HEX_COLORS = {
    fitness: "#E74C3C",      // Red-Orange
    health: "#3498DB",       // Blue
    social: "#9b59b6",       // Purple
    productivity: "#F39C12", // Orange
    secondary: "#6c757d"
};

const CATEGORY_BADGE_STYLES = {
    fitness: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },       // Red
    health: { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },        // Blue
    social: { bg: "#f3e8ff", color: "#7c3aed", border: "#e9d5ff" },        // Purple
    productivity: { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },  // Orange
    secondary: { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" }      // Gray
};

export default function HabitCard({ habit, onComplete, onUncomplete }) {
    const navigate = useNavigate();
    const userId = 1;

    const [completing, setCompleting] = useState(false);
    const [currentValue, setCurrentValue] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const scrubberRef = useRef(null);
    const menuRef = useRef(null);

    const [showNoteModal, setShowNoteModal] = useState(false);
    const [localNote, setLocalNote] = useState(habit.note || "");
    const [showMenu, setShowMenu] = useState(false);
    const [showUncompleteWarning, setShowUncompleteWarning] = useState(false);
    const [showSlider, setShowSlider] = useState(false);

    const isCompleted = habit.completedToday === true;
    const isPaused = habit.status === "PAUSED";
    const hasGoal = habit.goalType !== "OFF";

    const getTodayDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const today = getTodayDate();
    const startDate = habit.startDate ? new Date(habit.startDate).toISOString().split('T')[0] : null;
    const isFuture = startDate && startDate > today;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleComplete = async () => {
        try {
            setCompleting(true);
            const actualValue = hasGoal ? currentValue : 1;
            const resp = await createLog(userId, habit.id, { actualValue });
            const newLogId = resp.logId;
            if (onComplete) onComplete(habit.id, actualValue, newLogId);
            // Reset slider after successful submission
            setShowSlider(false);
            setCurrentValue(0);
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
        let percentage = Math.max(0, Math.min(1, x / width));
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
    const categoryColor = getCategoryColor(habit.category);

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
                className="habit-card-modern"
                style={{ borderTop: `4px solid ${CATEGORY_HEX_COLORS[categoryColor] || "#6c757d"}` }}
            >
                {/* Three Dot Menu */}
                <div className="habit-card-menu" ref={menuRef}>
                    <button
                        className="menu-trigger"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <FaEllipsisV />
                    </button>
                    {showMenu && (
                        <div className="menu-dropdown">
                            <button onClick={() => { navigate(`/habits/${habit.id}/report`); setShowMenu(false); }}>
                                <FaChartBar /> View Stats
                            </button>
                            <button onClick={() => { navigate(`/habits/${habit.id}/edit`); setShowMenu(false); }}>
                                <FaEdit /> Edit
                            </button>
                            {isCompleted && (
                                <button onClick={() => { setShowUncompleteWarning(true); setShowMenu(false); }}>
                                    <FaUndo /> Undo
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Card Content */}
                <div className="habit-card-content">
                    <h3 className="habit-card-title">{habit.title}</h3>
                    <p className="habit-card-description">{habit.description || "No description"}</p>

                    <div className="habit-card-badges">
                        <span
                            className="badge-category"
                            style={{
                                background: CATEGORY_BADGE_STYLES[categoryColor]?.bg || "#e0e7ff",
                                color: CATEGORY_BADGE_STYLES[categoryColor]?.color || "#4338ca",
                                borderColor: CATEGORY_BADGE_STYLES[categoryColor]?.border || "#c7d2fe"
                            }}
                        >
                            {habit.category}
                        </span>
                        <span className="badge-cadence">{habit.cadence}</span>
                        <span className="habit-streak-badge">
                            <FaFire /> {habit.currentStreak || habit.streak || 0}
                        </span>
                    </div>

                    {/* Progress Scrubber for goals - shows when slider is expanded */}
                    {!isCompleted && hasGoal && !isPaused && !isFuture && showSlider && (
                        <div className="habit-progress-section">
                            <div className="progress-header">
                                <span className="progress-label">LOG PROGRESS</span>
                                <span className="progress-value">
                                    <strong>{currentValue}</strong> / {habit.targetValue} {habit.unit}
                                </span>
                            </div>
                            <div
                                ref={scrubberRef}
                                onMouseDown={handleMouseDown}
                                className="progress-scrubber"
                            >
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progressPercent}%`, transition: isDragging ? "none" : "width 0.2s ease" }}
                                />
                            </div>
                            <span className="progress-hint">Slide to set value</span>
                            <div className="slider-actions">
                                <button
                                    className="complete-btn"
                                    onClick={handleComplete}
                                    disabled={completing || currentValue === 0}
                                >
                                    {completing ? "Submitting..." : "Submit"}
                                </button>
                                <button
                                    className="cancel-btn"
                                    onClick={() => { setShowSlider(false); setCurrentValue(0); }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Status Messages */}
                    {isPaused && !isCompleted && (
                        <div className="status-message warning">
                            <strong>Habit Paused</strong> - Edit to resume
                        </div>
                    )}
                    {isFuture && !isCompleted && (
                        <div className="status-message info">
                            <strong>Upcoming</strong> - Starts {new Date(habit.startDate).toLocaleDateString()}
                        </div>
                    )}

                    {/* Complete Button - for simple habits or to show slider for goal habits */}
                    {!isPaused && !isFuture && !isCompleted && !showSlider && (
                        <button
                            className="complete-btn"
                            onClick={() => {
                                if (hasGoal) {
                                    setShowSlider(true);
                                } else {
                                    handleComplete();
                                }
                            }}
                            disabled={completing}
                        >
                            {completing ? "Completing..." : "Complete Habit"}
                        </button>
                    )}

                    {/* Completed State */}
                    {isCompleted && (
                        <button className="complete-btn done" onClick={() => setShowNoteModal(true)}>
                            Add Note
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
