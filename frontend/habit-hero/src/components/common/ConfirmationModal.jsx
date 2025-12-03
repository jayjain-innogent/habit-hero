import React from 'react';

export default function ConfirmationModal({
    show,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    variant = "danger"
}) {
    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
            <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header border-bottom-0">
                            <h5 className="modal-title fw-bold">{title}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body py-0 text-secondary">
                            {message}
                        </div>
                        <div className="modal-footer border-top-0">
                            <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={`btn btn-${variant} rounded-pill px-4`}
                                onClick={onConfirm}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}