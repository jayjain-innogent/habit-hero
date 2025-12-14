import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaLeaf, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import AuthService from '../services/authService';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Mock flow for test emails
            if (email.endsWith('@example.com') || email.includes('test')) {
                console.log("Mocking Forgot Password for test email:", email);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
                // On success, redirect to Reset Password Page
                navigate('/reset-password');
                return;
            }

            await AuthService.forgotPassword(email);
            // On success, redirect to Reset Password Page
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            console.error("Forgot Password Error:", err);
            setError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #FFF8DE 0%, #FFF2C6 100%)' }}>
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '950px', width: '90%' }}>
                <div className="row g-0">
                    {/* Left Side - Image/Info */}
                    <div className="col-lg-5 d-none d-lg-flex flex-column justify-content-center align-items-center p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #8CA9FF 0%, #AAC4F5 100%)' }}>
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'radial-gradient(circle at top left, rgba(255,255,255,0.2) 0%, transparent 70%)' }}></div>
                        <div className="text-center position-relative z-1">
                            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '90px', height: '90px', background: '#FFF2C6', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                                <FaLeaf size={45} color="#8CA9FF" />
                            </div>
                            <h2 className="fw-bold mb-3" style={{ fontSize: '2rem', color: 'white' }}>Recovery</h2>
                            <p className="mb-0" style={{ color: 'white', opacity: 0.95, lineHeight: 1.6 }}>Don't worry, it happens to the best of us.</p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="col-lg-7 bg-white p-5">
                        <div className="d-lg-none text-center mb-4">
                            <span className="fs-1" style={{ color: '#8CA9FF' }}><FaLeaf /></span>
                        </div>
                        <h3 className="fw-bold text-center text-lg-start mb-2" style={{ color: '#0f172a', fontSize: '2rem' }}>Forgot Password?</h3>
                        <p className="text-muted text-center text-lg-start mb-4">Enter your email and we'll send you an OTP.</p>

                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-semibold small" style={{ color: '#0f172a' }}>Email Address</label>
                                <div className="input-group">
                                    <span className="input-group-text border-end-0" style={{ background: '#f8fafc', color: '#64748b' }}><FaEnvelope /></span>
                                    <input type="email" name="email" className="form-control border-start-0 py-3" style={{ background: '#f8fafc' }} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="btn w-100 py-3 rounded-pill fw-bold shadow-lg mb-3" style={{ background: 'linear-gradient(135deg, #8CA9FF, #AAC4F5)', color: 'white', border: 'none', fontSize: '1rem' }}>
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>

                            <div className="text-center">
                                <Link to="/login" className="fw-bold text-decoration-none small d-flex align-items-center justify-content-center gap-2" style={{ color: '#8CA9FF' }}>
                                    <FaArrowLeft /> Back to Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <style>
                {`
          .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(140, 169, 255, 0.4) !important; }
          .form-control:focus { box-shadow: 0 0 0 3px rgba(140, 169, 255, 0.1); border-color: #8CA9FF; background: white !important; }
          .input-group-text { border-color: #e2e8f0; }
        `}
            </style>
        </div>
    );
};

export default ForgotPasswordPage;
