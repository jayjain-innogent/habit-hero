import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaLeaf, FaEnvelope, FaLock, FaQuoteLeft } from 'react-icons/fa';
import AuthService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getUserIdFromToken } from '../utils/jwtUtil';

const motivationalQuotes = [
    { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { quote: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { quote: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
    { quote: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" }
];

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        setCurrentQuote(motivationalQuotes[randomIndex]);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await AuthService.login(formData);
            if (response.accessToken) {
                // Extract userId from token and store in localStorage
                const userId = getUserIdFromToken(response.accessToken);
                if (userId) {
                    localStorage.setItem('userId', userId);
                }
                login(response.accessToken);
                navigate('/habits');
            } else {
                setError('Login failed. No token received.');
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8CA9FF 100%)' }}>
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '950px', width: '90%' }}>
                <div className="row g-0">
                    {/* Left Side - Motivational Quote */}
                    <div className="col-lg-5 d-none d-lg-flex flex-column justify-content-center align-items-center p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'radial-gradient(circle at top left, rgba(255,255,255,0.15) 0%, transparent 70%)' }}></div>
                        <div className="text-center position-relative z-1">
                            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '70px', height: '70px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                                <FaQuoteLeft size={30} color="white" />
                            </div>
                            <p className="mb-4" style={{ color: 'white', fontSize: '1.3rem', fontStyle: 'italic', lineHeight: 1.7, fontWeight: 300 }}>"{currentQuote.quote}"</p>
                            <p className="mb-0 fw-semibold" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>— {currentQuote.author}</p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="col-lg-7 bg-white p-5">
                        <div className="d-lg-none text-center mb-4">
                            <span className="fs-1" style={{ color: '#667eea' }}><FaLeaf /></span>
                        </div>
                        <h3 className="fw-bold text-center text-lg-start mb-2" style={{ color: '#0f172a', fontSize: '2rem' }}>Sign In</h3>
                        <p className="text-muted text-center text-lg-start mb-4">Welcome back! Please enter your details</p>

                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-semibold small" style={{ color: '#0f172a' }}>Email Address</label>
                                <div className="input-group">
                                    <span className="input-group-text border-end-0" style={{ background: '#f8fafc', color: '#64748b' }}><FaEnvelope /></span>
                                    <input type="email" name="email" className="form-control border-start-0 py-3" style={{ background: '#f8fafc' }} placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between">
                                    <label className="form-label fw-semibold small" style={{ color: '#0f172a' }}>Password</label>
                                    <Link to="/forgot-password" className="text-decoration-none small fw-semibold" style={{ color: '#667eea' }}>Forgot?</Link>
                                </div>
                                <div className="input-group">
                                    <span className="input-group-text border-end-0" style={{ background: '#f8fafc', color: '#64748b' }}><FaLock /></span>
                                    <input type="password" name="password" className="form-control border-start-0 py-3" style={{ background: '#f8fafc' }} placeholder="Enter your password" value={formData.password} onChange={handleChange} required />
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="btn w-100 py-3 rounded-pill fw-bold shadow-lg mb-3" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', fontSize: '1rem' }}>
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>

                            <div className="text-center">
                                <span className="text-muted small">Don't have an account? </span>
                                <Link to="/signup" className="fw-bold text-decoration-none small" style={{ color: '#667eea' }}>
                                    Sign Up
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <style>
                {`
          .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4) !important; }
          .form-control:focus { box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); border-color: #667eea; background: white !important; }
          .input-group-text { border-color: #e2e8f0; }
        `}
            </style>
        </div>
    );
};

export default LoginPage;
