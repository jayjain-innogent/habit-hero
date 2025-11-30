import React from "react";

export default function ProgressRing({ progress = 0, size = 100, stroke = 10 }) {
    const normalizedRadius = (size - stroke) / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg height={size} width={size}>
            <circle
                stroke="#e6e6e6"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={size / 2}
                cy={size / 2}
            />

            <circle
                stroke="#3081faff"
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                r={normalizedRadius}
                cx={size / 2}
                cy={size / 2}
                style={{ transition: "stroke-dashoffset 0.35s " }}
            />

            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="18"
                fill="#1e3a8a"
                fontWeight="600"
            >
                {progress}%
            </text>
        </svg>
    );
}
