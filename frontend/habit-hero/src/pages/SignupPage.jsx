import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaLeaf, FaUser, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import AuthService from '../services/authService';

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', username: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Mock flow for test emails
            if (formData.email.endsWith('@example.com') || formData.email.includes('test')) {
                console.log("Mocking Signup for test email:", formData.email);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
                navigate('/verify-otp', { state: { email: formData.email } });
                return;
            }

            // Need username for backend, using email prefix if not provided or adding a field
            // For now, let's assume UI needs to capture it or we generate it. 
            // The SPEC requires username in JSON: "username": "user123"
            // So I will add a username field to the form or auto-generate. 
            // Adding a username field is safer.

            await AuthService.register(formData);
            // On success, redirect to Verify OTP
            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            console.error("Signup Error:", err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #FFF8DE 0%, #FFF2C6 100%)' }}>
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '950px', width: '90%' }}>
                <div className="row g-0">
                    {/* Left Side - Form */}
                    <div className="col-lg-7 bg-white p-5">
                        <div className="d-lg-none text-center mb-4">
                            <span className="fs-1" style={{ color: '#8CA9FF' }}><FaLeaf /></span>
                        </div>
                        <h3 className="fw-bold text-center text-lg-start mb-2" style={{ color: '#0f172a', fontSize: '2rem' }}>Create Account</h3>
                        <p className="text-muted text-center text-lg-start mb-4">Start your journey to better habits today</p>

                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold small" style={{ color: '#0f172a' }}>Full Name</label>
                                <div className="input-group">
                                    <span className="input-group-text border-end-0" style={{ background: '#f8fafc', color: '#64748b' }}><FaUser /></span>
                                    <input type="text" name="name" className="form-control border-start-0 py-3" style={{ background: '#f8fafc' }} placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold small" style={{ color: '#0f172a' }}>Username</label>
                                <div className="input-group">
                                    <span className="input-group-text border-end-0" style={{ background: '#f8fafc', color: '#64748b' }}><FaUser /></span>
                                    <input type="text" name="username" className="form-control border-start-0 py-3" style={{ background: '#f8fafc' }} placeholder="johndoe123" value={formData.username} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold small" style={{ color: '#0f172a' }}>Email Address</label>
                                <div className="input-group">
                                    <span className="input-group-text border-end-0" style={{ background: '#f8fafc', color: '#64748b' }}><FaEnvelope /></span>
                                    <input type="email" name="email" className="form-control border-start-0 py-3" style={{ background: '#f8fafc' }} placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold small" style={{ color: '#0f172a' }}>Password</label>
                                <div className="input-group">
                                    <span className="input-group-text border-end-0" style={{ background: '#f8fafc', color: '#64748b' }}><FaLock /></span>
                                    <input type="password" name="password" className="form-control border-start-0 py-3" style={{ background: '#f8fafc' }} placeholder="Create a password" value={formData.password} onChange={handleChange} required />
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="btn w-100 py-3 rounded-pill fw-bold shadow-lg mb-3" style={{ background: 'linear-gradient(135deg, #8CA9FF, #AAC4F5)', color: 'white', border: 'none', fontSize: '1rem' }}>
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </button>

                            <div className="text-center">
                                <span className="text-muted small">Already have an account? </span>
                                <Link to="/login" className="fw-bold text-decoration-none small" style={{ color: '#8CA9FF' }}>
                                    Sign In
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Right Side - Image/Info */}
                    <div className="col-lg-5 d-none d-lg-flex flex-column justify-content-center align-items-center p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #AAC4F5 0%, #8CA9FF 100%)' }}>
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'radial-gradient(circle at bottom right, rgba(255,255,255,0.2) 0%, transparent 70%)' }}></div>
                        <div className="text-center position-relative z-1">
                            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '90px', height: '90px', background: '#FFF2C6', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                                <FaLeaf size={45} color="#8CA9FF" />
                            </div>
                            <h2 className="fw-bold mb-3" style={{ fontSize: '2rem', color: 'white' }}>Hello, Friend!</h2>
                            <p className="mb-0" style={{ color: 'white', opacity: 0.95, lineHeight: 1.6 }}>Enter your details and start your journey towards building better habits</p>
                        </div>
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

export default SignupPage;
