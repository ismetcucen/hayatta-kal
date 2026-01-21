import React from 'react';

export default function HumanBody({ riskLevel }) {
    // Risk level determines the color logic
    // 0-20: Green/White (Safe)
    // 20-50: Yellow/Orange (Warning)
    // 50-80: Red (Critical)
    // 80-100: Dark Red/Black (Fail)

    const getColor = () => {
        if (riskLevel >= 80) return "#7f1d1d"; // Dark Red
        if (riskLevel >= 50) return "#ef4444"; // Red
        if (riskLevel >= 20) return "#f59e0b"; // Orange
        return "#10b981"; // Green/Safe
    };

    const getStatusText = () => {
        if (riskLevel >= 90) return "HAYATİ TEHLİKE!";
        if (riskLevel >= 50) return "CİDDİ YARALANMA";
        if (riskLevel >= 20) return "RİSKLİ DURUM";
        return "GÜVENDE";
    };

    return (
        <div className="flex flex-col items-center justify-center h-full relative">
            {/* Status Label */}
            <div
                className="absolute top-4 px-4 py-2 rounded-full font-bold text-white shadow-lg transition-colors duration-500"
                style={{ backgroundColor: getColor() }}
            >
                {getStatusText()} (%{riskLevel} Risk)
            </div>

            {/* Simple Human Body Silhouette (SVG) */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 200"
                className="h-3/4 max-h-[500px] w-auto drop-shadow-2xl transition-all duration-1000 ease-in-out"
            >
                {/* Glow Effect based on risk */}
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Body Path */}
                <g fill={getColor()} className="transition-colors duration-1000">
                    {/* Head */}
                    <circle cx="50" cy="25" r="15" />
                    {/* Neck */}
                    <rect x="42" y="40" width="16" height="10" />
                    {/* Torso */}
                    <path d="M 30 50 Q 50 45 70 50 L 75 110 L 25 110 Z" />
                    {/* Arms */}
                    <path d="M 25 55 L 10 90 L 15 95 L 30 60 Z" />
                    <path d="M 75 55 L 90 90 L 85 95 L 70 60 Z" />
                    {/* Legs */}
                    <path d="M 30 110 L 28 180 L 40 180 L 45 120 L 55 120 L 60 180 L 72 180 L 70 110 Z" />
                </g>
            </svg>
        </div>
    );
}
