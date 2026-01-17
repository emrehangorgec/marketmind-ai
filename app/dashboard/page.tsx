"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AuthButton } from "@/components/auth/AuthButton";
import { MarketExplorer } from "@/components/dashboard/MarketExplorer";
import { RecentAnalyses } from "@/components/analysis/RecentAnalyses";
import { SearchBar } from "@/components/SearchBar";
import { useLocalAnalyses } from "@/hooks/useLocalAnalyses";

export default function Dashboard() {
  const router = useRouter();
  const [asset, setAsset] = useState("");
  const analyses = useLocalAnalyses();
  const lastAnalysis = analyses[0];

  const handleRunAnalysis = () => {
    const symbol = asset.trim().toUpperCase();
    if (!symbol) return;
    router.push(`/analyze/${symbol}`);
  };

  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div className="text-lg font-semibold tracking-tight">MarketMind</div>
        <AuthButton />
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-16 lg:grid-cols-[380px_1fr]">
        <section aria-labelledby="analysis-configuration" className="space-y-6">
          <div>
            <h1 id="analysis-configuration" className="text-2xl font-semibold">
              Analysis Configuration
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Configure scope and inputs for a structured financial analysis.
            </p>
          </div>

          <div className="space-y-4">
            <label htmlFor="symbol" className="text-sm font-medium text-white/70">
              Asset / Topic
            </label>
            <SearchBar
              defaultSymbol={asset}
              onSubmit={(symbol) => router.push(`/analyze/${symbol}`)}
              variant="dark"
              submitLabel="Run Analysis"
              onValueChange={setAsset}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Quick Picks</label>
            <MarketExplorer variant="dark" showSearch={false} />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-white/70">Analysis Scope</legend>
            <div className="space-y-2 text-sm text-white/70">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/30" />
                Technical Analysis
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/30" />
                Fundamental Signals
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/30" />
                News &amp; Sentiment
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/30" />
                Risk Considerations
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/30" />
                Synthesis
              </label>
            </div>
          </fieldset>

          <details className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium text-white/70">
              Additional Context
            </summary>
            <div className="mt-3">
              <textarea
                id="context"
                name="context"
                rows={4}
                placeholder="Add optional constraints, time horizon, or portfolio notes."
                className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              />
            </div>
          </details>

          <button
            type="button"
            onClick={handleRunAnalysis}
            className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            Run Analysis
          </button>
        </section>

        <section aria-labelledby="analysis-output" className="space-y-6">
          <div>
            <h2 id="analysis-output" className="text-2xl font-semibold">
              Analysis Output
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Structured report aligned to selected scope.
            </p>
          </div>

          <article className="space-y-6 text-sm leading-relaxed text-white/70">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                Executive Summary
              </h3>
              <p>
                Use the left panel to select a symbol and run an analysis. Results will populate
                in the analysis workspace with detailed sections and scores.
              </p>
            </section>

            <div className="border-t border-white/10" />

            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                Recent Analyses
              </h3>
              {lastAnalysis && (
                <Link
                  href={`/analyze/${lastAnalysis.symbol}`}
                  className="inline-flex text-sm font-semibold text-emerald-300"
                >
                  Continue last analysis
                </Link>
              )}
              <RecentAnalyses variant="dark" />
            </section>
          </article>
        </section>
      </div>
    </main>
  );
}
