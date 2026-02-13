import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark";
}

export const Logo: React.FC<LogoProps> = ({
  className = "w-8 h-8",
  showText = true,
  variant = "dark",
}) => {
  const isLight = variant === "light";
  return (
    <div className="flex items-center gap-2">
      <div className={`relative flex items-center justify-center ${className}`}>
        <Image
          src="/favicon.png"
          alt="MyMarketMind Logo"
          width={32}
          height={32}
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`text-lg font-bold tracking-tight leading-none ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            MyMarketMind
          </span>
        </div>
      )}
    </div>
  );
};
