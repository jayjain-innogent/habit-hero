import React, { useState } from "react";
import HabitForm from "../../components/habits/HabitForm";
import { createHabit } from "../../api/habits";
import { useNavigate } from "react-router-dom";

export default function HabitCreate() {
    const navigate = useNavigate();
    const userId = 1;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async (formData) => {
        try {
            setLoading(true);
            setError("");

            await createHabit(userId, formData);

            navigate("/habits");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create habit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            paddingBottom: '40px'
        }}>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div>
                        <h2 className="mb-1 fw-bold" style={{ color: '#212529' }}>Create New Habit</h2>
                        <p className="text-muted small mb-0">Set up a new habit to track</p>
                    </div>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/habits")}
                        style={{ borderRadius: '10px' }}
                    >
                        ← Back
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger shadow-sm" role="alert" style={{ borderRadius: '12px' }}>
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Creating...</span>
                        </div>
                        <p className="text-muted mt-2">Creating your habit...</p>
                    </div>
                )}

                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10 col-xl-8">
                        <HabitForm mode="create" onSubmit={handleCreate} />
                    </div>
                </div>
            </div>
        </div>
    );
}

