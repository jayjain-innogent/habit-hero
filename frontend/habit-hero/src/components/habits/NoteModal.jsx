import React, { useEffect, useState } from "react";
import { getNote, updateNote, deleteNote } from "../../api/habitLogs";

export default function NoteModal({ logId, userId, show, onClose, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [noteText, setNoteText] = useState("");

    useEffect(() => {
        if (show && logId) {
            loadNote();
        }
    }, [show, logId]);

    const loadNote = async () => {
        try {
            setLoading(true);
            const resp = await getNote(userId, logId);
            setNoteText(resp.note || "");
        } catch (err) {
            console.error("Failed to load note");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!noteText.trim()) {
            alert("Note cannot be empty");
            return;
        }

        try {
            setLoading(true);
            await updateNote(userId, logId, noteText.trim());
            if (onUpdated) onUpdated(noteText.trim());
            onClose();
        } catch (err) {
            console.error("Failed to save note");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await deleteNote(userId, logId);
            setNoteText("");
            if (onUpdated) onUpdated("");
            onClose();
        } catch (err) {
            console.error("Failed to delete note");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">

                <h5 className="mb-3 fw-bold">Habit Note</h5>

                <textarea
                    className="form-control"
                    rows={5}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write something..."
                    disabled={loading}
                />

                <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Close
                    </button>

                    <div className="d-flex gap-2">
                        {noteText && (
                            <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                                Delete
                            </button>
                        )}

                        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                            Save
                        </button>
                    </div>
                </div>

            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                }
                .modal-box {
                    background: white;
                    padding: 20px;
                    width: 90%;
                    max-width: 400px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
            `}</style>
        </div>
    );
}
