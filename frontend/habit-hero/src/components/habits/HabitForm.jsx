import React, { useEffect, useState, useCallback } from "react";
import {
    CATEGORIES,
    CADENCE,
    GOAL_TYPE,
    GOAL_UNIT,
    VISIBILITY,
    STATUS
} from "../../data/enums";
import ConfirmationModal from "../common/ConfirmationModal";

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

        if (name === "targetValue" && value < 0) {
            updated.targetValue = 0;
        }

        setForm(updated);
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
        if (form.cadence !== "DAILY" && (!form.sessionCount || form.sessionCount <= 0)) {
            newErrors.sessionCount = "Enter a positive session count";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = { ...form };

        if (payload.cadence === "DAILY") {
            payload.sessionCount = null;
        }

        if (payload.goalType === "OFF") {
            delete payload.targetValue;
            delete payload.unit;
        }

        if (mode === "create") {
            delete payload.status;
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

    const isStartDateEditable = () => {
        // ALWAYS allow editing start date
        return true;
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

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 bg-white">
                {mode === 'edit' && (
                    <div className="d-flex justify-content-end mb-3">
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleDeleteClick}
                        >
                            <i className="bi bi-trash me-1"></i> Delete Habit
                        </button>
                    </div>
                )}

                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label fw-semibold text-secondary small">TITLE</label>
                        <input
                            type="text"
                            name="title"
                            className={`form-control form-control-lg ${errors.title ? "is-invalid" : ""}`}
                            placeholder="e.g. Read 10 pages"
                            value={form.title}
                            onChange={handleChange}
                        />
                        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-semibold text-secondary small">DESCRIPTION (OPTIONAL)</label>
                        <textarea
                            name="description"
                            className="form-control"
                            rows={2}
                            placeholder="Add details..."
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">CATEGORY</label>
                        <select
                            name="category"
                            className={`form-select ${errors.category ? "is-invalid" : ""}`}
                            value={form.category}
                            onChange={handleChange}
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">FREQUENCY</label>
                        <select
                            name="cadence"
                            className={`form-select ${errors.cadence ? "is-invalid" : ""}`}
                            value={form.cadence}
                            onChange={handleChange}
                        >
                            {CADENCE.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">START DATE</label>
                        <input
                            type="date"
                            name="startDate"
                            className={`form-control ${errors.startDate ? "is-invalid" : ""}`}
                            value={form.startDate}
                            onChange={handleChange}
                            disabled={!isStartDateEditable()}
                        />
                        {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
                        {!isStartDateEditable() && <div className="form-text text-muted">Start date cannot be changed after the habit has started.</div>}
                    </div>

                    {form.cadence !== "DAILY" && (
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-secondary small">SESSIONS PER PERIOD</label>
                            <input
                                type="number"
                                name="sessionCount"
                                className={`form-control ${errors.sessionCount ? "is-invalid" : ""}`}
                                value={form.sessionCount || ""}
                                onChange={handleChange}
                            />
                            {errors.sessionCount && <div className="invalid-feedback">{errors.sessionCount}</div>}
                        </div>
                    )}

                    <div className="col-12"><hr className="text-muted opacity-25" /></div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">GOAL TYPE</label>
                        <select
                            name="goalType"
                            className="form-select"
                            value={form.goalType}
                            onChange={handleChange}
                        >
                            {GOAL_TYPE.map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>

                    {form.goalType !== "OFF" && (
                        <>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold text-secondary small">TARGET VALUE</label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        name="targetValue"
                                        className={`form-control ${errors.targetValue ? "is-invalid" : ""}`}
                                        value={form.targetValue ?? ""}
                                        onChange={handleChange}
                                    />
                                    <span className="input-group-text bg-light text-muted">
                                        {form.unit || "Units"}
                                    </span>
                                </div>
                                {errors.targetValue && <div className="invalid-feedback d-block">{errors.targetValue}</div>}
                            </div>
                        </>
                    )}

                    <div className="col-12"><hr className="text-muted opacity-25" /></div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">VISIBILITY</label>
                        <select
                            name="visibility"
                            className="form-select"
                            value={form.visibility}
                            onChange={handleChange}
                        >
                            {VISIBILITY.map((v) => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>

                    {mode === "edit" && (
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-secondary small">STATUS</label>
                            <select
                                name="status"
                                className="form-select"
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

                <button className="btn btn-primary mt-3 w-100">
                    {mode === "create" ? "Create Habit" : "Update Habit"}
                </button>
            </form>
        </>
    );
}
