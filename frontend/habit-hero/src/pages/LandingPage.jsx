import React from 'react';
import { useNavigate } from 'react-router-dom';
import landingHero from '../assets/landing-hero.jpg';
import { FaLeaf, FaArrowRight, FaCheckCircle, FaShieldAlt, FaBolt } from 'react-icons/fa';
import { BiSpa } from 'react-icons/bi';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8CA9FF 100%)' }}>
            {/* Animated Background */}
            <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 0, pointerEvents: 'none' }}>
                <div className="position-absolute rounded-circle" style={{ width: '500px', height: '500px', background: '#FFF2C6', opacity: 0.3, top: '-100px', right: '-50px', filter: 'blur(80px)', animation: 'float 6s ease-in-out infinite' }} />
                <div className="position-absolute rounded-circle" style={{ width: '400px', height: '400px', background: '#AAC4F5', opacity: 0.4, bottom: '-100px', left: '-50px', filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite reverse' }} />
            </div>

            <nav className="navbar navbar-expand-lg py-4 position-relative" style={{ zIndex: 10 }}>
                <div className="container">
                    <a className="navbar-brand fw-bold fs-3 d-flex align-items-center gap-2 text-white" href="#">
                        <FaLeaf /> Habit<span style={{ fontWeight: 300 }}>Hero</span>
                    </a>
                    <div>
                        <button className="btn btn-light fw-semibold px-4 py-2 rounded-pill" onClick={() => navigate('/login')} style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                            Log In
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-grow-1 d-flex align-items-center position-relative" style={{ zIndex: 10 }}>
                <div className="container">
                    <div className="row justify-content-center">
                        {/* Content */}
                        <div className="col-lg-8 text-center">
                            <div className="d-inline-flex align-items-center gap-2 mb-4 px-4 py-2 rounded-pill fw-semibold small" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}>
                                <BiSpa /> Your Daily Growth Partner
                            </div>
                            <h1 className="display-2 fw-bold mb-4" style={{ lineHeight: 1.1, color: 'white', textShadow: '0 2px 20px rgba(0,0,0,0.1)' }}>
                                Build Habits That <span style={{ fontWeight: 300 }}>Last Forever</span>
                            </h1>
                            <p className="lead mb-5 mx-auto" style={{ maxWidth: '600px', color: 'rgba(255,255,255,0.9)', fontSize: '1.15rem' }}>
                                Transform your life one habit at a time. Track, analyze, and achieve your goals with our beautiful and intuitive platform.
                            </p>

                            <div className="d-flex gap-3 justify-content-center">
                                <button onClick={() => navigate('/signup')} className="btn btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center gap-2" style={{ fontSize: '1.1rem', background: 'white', color: '#667eea', border: 'none' }}>
                                    Get Started Free <FaArrowRight size={16} />
                                </button>
                            </div>

                            <div className="mt-5 d-flex align-items-center justify-content-center gap-4 small fw-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <FaCheckCircle />
                                    No Credit Card
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <FaShieldAlt />
                                    Privacy First
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <FaBolt />
                                    Instant Setup
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-4 text-center small position-relative" style={{ zIndex: 10, color: 'rgba(255,255,255,0.7)' }}>
                <div className="container">
                    &copy; {new Date().getFullYear()} HabitHero. All rights reserved.
                </div>
            </footer>

            <style>
                {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .btn:hover {
             transform: translateY(-3px) !important;
             box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
          }
        `}
            </style>
        </div>
    );
};

export default LandingPage;
