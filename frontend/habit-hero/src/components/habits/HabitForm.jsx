import React, { useEffect, useState } from "react";
import {
    CATEGORIES,
    CADENCE,
    GOAL_TYPE,
    VISIBILITY,
    STATUS
} from "../../data/enums";
import {
    Trash2,
    Sparkles,
    Target,
    Eye,
    Activity,
    FileText,
    Tag,
    Repeat,
    Zap,
    Plus,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import ConfirmationModal from "../common/ConfirmationModal";
import "./HabitForm.css";

export default function HabitForm({ mode = "create", initialData = {}, onSubmit, onDelete }) {
    const getTodayDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "FITNESS",
        cadence: "DAILY",
        sessionCount: "",
        goalType: "OFF",
        targetValue: null,
        unit: null,
        visibility: "PRIVATE",
        status: "ACTIVE",
        startDate: getTodayDate()
    });

    const [errors, setErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Get max session count based on cadence
    const getMaxSessionCount = (cadence) => {
        if (cadence === "WEEKLY") return 7;
        if (cadence === "MONTHLY") return 28;
        return 999;
    };

    // Get max target value based on goal type
    const getMaxTargetValue = (goalType) => {
        if (goalType === "DURATION") return 1440;
        return null;
    };

    useEffect(() => {
        if (mode === "edit" && initialData) {
            setForm({
                title: initialData.title || "",
                description: initialData.description || "",
                category: initialData.category || "FITNESS",
                cadence: initialData.cadence || "DAILY",
                sessionCount: initialData.sessionCount || "",
                goalType: initialData.goalType || "OFF",
                targetValue: initialData.targetValue ?? null,
                unit: initialData.unit || null,
                visibility: initialData.visibility || "PRIVATE",
                status: initialData.status || "ACTIVE",
                startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : ""
            });
        }
    }, [mode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        let updated = { ...form, [name]: value };

        if (name === "cadence" && value === "DAILY") {
            updated.sessionCount = null;
        }


        if (name === "goalType") {
            if (value === "OFF") {
                updated.targetValue = null;
                updated.unit = null;
            } else if (value === "DURATION") {
                updated.unit = "Minutes";
            } else if (value === "DISTANCE") {
                updated.unit = "Meters";
            } else if (value === "REPEATS") {
                updated.unit = "Reps";
            }
        }

        if (name === "targetValue" && Number(value) < 0) {
            updated.targetValue = 0;
        }

        setForm(updated);
    };

    // Prevent arrow up/down keyboard behavior on number inputs
    const handleNumberKeyDown = (e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!form.title.trim()) newErrors.title = "Title is required";
        if (!form.category) newErrors.category = "Category required";
        if (!form.cadence) newErrors.cadence = "Cadence required";
        if (!form.startDate) newErrors.startDate = "Start Date is required";

        // Past date validation removed to allow backdating
        if (form.goalType !== "OFF") {
            if (!form.targetValue || form.targetValue <= 0) {
                newErrors.targetValue = "Target value required";
            }
        }

        // Validate sessionCount only if not daily
        if (form.cadence !== "DAILY") {
            const sessionVal = Number(form.sessionCount);
            if (!form.sessionCount || sessionVal <= 0) {
                newErrors.sessionCount = "Enter a positive session count";
            } else {
                const maxSessions = getMaxSessionCount(form.cadence);
                if (sessionVal > maxSessions) {
                    newErrors.sessionCount = `Max ${maxSessions} sessions for ${form.cadence.toLowerCase()}`;
                }
            }
        }

        // Validate targetValue max limits
        if (form.goalType !== "OFF" && form.targetValue) {
            const targetVal = Number(form.targetValue);
            const maxTarget = getMaxTargetValue(form.goalType);
            if (maxTarget && targetVal > maxTarget) {
                newErrors.targetValue = `Max ${maxTarget} ${form.unit || 'units'}`;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = { ...form };

        // CLEANUP: backend DTO does not accept startDate for updates
        delete payload.startDate;

        if (payload.cadence === "DAILY") {
            payload.sessionCount = null;
        } else {
            // Ensure sessionCount is an Integer or null (not empty string)
            if (payload.sessionCount === "" || payload.sessionCount === undefined) {
                payload.sessionCount = null;
            } else {
                payload.sessionCount = parseInt(payload.sessionCount, 10);
            }
        }

        if (payload.goalType === "OFF") {
            payload.targetValue = null;
            payload.unit = null;
        }

        if (mode === "create") {
            delete payload.status;
            payload.startDate = form.startDate;
        } else {
            delete payload.startDate;
        }

        // Convert all enum values to uppercase for backend compatibility
        payload.category = payload.category?.toUpperCase();
        payload.cadence = payload.cadence?.toUpperCase();
        payload.goalType = payload.goalType?.toUpperCase();
        payload.visibility = payload.visibility?.toUpperCase();
        if (payload.status) {
            payload.status = payload.status.toUpperCase();
        }

        if (payload.unit) {
            if (payload.unit === "Reps") {
                payload.unit = "REPEATS";
            } else {
                payload.unit = payload.unit.toUpperCase();
            }
        }

        // Ensure targetValue is String as per DTO
        if (payload.targetValue !== null && payload.targetValue !== undefined) {
            payload.targetValue = String(payload.targetValue);
        }

        onSubmit(payload);
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (onDelete) {
            onDelete();
        }
        setShowDeleteModal(false);
    };

    // Helper to get category icon component
    const getCategoryIcon = (category) => {
        const iconProps = { size: 14, className: "habit-form-option-icon" };
        const icons = {
            FITNESS: <Dumbbell {...iconProps} />,
            HEALTH: <Heart {...iconProps} />,
            LEARNING: <BookOpen {...iconProps} />,
            PRODUCTIVITY: <Zap {...iconProps} />,
            MINDFULNESS: <Brain {...iconProps} />,
            SOCIAL: <Users {...iconProps} />,
            CREATIVE: <Palette {...iconProps} />,
            FINANCE: <Wallet {...iconProps} />,
            OTHER: <Star {...iconProps} />
        };
        return icons[category] || <Star {...iconProps} />;
    };

    return (
        <>
            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Habit?"
                message="Are you sure you want to delete this habit? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />

            <form onSubmit={handleSubmit} className="habit-form-container">
                {mode === 'edit' && (
                    <div className="habit-form-delete-area">
                        <button
                            type="button"
                            className="habit-form-delete-btn"
                            onClick={handleDeleteClick}
                        >
                            <Trash2 size={16} /> Delete Habit
                        </button>
                    </div>
                )}

                <div className="habit-form-grid">
                    {/* Title */}
                    <div className="habit-form-group">
                        <label className="habit-form-label">
                            <Sparkles size={16} className="habit-form-label-icon" />
                            Habit Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            className={`habit-form-input habit-form-input-lg ${errors.title ? "is-invalid" : ""}`}
                            placeholder="e.g. Read 10 pages daily"
                            value={form.title}
                            onChange={handleChange}
                        />
                        {errors.title && <div className="habit-form-error"><AlertCircle size={14} /> {errors.title}</div>}
                    </div>

                    {/* Description */}
                    <div className="habit-form-group">
                        <label className="habit-form-label">
                            <FileText size={16} className="habit-form-label-icon" />
                            Description (Optional)
                        </label>
                        <textarea
                            name="description"
                            className="habit-form-textarea"
                            rows={2}
                            placeholder="Add some details about your habit..."
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Category & Frequency Row */}
                    <div className="habit-form-row">
                        <div className="habit-form-group">
                            <label className="habit-form-label">
                                <Tag size={16} className="habit-form-label-icon" />
                                Category
                            </label>
                            <select
                                name="category"
                                className={`habit-form-select ${errors.category ? "is-invalid" : ""}`}
                                value={form.category}
                                onChange={handleChange}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="habit-form-group">
                            <label className="habit-form-label">
                                <Repeat size={16} className="habit-form-label-icon" />
                                Frequency
                            </label>
                            <select
                                name="cadence"
                                className={`habit-form-select ${errors.cadence ? "is-invalid" : ""}`}
                                value={form.cadence}
                                onChange={handleChange}
                            >
                                {CADENCE.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Sessions Per Period (Conditional) */}
                    {form.cadence !== "DAILY" && (
                        <div className="habit-form-group habit-form-animated-section">
                            <label className="habit-form-label">
                                <Activity size={16} className="habit-form-label-icon" />
                                Sessions Per Period
                            </label>
                            <input
                                type="number"
                                name="sessionCount"
                                className={`habit-form-input ${errors.sessionCount ? "is-invalid" : ""}`}
                                placeholder="Enter session count"
                                max={getMaxSessionCount(form.cadence)}
                                min="1"
                                value={form.sessionCount || ""}
                                onChange={handleChange}
                                onKeyDown={handleNumberKeyDown}
                            />
                            {errors.sessionCount && <div className="habit-form-error"><AlertCircle size={14} /> {errors.sessionCount}</div>}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="habit-form-divider"></div>

                    {/* Goal Section Title */}
                    <div className="habit-form-section-title">
                        <Target size={16} />
                        <span>Goal Settings</span>
                    </div>

                    {/* Goal Type */}
                    <div className="habit-form-group">
                        <label className="habit-form-label">
                            <Target size={16} className="habit-form-label-icon" />
                            Goal Type
                        </label>
                        <select
                            name="goalType"
                            className="habit-form-select"
                            value={form.goalType}
                            onChange={handleChange}
                        >
                            {GOAL_TYPE.map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>

                    {/* Target Value (Conditional) */}
                    {form.goalType !== "OFF" && (
                        <div className="habit-form-group habit-form-animated-section">
                            <label className="habit-form-label">
                                <Zap size={16} className="habit-form-label-icon" />
                                Target Value
                            </label>
                            <div className="habit-form-input-group">
                                <input
                                    type="number"
                                    name="targetValue"
                                    className={`habit-form-input ${errors.targetValue ? "is-invalid" : ""}`}
                                    placeholder="Enter target value"
                                    max={getMaxTargetValue(form.goalType) || undefined}
                                    min="1"
                                    value={form.targetValue ?? ""}
                                    onChange={handleChange}
                                    onKeyDown={handleNumberKeyDown}
                                />
                                <span className="habit-form-input-unit">
                                    {form.unit || "Units"}
                                </span>
                            </div>
                            {errors.targetValue && <div className="habit-form-error"><AlertCircle size={14} /> {errors.targetValue}</div>}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="habit-form-divider"></div>

                    {/* Visibility Section */}
                    <div className="habit-form-row">
                        <div className="habit-form-group">
                            <label className="habit-form-label">
                                <Eye size={16} className="habit-form-label-icon" />
                                Visibility
                            </label>
                            <select
                                name="visibility"
                                className="habit-form-select"
                                value={form.visibility}
                                onChange={handleChange}
                            >
                                {VISIBILITY.map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        </div>

                        {mode === "edit" && (
                            <div className="habit-form-group habit-form-animated-section">
                                <label className="habit-form-label">
                                    <Activity size={16} className="habit-form-label-icon" />
                                    Status
                                </label>
                                <select
                                    name="status"
                                    className="habit-form-select"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    {STATUS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <button type="submit" className="habit-form-submit">
                    {mode === "create" ? (
                        <>
                            <Plus size={18} className="habit-form-submit-icon" />
                            Create Habit
                        </>
                    ) : (
                        <>
                            <RefreshCw size={18} className="habit-form-submit-icon" />
                            Update Habit
                        </>
                    )}
                </button>
            </form>
        </>
    );
}
