import React from 'react';
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

const ConfirmationModal = ({ show, onClose, onConfirm, title, message, confirmText = "Confirm", variant = "primary" }) => {
    if (!show) return null;

    const getIcon = () => {
        if (variant === "danger") {
            return <Trash2 size={32} style={{ color: '#ef4444' }} />;
        }
        return <AlertCircle size={32} style={{ color: '#6366F1' }} />;
    };

    return (
        <div 
            className="modal show d-flex align-items-center justify-content-center" 
            style={{ 
                display: 'flex !important',
                backgroundColor: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                zIndex: 1050,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }} 
            tabIndex="-1"
            onClick={onClose}
        >
            <div 
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '400px', margin: 'auto' }}
            >
                <div 
                    className="modal-content"
                    style={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                        animation: 'slideInModal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                >
                    {/* Icon and Header Section */}
                    <div 
                        style={{
                            padding: '32px 24px 20px',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderBottom: '1px solid #e2e8f0'
                        }}
                    >
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                            {getIcon()}
                        </div>
                        <h5 
                            className="modal-title fw-bold"
                            style={{ 
                                fontSize: '20px',
                                color: '#1e293b',
                                margin: 0
                            }}
                        >
                            {title}
                        </h5>
                    </div>

                    {/* Message Section */}
                    <div 
                        className="modal-body"
                        style={{
                            padding: '24px',
                            color: '#64748b',
                            fontSize: '15px',
                            lineHeight: '1.6',
                            textAlign: 'center'
                        }}
                    >
                        <p style={{ margin: 0 }}>{message}</p>
                    </div>

                    {/* Button Section */}
                    <div 
                        style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '20px 24px',
                            background: '#f8fafc',
                            borderTop: '1px solid #e2e8f0'
                        }}
                    >
                        <button 
                            type="button" 
                            className="btn flex-fill"
                            onClick={onClose}
                            style={{
                                background: '#ffffff',
                                border: '2px solid #e2e8f0',
                                color: '#475569',
                                borderRadius: '10px',
                                fontWeight: '600',
                                padding: '10px 20px',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#f1f5f9';
                                e.target.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#ffffff';
                                e.target.style.borderColor = '#e2e8f0';
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn flex-fill"
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            style={{
                                background: variant === 'danger' 
                                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                                    : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                padding: '10px 20px',
                                fontSize: '14px',
                                color: 'white',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                boxShadow: variant === 'danger'
                                    ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                                    : '0 4px 12px rgba(99, 102, 241, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = variant === 'danger'
                                    ? '0 8px 20px rgba(239, 68, 68, 0.5)'
                                    : '0 8px 20px rgba(99, 102, 241, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = variant === 'danger'
                                    ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                                    : '0 4px 12px rgba(99, 102, 241, 0.4)';
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes slideInModal {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default ConfirmationModal;
