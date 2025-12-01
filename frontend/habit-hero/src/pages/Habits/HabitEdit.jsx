import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HabitForm from "../../components/habits/HabitForm";
import { getHabitById, updateHabit, deleteHabit } from "../../api/habits";

export default function HabitEdit() {
    const { habitId } = useParams();
    const navigate = useNavigate();
    const userId = 1;

    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        load();
    }, [habitId]);

    const load = async () => {
        try {
            setLoading(true);
            const data = await getHabitById(userId, habitId);
            setInitialData(data);
        } catch (err) {
            setError("Failed to load habit");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (formData) => {
        try {
            setLoading(true);
            await updateHabit(userId, habitId, formData);
            window.forceReloadHabits = true;
            navigate("/habits");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update habit");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await deleteHabit(userId, habitId);
            window.forceReloadHabits = true;
            navigate("/habits");
        } catch (err) {
            setError("Failed to delete habit");
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
                        <h2 className="mb-1 fw-bold" style={{ color: '#212529' }}>Edit Habit</h2>
                        <p className="text-muted small mb-0">Update your habit details</p>
                    </div>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/habits")}
                        style={{ borderRadius: '10px' }}
                    >
                        ← Back
                    </button>
                </div>

                {loading && !initialData && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                        <p className="text-muted mt-2">Loading habit...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger shadow-sm" style={{ borderRadius: '12px' }}>
                        {error}
                    </div>
                )}

                {!loading && !initialData && (
                    <div className="alert alert-warning shadow-sm" style={{ borderRadius: '12px' }}>
                        Habit not found
                    </div>
                )}

                {initialData && (
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-10 col-xl-8">
                            <HabitForm
                                mode="edit"
                                initialData={initialData}
                                onSubmit={handleUpdate}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
