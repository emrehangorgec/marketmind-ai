"use client";

import { AnalysisState } from "@/lib/types/analysis";

const AGENT_LABELS: Record<string, string> = {
  marketData: "Market Data",
  technical: "Technical",
  fundamental: "Fundamental",
  sentiment: "Sentiment",
  risk: "Risk",
  reporter: "Report",
};

interface AgentVisualizationProps {
  state: AnalysisState;
  statusText: string;
}

export function AgentVisualization({ state, statusText }: AgentVisualizationProps) {
  const agents = Object.entries(AGENT_LABELS);

  return (
    <section className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Execution Pipeline</p>
          <p className="text-lg font-semibold text-white">{statusText}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-emerald-400">{Math.round(state.progress * 100)}%</p>
          <p className="text-xs text-white/60">Overall progress</p>
        </div>
      </div>
      <progress
        max={100}
        value={Math.round(state.progress * 100)}
        className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10 [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-emerald-400 [&::-webkit-progress-value]:to-cyan-400"
        aria-label="Analysis progress"
      />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {agents.map(([key, label]) => {
          const isActive = state.activeAgent === key;
          const completed = Boolean(state.results[key as keyof typeof state.results]);
          const hasError = state.errors.some((err) => err.agentName === key);
          return (
            <div
              key={key}
              className={`rounded-2xl border px-4 py-3 text-sm transition ${
                hasError
                  ? "border-red-500/40 bg-red-500/10 text-red-200"
                  : completed
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                  : isActive
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-100"
                  : "border-white/10 bg-white/5 text-white/70"
              }`}
            >
              <p className="font-semibold">{label}</p>
              <p className="text-xs text-white/60">
                {hasError
                  ? "Error"
                  : completed
                  ? "Completed"
                  : isActive
                  ? "Running"
                  : "Pending"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
