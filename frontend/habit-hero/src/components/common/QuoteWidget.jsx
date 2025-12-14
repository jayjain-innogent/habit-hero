import React, { useMemo } from "react";
import { QUOTES } from "../../data/quotes";

export default function QuoteWidget() {
    const quote = useMemo(() => {
        // Simple random selection on every refresh
        const index = Math.floor(Math.random() * QUOTES.length);
        return QUOTES[index];
    }, []);

    return (
        <div className="card border-0 shadow-lg mb-4 text-white overflow-hidden position-relative" style={{ background: 'linear-gradient(135deg, #8CA9FF 0%, #AAC4F5 100%)', borderRadius: '20px', border: '3px solid #FFF2C6', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(140,169,255,0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(140,169,255,0.2)'; }}>
            {/* Decorative background elements */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div className="position-absolute" style={{ top: '-20px', right: '30px', fontSize: '150px', opacity: '0.1', fontFamily: 'Georgia, serif', lineHeight: '1', pointerEvents: 'none' }}>
                “
            </div>

            <div className="card-body p-5 position-relative d-flex flex-column align-items-center text-center">
                <h6 className="text-uppercase mb-4 fw-bold" style={{ letterSpacing: '2.5px', fontSize: '0.65rem', opacity: 0.9 }}>
                    ✨ Quote of the Day
                </h6>
                <figure className="mb-0 w-100" style={{ maxWidth: '550px' }}>
                    <blockquote className="blockquote mb-3">
                        <p className="fs-5 fw-normal mb-0" style={{ lineHeight: '1.7', fontStyle: 'italic' }}>
                            “{quote.text}”
                        </p>
                    </blockquote>
                    <figcaption className="blockquote-footer text-white mb-0 mt-4" style={{ opacity: 0.9, fontSize: '0.95rem' }}>
                        <cite title="Source Title" className="fw-semibold">
                            — {quote.author}
                        </cite>
                    </figcaption>
                </figure>
            </div>
        </div>
    );
}
