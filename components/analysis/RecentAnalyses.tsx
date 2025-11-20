"use client";

import Link from "next/link";
import { useLocalAnalyses } from "@/hooks/useLocalAnalyses";

export function RecentAnalyses() {
  const analyses = useLocalAnalyses();
  if (!analyses.length) {
    return (
      <p className="text-sm text-white/60">
        Run your first analysis to see it appear here.
      </p>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {analyses.slice(0, 4).map((analysis) => (
        <li key={analysis.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="flex items-center justify-between text-white">
            <p className="text-xl font-semibold">{analysis.symbol}</p>
            <span
              className={`text-sm font-bold ${
                analysis.finalRecommendation === "BUY"
                  ? "text-emerald-400"
                  : analysis.finalRecommendation === "HOLD"
                  ? "text-amber-300"
                  : "text-rose-400"
              }`}
            >
              {analysis.finalRecommendation}
            </span>
          </div>
          <p className="text-sm text-white/60">
            {new Date(analysis.timestamp).toLocaleString()}
          </p>
          <Link
            href={`/analyze/${analysis.symbol}`}
            className="mt-3 inline-flex text-sm font-semibold text-emerald-300"
          >
            View dashboard →
          </Link>
        </li>
      ))}
    </ul>
  );
}
