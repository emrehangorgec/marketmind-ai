"use client";

import Link from "next/link";
import { useLocalAnalyses } from "@/hooks/useLocalAnalyses";
import { useLanguage } from "@/components/providers/LanguageProvider";

type RecentAnalysesProps = {
  variant?: "light" | "dark";
};

export function RecentAnalyses({ variant = "dark" }: RecentAnalysesProps) {
  const analyses = useLocalAnalyses();
  const { t } = useLanguage();
  const isLight = variant === "light";

  if (!analyses.length) {
    return (
      <p className={`text-sm ${isLight ? "text-slate-500" : "text-white/60"}`}>
        {t.home.noAnalyses}
      </p>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {analyses.slice(0, 4).map((analysis) => (
        <li
          key={analysis.id}
          className={`rounded-2xl border p-4 ${
            isLight ? "border-slate-200 bg-white" : "border-white/5 bg-white/5"
          }`}
        >
          <div className={`flex items-center justify-between ${isLight ? "text-slate-900" : "text-white"}`}>
            <p className="text-xl font-semibold">{analysis.symbol}</p>
            <span
              className={`text-sm font-bold ${
                analysis.finalRecommendation === "BUY"
                  ? isLight
                    ? "text-emerald-600"
                    : "text-emerald-400"
                  : analysis.finalRecommendation === "HOLD"
                  ? isLight
                    ? "text-amber-600"
                    : "text-amber-300"
                  : isLight
                    ? "text-rose-600"
                    : "text-rose-400"
              }`}
            >
              {analysis.finalRecommendation}
            </span>
          </div>
          <p className={`text-sm ${isLight ? "text-slate-500" : "text-white/60"}`}>
            {new Date(analysis.timestamp).toLocaleString()}
          </p>
          <Link
            href={`/analyze/${analysis.symbol}`}
            className={`mt-3 inline-flex text-sm font-semibold ${
              isLight ? "text-slate-900" : "text-emerald-300"
            }`}
          >
            {t.home.viewDashboard}
          </Link>
        </li>
      ))}
    </ul>
  );
}
