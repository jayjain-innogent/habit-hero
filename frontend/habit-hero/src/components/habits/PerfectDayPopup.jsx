import React, { useEffect, useState } from 'react';
import { FaTrophy, FaStar } from 'react-icons/fa';
import './PerfectDayPopup.css';

export default function PerfectDayPopup({ show, onClose }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!visible) return null;

    return (
        <div className="perfect-day-overlay">
            <div className="perfect-day-popup">
                <div className="confetti-container">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className={`confetti confetti-${i % 5}`} />
                    ))}
                </div>
                <div className="trophy-icon">
                    <FaTrophy />
                </div>
                <h2 className="perfect-title">Perfect Day!</h2>
                <p className="perfect-message">You completed all your habits today!</p>
                <div className="stars-row">
                    <FaStar className="star star-1" />
                    <FaStar className="star star-2" />
                    <FaStar className="star star-3" />
                </div>
            </div>
        </div>
    );
}
