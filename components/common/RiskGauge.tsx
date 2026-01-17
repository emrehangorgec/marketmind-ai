"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

interface RiskGaugeProps {
  score?: number;
  level?: "low" | "medium" | "high";
}

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RiskGauge({ score = 5, level = "medium" }: RiskGaugeProps) {
  const { t } = useLanguage();
  const safeScore = typeof score === "number" ? score : 5;
  const normalized = Math.min(Math.max(safeScore, 0), 10) / 10;
  const dash = normalized * CIRCUMFERENCE;
  const color = level === "low" ? "#34d399" : level === "medium" ? "#fbbf24" : "#f87171";
  const textColor =
    level === "low" ? "text-emerald-400" : level === "medium" ? "text-amber-300" : "text-rose-400";

  const getRiskLabel = () => {
    switch (level) {
      case "low": return t.riskGauge.lowRisk;
      case "medium": return t.riskGauge.mediumRisk;
      case "high": return t.riskGauge.highRisk;
      default: return `${level} risk`;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 text-white">
      <svg width={120} height={120} className="rotate-[-90deg]">
        <circle
          cx={60}
          cy={60}
          r={RADIUS}
          fill="none"
          stroke="#ffffff20"
          strokeWidth={10}
        />
        <circle
          cx={60}
          cy={60}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
          strokeLinecap="round"
        />
      </svg>
      <p className="text-sm uppercase tracking-[0.3em] text-white/60">{t.riskGauge.risk}</p>
      <p className={`text-3xl font-bold ${textColor}`}>
        {safeScore.toFixed(1)}
      </p>
      <p className="text-sm text-white/70">{getRiskLabel()}</p>
    </div>
  );
}
