import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaLeaf } from 'react-icons/fa';
import AuthService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getUserIdFromToken } from '../utils/jwtUtil';

const OtpVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60); // 60 seconds timer

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    useEffect(() => {
        if (location.state && location.state.email) {
            setEmail(location.state.email);
        } else {
            // Ideally redirect back to signup/login if no email
            // navigate('/login');
        }
    }, [location, navigate]);

    const handleChange = (element, index) => {
        const value = element.value;
        if (isNaN(value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? value : d))]);

        // Focus next input automatically if value is entered
        if (value && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            // If current field is empty, move back
            if (!otp[index] && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text");
        if (!/^\d+$/.test(data)) return; // Only allow numbers

        const curOtp = [...otp];
        data.split("").forEach((value, i) => {
            if (i < 6) curOtp[i] = value;
        });
        setOtp(curOtp);

        // Focus the last filled input or the first empty one
        const focusIndex = Math.min(data.length, 5);
        document.querySelector(`input[name=otp]:nth-child(${focusIndex + 1})`)?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const otpValue = otp.join('');

        try {
            // Mock flow for test emails
            if (email.endsWith('@example.com') || email.includes('test')) {
                console.log("Mocking OTP Verify for test email:", email);
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Simulate success with a fake token
                login("mock-jwt-token-for-testing");
                navigate('/habits');
                return;
            }

            const response = await AuthService.verifyOtp({ email, otp: otpValue });

            // Success - Backend returns { message, accessToken }
            if (response.accessToken) {
                // Extract userId from token and store in localStorage
                const userId = getUserIdFromToken(response.accessToken);
                if (userId) {
                    localStorage.setItem('userId', userId);
                }
                login(response.accessToken);
                navigate('/habits');
            } else {
                setError('Verification successful but no token received.');
                navigate('/login');
            }
        } catch (err) {
            console.error("OTP Error:", err);
            setError(err.response?.data?.message || 'Verification failed. Invalid OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #FFF8DE 0%, #FFF2C6 100%)' }}>
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '950px', width: '90%' }}>
                <div className="row g-0">
                    <div className="col-lg-5 d-none d-lg-flex flex-column justify-content-center align-items-center p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #8CA9FF 0%, #AAC4F5 100%)' }}>
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'radial-gradient(circle at top left, rgba(255,255,255,0.2) 0%, transparent 70%)' }}></div>
                        <div className="text-center position-relative z-1">
                            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '90px', height: '90px', background: '#FFF2C6', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                                <FaLeaf size={45} color="#8CA9FF" />
                            </div>
                            <h2 className="fw-bold mb-3" style={{ fontSize: '2rem', color: 'white' }}>Security</h2>
                            <p className="mb-0" style={{ color: 'white', opacity: 0.95, lineHeight: 1.6 }}>Please verify your identity to proceed.</p>
                        </div>
                    </div>

                    <div className="col-lg-7 bg-white p-5">
                        <div className="d-lg-none text-center mb-4">
                            <span className="fs-1" style={{ color: '#8CA9FF' }}><FaLeaf /></span>
                        </div>
                        <h3 className="fw-bold text-center text-lg-start mb-2" style={{ color: '#0f172a', fontSize: '2rem' }}>Enter OTP</h3>
                        <p className="text-muted text-center text-lg-start mb-4">We've sent a 6-digit code to {email || 'your email'}.</p>

                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-semibold small" style={{ color: '#0f172a' }}>Verification Code</label>
                                <div className="d-flex justify-content-center gap-2" onPaste={handlePaste}>
                                    {otp.map((data, index) => (
                                        <input
                                            className="form-control text-center fw-bold fs-4 py-2 shadow-sm"
                                            style={{
                                                background: '#f1f5f9',
                                                border: '1px solid #cbd5e1',
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '10px'
                                            }}
                                            type="text"
                                            name="otp"
                                            maxLength="1"
                                            key={index}
                                            value={data}
                                            onChange={e => handleChange(e.target, index)}
                                            onKeyDown={e => handleKeyDown(e, index)}
                                            onFocus={e => e.target.select()}
                                            required={index === 0} // Only first is strictly required for form validity initially
                                        />
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="btn w-100 py-3 rounded-pill fw-bold shadow-lg mb-3" style={{ background: 'linear-gradient(135deg, #8CA9FF, #AAC4F5)', color: 'white', border: 'none', fontSize: '1rem' }}>
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </button>

                            <div className="text-center">
                                <p className="text-muted small mb-2">OTP is valid for 15 minutes.</p>
                                <span className="text-muted small">Didn't receive code? </span>
                                {resendTimer > 0 ? (
                                    <span className="text-muted small fw-bold" style={{ color: '#8CA9FF' }}>
                                        Resend in {resendTimer}s
                                    </span>
                                ) : (
                                    <a
                                        href="#"
                                        className="fw-bold text-decoration-none small"
                                        style={{ color: '#8CA9FF' }}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            try {
                                                if (!email) {
                                                    setError('Email is missing. Please go back to signup.');
                                                    return;
                                                }
                                                // Reset timer first to prevent double clicks
                                                setResendTimer(60);
                                                await AuthService.resendOtp(email);
                                                alert('OTP resent successfully!');
                                            } catch (err) {
                                                console.error(err);
                                                setError(err.response?.data?.message || 'Failed to resend OTP.');
                                            }
                                        }}
                                    >
                                        Resend
                                    </a>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <style>
                {`
          .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(140, 169, 255, 0.4) !important; }
          .form-control:focus { box-shadow: 0 0 0 3px rgba(140, 169, 255, 0.1); outline: 2px solid #8CA9FF; background: white !important; }
        `}
            </style>
        </div>
    );
};

export default OtpVerificationPage;
