import React, { useState, useRef, useEffect } from "react";
import { FaDumbbell, FaHeart, FaUsers, FaBriefcase, FaStar, FaCheck, FaFire } from "react-icons/fa";
import { BiTargetLock } from "react-icons/bi";

const CATEGORY_STYLES = {
    FITNESS: { color: "#f97316", bg: "#ffedd5", icon: <FaDumbbell /> }, // Orange
    HEALTH: { color: "#10b981", bg: "#d1fae5", icon: <FaHeart /> },     // Emerald
    SOCIAL: { color: "#3b82f6", bg: "#dbeafe", icon: <FaUsers /> },     // Blue
    PRODUCTIVITY: { color: "#8b5cf6", bg: "#ede9fe", icon: <FaBriefcase /> }, // Violet
    DEFAULT: { color: "#6b7280", bg: "#f3f4f6", icon: <FaStar /> }      // Gray
};

export default function HabitRow({ habit, onComplete, onUncomplete }) {
    const [completing, setCompleting] = useState(false);
    const [currentValue, setCurrentValue] = useState(habit.actualValue || 0);
    const [isDragging, setIsDragging] = useState(false);
    const scrubberRef = useRef(null);

    const isCompleted = habit.completedToday;
    const hasGoal = habit.goalType !== "OFF" && habit.targetValue > 0;

    // Get style based on category
    const style = CATEGORY_STYLES[habit.category] || CATEGORY_STYLES.DEFAULT;

    // --- Scrubber Logic (Borrowed from HabitCard implementation) ---
    const updateScrubberValue = (clientX) => {
        if (!scrubberRef.current || !hasGoal) return;
        const rect = scrubberRef.current.getBoundingClientRect();
        const width = rect.width;
        let percentage = (clientX - rect.left) / width;
        percentage = Math.max(0, Math.min(1, percentage));
        setCurrentValue(Math.round(percentage * habit.targetValue));
        // Force cursor update if needed, but react state is fine.
        document.body.style.cursor = 'grabbing';
    };

    const handleMouseDown = (e) => {
        if (isCompleted) return;
        setIsDragging(true);
        updateScrubberValue(e.clientX);
    };

    useEffect(() => {
        const handleMouseMove = (e) => { if (isDragging) updateScrubberValue(e.clientX); };
        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                document.body.style.cursor = 'default';
            }
        };

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);
    // ---------------------------------------------------------------

    const handleCheckClick = async () => {
        if (completing) return;
        if (isCompleted) {
            if (onUncomplete) onUncomplete(habit.id);
        } else {
            // If goal exists, use currentValue, else 1
            const val = hasGoal ? (currentValue > 0 ? currentValue : habit.targetValue) : 1;
            if (onComplete) onComplete(habit.id, val, null);
        }
    };

    const handleInputSubmit = () => {
        if (currentValue > 0 && onComplete) {
            onComplete(habit.id, currentValue, null);
        }
    };

    // Calculate progress for background bar if needed, or just the scrubber
    const progressPercent = hasGoal ? (currentValue / habit.targetValue) * 100 : 0;

    return (
        <div
            className={`d-flex align-items-center justify-content-between p-3 mb-3 bg-white rounded-4 shadow-sm transition-all`}
            style={{
                opacity: isCompleted ? 0.6 : 1,
                transform: isCompleted ? 'scale(0.99)' : 'scale(1)',
                transition: 'all 0.2s ease',
                borderLeft: `5px solid ${style.color}`
            }}
        >
            {/* LEFT: Icon + Text */}
            <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
                {/* Icon Box */}
                <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: style.bg,
                        color: style.color,
                        fontSize: '1.25rem'
                    }}
                >
                    {style.icon}
                </div>

                {/* Text Info */}
                <div>
                    <h6 className="mb-0 fw-bold text-dark">{habit.title}</h6>
                    <small className="fw-bold" style={{ color: style.color, fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                        {habit.category}
                    </small>
                </div>
            </div>

            {/* RIGHT: Action (Scrubber/Input or Checkbox) */}
            <div className="d-flex align-items-center gap-3">

                {/* If Active & Has Goal: Show Scrubber/Input Control */}
                {!isCompleted && hasGoal && (
                    <div className="d-flex align-items-center gap-2">
                        <div
                            ref={scrubberRef}
                            onMouseDown={handleMouseDown}
                            className="position-relative bg-light rounded-pill overflow-hidden"
                            style={{ width: '100px', height: '30px', cursor: 'grab', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                        >
                            {/* Filling Bar */}
                            <div
                                className="h-100"
                                style={{
                                    width: `${progressPercent}%`,
                                    backgroundColor: style.color,
                                    transition: isDragging ? 'none' : 'width 0.2s',
                                    boxShadow: '0 0 10px rgba(0,0,0,0.15)'
                                }}
                            />
                            {/* Text Overlay */}
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                <span className="small fw-bold text-dark" style={{ fontSize: '0.75rem', pointerEvents: 'none' }}>
                                    {currentValue} / {habit.targetValue}
                                </span>
                            </div>
                        </div>
                        <button
                            className="btn btn-sm text-white rounded-circle d-flex align-items-center justify-content-center p-0"
                            style={{
                                width: '30px',
                                height: '30px',
                                backgroundColor: style.color,
                                border: 'none'
                            }}
                            onClick={handleInputSubmit}
                            disabled={currentValue === 0}
                        >
                            <FaCheck size={12} />
                        </button>
                    </div>
                )}

                {/* If No Goal OR Completed: Show Simple Checkbox */}
                {/* Visual Check Circle */}
                {(!hasGoal || isCompleted) && (
                    <div
                        onClick={handleCheckClick}
                        className={`rounded-circle d-flex align-items-center justify-content-center cursor-pointer transition-all`}
                        style={{
                            width: '32px',
                            height: '32px',
                            border: `2px solid ${isCompleted ? style.color : '#e5e7eb'}`,
                            backgroundColor: isCompleted ? style.color : 'transparent',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        {isCompleted && <FaCheck size={14} />}
                    </div>
                )}
            </div>
        </div>
    );
}
