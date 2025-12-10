import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaLeaf, FaKey } from 'react-icons/fa';

const OtpVerificationPage = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("OTP Value:", otp.join(''));
        // Mock verification -> Login
        navigate('/habits');
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
                            <h2 className="fw-bold mb-3" style={{ fontSize: '2rem', color: 'white' }}>Security</h2>
                            <p className="mb-0" style={{ color: 'white', opacity: 0.95, lineHeight: 1.6 }}>Please verify your identity to proceed.</p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="col-lg-7 bg-white p-5">
                        <div className="d-lg-none text-center mb-4">
                            <span className="fs-1" style={{ color: '#8CA9FF' }}><FaLeaf /></span>
                        </div>
                        <h3 className="fw-bold text-center text-lg-start mb-2" style={{ color: '#0f172a', fontSize: '2rem' }}>Enter OTP</h3>
                        <p className="text-muted text-center text-lg-start mb-4">We've sent a 6-digit code to your email.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-semibold small" style={{ color: '#0f172a' }}>Verification Code</label>
                                <div className="d-flex justify-content-between gap-2">
                                    {otp.map((data, index) => (
                                        <input
                                            className="form-control text-center fw-bold fs-4 py-3 border-0"
                                            style={{ background: '#f8fafc', aspectRatio: '1/1' }}
                                            type="text"
                                            name="otp"
                                            maxLength="1"
                                            key={index}
                                            value={data}
                                            onChange={e => handleChange(e.target, index)}
                                            onFocus={e => e.target.select()}
                                            required
                                        />
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn w-100 py-3 rounded-pill fw-bold shadow-lg mb-3" style={{ background: 'linear-gradient(135deg, #8CA9FF, #AAC4F5)', color: 'white', border: 'none', fontSize: '1rem' }}>
                                Verify
                            </button>

                            <div className="text-center">
                                <span className="text-muted small">Didn't receive code? </span>
                                <a href="#" className="fw-bold text-decoration-none small" style={{ color: '#8CA9FF' }}>
                                    Resend
                                </a>
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
