import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = true }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-emerald-500"
        >
          {/* Hexagon Background */}
          <path
            d="M16 2L28.1244 9V23L16 30L3.87564 23V9L16 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-20"
          />
          
          {/* Brain/Circuit Nodes */}
          <circle cx="16" cy="16" r="2" fill="currentColor" className="animate-pulse" />
          <circle cx="16" cy="8" r="1.5" fill="currentColor" className="opacity-60" />
          <circle cx="23" cy="12" r="1.5" fill="currentColor" className="opacity-60" />
          <circle cx="23" cy="20" r="1.5" fill="currentColor" className="opacity-60" />
          <circle cx="16" cy="24" r="1.5" fill="currentColor" className="opacity-60" />
          <circle cx="9" cy="20" r="1.5" fill="currentColor" className="opacity-60" />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" className="opacity-60" />

          {/* Connections (Neural Network) */}
          <path
            d="M16 8V16M16 16L23 12M16 16L23 20M16 16V24M16 16L9 20M16 16L9 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="opacity-80"
          />
          
          {/* Market Trend Line Overlay */}
          <path
            d="M26 26L20 20L14 24L6 14"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white leading-none">
            MyMarketMind
          </span>
        </div>
      )}
    </div>
  );
};
