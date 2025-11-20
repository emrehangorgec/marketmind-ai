"use client";

import { useParams } from "next/navigation";
import { useFinancialAnalysis } from "@/hooks/useFinancialAnalysis";
import { AgentVisualization } from "@/components/visualizations/AgentVisualization";
import { AnalysisHeader } from "@/components/analysis/AnalysisHeader";
import { TabbedResults } from "@/components/analysis/TabbedResults";
import { Disclaimer } from "@/components/common/Disclaimer";

export default function AnalyzeSymbolPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = (params.symbol ?? "AAPL").toUpperCase();
  const { state, record, error, statusText, isRunning, analyze } = useFinancialAnalysis(symbol);

  return (
    <main className="min-h-screen bg-[#05060b] px-4 py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.6em] text-emerald-300">Analysis Dashboard</p>
            <h1 className="text-4xl font-semibold">{symbol}</h1>
          </div>
          <button
            type="button"
            onClick={analyze}
            disabled={isRunning}
            className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? "Running analysis..." : "Re-run analysis"}
          </button>
        </div>
        {error && (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error.message}
          </p>
        )}
        <AgentVisualization state={state} statusText={statusText} />
        <AnalysisHeader marketData={state.results.marketData} />
        <TabbedResults state={state} record={record} />
        <Disclaimer />
      </div>
    </main>
  );
}
