import React, { useState, useRef, useEffect } from "react";
import { FaDumbbell, FaHeart, FaUsers, FaBriefcase, FaStar, FaCheck, FaFire, FaTrophy } from "react-icons/fa";
import { BiTargetLock } from "react-icons/bi";

const CATEGORY_STYLES = {
    FITNESS: { color: "#E74C3C", gradient: "linear-gradient(135deg, #E74C3C 0%, #F39C12 100%)", iconBg: "linear-gradient(135deg, #F39C12, #E74C3C)", icon: <FaDumbbell /> },
    HEALTH: { color: "#3498DB", gradient: "linear-gradient(135deg, #3498DB 0%, #5DADE2 100%)", iconBg: "linear-gradient(135deg, #5DADE2, #3498DB)", icon: <FaHeart /> },
    SOCIAL: { color: "#9B59B6", gradient: "linear-gradient(135deg, #9B59B6 0%, #BB8FCE 100%)", iconBg: "linear-gradient(135deg, #BB8FCE, #9B59B6)", icon: <FaUsers /> },
    PRODUCTIVITY: { color: "#F39C12", gradient: "linear-gradient(135deg, #F39C12 0%, #F8C471 100%)", iconBg: "linear-gradient(135deg, #F8C471, #F39C12)", icon: <FaBriefcase /> },
    DEFAULT: { color: "#2C7DA0", gradient: "linear-gradient(135deg, #2C7DA0 0%, #61A5C2 100%)", iconBg: "linear-gradient(135deg, #61A5C2, #2C7DA0)", icon: <FaStar /> }
};

export default function HabitRow({ habit, onComplete, onUncomplete }) {
    const [completing, setCompleting] = useState(false);
    const [currentValue, setCurrentValue] = useState(habit.actualValue || 0);
    const [isDragging, setIsDragging] = useState(false);
    const scrubberRef = useRef(null);

    const isCompleted = habit.completedToday;
    const hasGoal = habit.goalType !== "OFF" && habit.targetValue > 0;

    // Get style based on category - DEFAULT uses new theme colors
    const style = CATEGORY_STYLES[habit.category] || {
        ...CATEGORY_STYLES.DEFAULT,
        color: '#8CA9FF',
        gradient: 'linear-gradient(135deg, #8CA9FF, #6B8EFF)',
        iconBg: 'linear-gradient(135deg, #8CA9FF, #6B8EFF)'
    };

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
        <div className="col-12 col-md-6 mb-4">
            <div className="position-relative rounded-4 shadow-lg h-100" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #FFF8DE 100%)', border: `2px solid ${style.color}`, overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', transform: isCompleted ? 'scale(0.97)' : 'scale(1)', opacity: isCompleted ? 0.75 : 1 }}>
                
                {/* Decorative Top Bar */}
                <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: style.gradient, boxShadow: `0 2px 12px ${style.color}40` }} />
                
                {/* Completed Badge */}
                {isCompleted && (
                    <div className="position-absolute top-0 end-0 m-3" style={{ background: style.gradient, borderRadius: '20px', padding: '6px 14px', boxShadow: `0 4px 15px ${style.color}50`, zIndex: 10 }}>
                        <div className="d-flex align-items-center gap-2">
                            <FaTrophy size={14} style={{ color: '#fff' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>DONE</span>
                        </div>
                    </div>
                )}

                <div className="p-4">
                    {/* Header Section */}
                    <div className="d-flex align-items-start gap-3 mb-4">
                        {/* Icon */}
                        <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '70px', height: '70px', background: style.iconBg, color: '#fff', fontSize: '1.8rem', boxShadow: `0 8px 24px ${style.color}35`, flexShrink: 0 }}>
                            {style.icon}
                        </div>
                        
                        {/* Title & Category */}
                        <div className="flex-grow-1">
                            <h5 className="mb-2 fw-bold" style={{ color: '#2C3E50', fontSize: '1.25rem', lineHeight: '1.3' }}>{habit.title}</h5>
                            <div className="d-inline-block px-3 py-1 rounded-pill" style={{ background: style.gradient, fontSize: '0.7rem', fontWeight: '700', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {habit.category}
                            </div>
                        </div>
                    </div>

                    {/* Progress/Action Section */}
                    <div className="mt-4">
                        {hasGoal && (
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Progress</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#2C3E50' }}>{currentValue} / {habit.targetValue}</span>
                                </div>
                                {!isCompleted && (
                                    <div ref={scrubberRef} onMouseDown={handleMouseDown} className="position-relative rounded-pill overflow-hidden" style={{ width: '100%', height: '48px', cursor: 'grab', background: '#FFF8DE', border: `2px solid ${style.color}`, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.08)' }}>
                                        <div className="h-100" style={{ width: `${progressPercent}%`, background: style.gradient, transition: isDragging ? 'none' : 'width 0.4s ease', boxShadow: `0 0 20px ${style.color}30` }} />
                                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                            <span className="fw-bold" style={{ fontSize: '0.85rem', pointerEvents: 'none', color: '#2C3E50' }}>
                                                Drag to set progress
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {isCompleted && (
                                    <div className="rounded-pill overflow-hidden" style={{ width: '100%', height: '48px', background: '#FFF8DE', border: `2px solid ${style.color}` }}>
                                        <div className="h-100 d-flex align-items-center justify-content-center" style={{ width: '100%', background: style.gradient }}>
                                            <span className="fw-bold" style={{ fontSize: '0.85rem', color: '#fff' }}>Completed!</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        {!isCompleted ? (
                            <button onClick={hasGoal ? handleInputSubmit : handleCheckClick} disabled={hasGoal && currentValue === 0} className="btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 py-3" style={{ background: style.gradient, color: '#fff', border: 'none', fontSize: '1rem', fontWeight: '700', boxShadow: `0 6px 20px ${style.color}30`, transition: 'all 0.3s ease', opacity: (hasGoal && currentValue === 0) ? 0.5 : 1 }}>
                                <FaCheck size={18} />
                                <span>Complete Habit</span>
                            </button>
                        ) : (
                            <button onClick={handleCheckClick} className="btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 py-3" style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)', color: '#fff', border: 'none', fontSize: '1rem', fontWeight: '700', boxShadow: '0 6px 20px rgba(148,163,184,0.3)', transition: 'all 0.3s ease' }}>
                                <FaCheck size={18} />
                                <span>Mark Incomplete</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
