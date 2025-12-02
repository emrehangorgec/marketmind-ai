"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { AnalysisTab, ANALYSIS_TABS } from "@/lib/constants";
import {
  AnalysisRecord,
  AnalysisState,
  TechnicalAnalysisPayload,
} from "@/lib/types/analysis";
import { ScoreCard } from "@/components/common/ScoreCard";
import { RiskGauge } from "@/components/common/RiskGauge";
import { TechnicalChart } from "@/components/charts/TechnicalChart";
import { useLanguage } from "@/components/providers/LanguageProvider";

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
  const { t } = useLanguage();

  const getTabLabel = (tab: AnalysisTab) => {
    switch (tab) {
      case "Overview": return t.tabs.overview;
      case "Technical": return t.tabs.technical;
      case "Fundamental": return t.tabs.fundamental;
      case "Sentiment": return t.tabs.sentiment;
      case "Risk": return t.tabs.risk;
      case "Full Report": return t.tabs.fullReport;
      default: return tab;
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("analysis-content");
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: "#000000",
      });

      const pdf = new jsPDF({
        orientation: element.offsetWidth > element.offsetHeight ? "landscape" : "portrait",
        unit: "px",
        format: [element.offsetWidth, element.offsetHeight]
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, element.offsetWidth, element.offsetHeight);
      pdf.save(`MarketMind_Analysis_${record?.symbol || "Report"}.pdf`);
    } catch (error) {
      console.error("PDF Export failed", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <ScoreCard label={t.scoreCard.composite} score={record?.compositeScore} />
            <ScoreCard
              label={t.scoreCard.confidence}
              score={record?.overallConfidence ? record.overallConfidence * 10 : undefined}
            />
            <ScoreCard label={t.scoreCard.technical} score={technical?.score} />
            <ScoreCard label={t.scoreCard.fundamental} score={fundamental?.score} />
            <ScoreCard label={t.scoreCard.sentiment} score={sentiment?.score} />
            <ScoreCard label={t.scoreCard.risk} score={risk?.riskScore} invertColor />
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
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">{t.tabs.signals}</p>
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
          <div className="report-content prose prose-invert max-w-none">
            <div className="mb-6 border-b border-white/10 pb-4 text-sm text-white/60">
              {t.analyze.generatedAt}: {new Date(record?.timestamp || Date.now()).toLocaleString()}
            </div>
            <ReactMarkdown>{report?.fullReport ?? t.tabs.reportUnavailable}</ReactMarkdown>
            
            {marketData?.news && marketData.news.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="mb-4 text-lg font-semibold text-white">{t.analyze.sources}</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  {marketData.news.map((article, i) => (
                    <li key={i}>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-emerald-400 hover:underline"
                      >
                        {article.title}
                      </a>
                      <span className="ml-2 text-white/40">- {article.source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
        {activeTab === "Full Report" && (
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Download className="h-4 w-4" />
            {t.analyze.exportPDF}
          </button>
        )}
      </div>
      <div id="analysis-content" className="rounded-3xl border border-white/5 bg-white/5 p-6">{renderContent()}</div>
    </section>
  );
}
