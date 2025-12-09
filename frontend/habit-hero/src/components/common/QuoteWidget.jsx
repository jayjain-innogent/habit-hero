import React, { useMemo } from "react";
import { QUOTES } from "../../data/quotes";

export default function QuoteWidget() {
    const quote = useMemo(() => {
        // Simple random selection on every refresh
        const index = Math.floor(Math.random() * QUOTES.length);
        return QUOTES[index];
    }, []);

    return (
        <div className="card border-0 shadow-sm mb-4 text-white overflow-hidden position-relative"
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Decorative background elements */}
            <div className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
                    pointerEvents: 'none'
                }}
            />
            <div className="position-absolute"
                style={{
                    top: '-10px',
                    right: '20px',
                    fontSize: '120px',
                    opacity: '0.15',
                    fontFamily: 'serif',
                    lineHeight: '1',
                    pointerEvents: 'none'
                }}>
                "
            </div>

            <div className="card-body p-4 position-relative d-flex flex-column align-items-center text-center">
                <h6 className="text-uppercase tracking-wider opacity-75 mb-3 fw-bold"
                    style={{ letterSpacing: '2px', fontSize: '0.7rem' }}>
                    Quote of the Day
                </h6>
                <figure className="mb-0 w-100" style={{ maxWidth: '600px' }}>
                    <blockquote className="blockquote mb-3">
                        <p className="fs-4 fw-light fst-italic mb-0" style={{ lineHeight: '1.6' }}>
                            "{quote.text}"
                        </p>
                    </blockquote>
                    <figcaption className="blockquote-footer text-white opacity-75 mb-0 mt-3 fs-6">
                        <cite title="Source Title" className="fw-semibold font-monospace">
                            — {quote.author}
                        </cite>
                    </figcaption>
                </figure>
            </div>
        </div>
    );
}
