"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { AnalysisTab, ANALYSIS_TABS } from "@/lib/constants";
import {
  AnalysisRecord,
  AnalysisState,
  TechnicalAnalysisPayload,
} from "@/lib/types/analysis";
import { ScoreCard } from "@/components/common/ScoreCard";
import { RiskGauge } from "@/components/common/RiskGauge";
import { TechnicalChart } from "@/components/charts/TechnicalChart";

interface TabbedResultsProps {
  state: AnalysisState;
  record: AnalysisRecord | null;
}

export function TabbedResults({ state, record }: TabbedResultsProps) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("Overview");
  const marketData = state.results.marketData;
  const technical = state.results.technical;
  const fundamental = state.results.fundamental;
  const sentiment = state.results.sentiment;
  const risk = state.results.risk;
  const report = state.results.reporter;

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <ScoreCard label="Composite" score={record?.compositeScore} />
            <ScoreCard
              label="Confidence"
              score={record?.overallConfidence ? record.overallConfidence * 10 : undefined}
            />
            <ScoreCard label="Technical" score={technical?.score} />
            <ScoreCard label="Fundamental" score={fundamental?.score} />
            <ScoreCard label="Sentiment" score={sentiment?.score} />
            <ScoreCard label="Risk (lower is better)" score={risk?.score} />
          </div>
        );
      case "Technical":
        return (
          <div className="space-y-6">
            <TechnicalChart
              data={marketData?.historicalPrices ?? []}
              indicators={technical?.indicators as TechnicalAnalysisPayload["indicators"]}
            />
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Signals</p>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-white/80">
                {technical?.signals?.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "Fundamental":
        return (
          <div className="space-y-4 text-white">
            <div className="grid gap-4 md:grid-cols-2">
              {fundamental?.metrics &&
                Object.entries(fundamental.metrics).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">{key}</p>
                    <p className="text-xl font-semibold">{value ?? "-"}</p>
                  </div>
                ))}
            </div>
          </div>
        );
      case "Sentiment":
        return (
          <div className="space-y-4 text-white">
            <p className="text-lg font-semibold">{sentiment?.overallSentiment ?? "--"}</p>
            <ul className="space-y-2">
              {state.results.marketData?.news?.slice(0, 5).map((article) => (
                <li key={article.url} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <a href={article.url} target="_blank" rel="noreferrer" className="font-semibold text-emerald-300">
                    {article.title}
                  </a>
                  <p className="text-xs text-white/60">{article.source}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      case "Risk":
        return (
            <div className="flex flex-col items-center gap-6 text-white md:flex-row">
              <RiskGauge score={risk?.riskScore} level={risk?.riskLevel} />
            <ul className="space-y-2 text-sm text-white/80">
                {risk?.keyRisks?.map((riskItem) => (
                <li key={riskItem}>• {riskItem}</li>
              ))}
            </ul>
          </div>
        );
      case "Full Report":
        return (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{report?.fullReport ?? "Report unavailable."}</ReactMarkdown>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {ANALYSIS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tab === activeTab ? "border-white bg-white/20 text-white" : "border-white/20 text-white/70"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="rounded-3xl border border-white/5 bg-white/5 p-6">{renderContent()}</div>
    </section>
  );
}
