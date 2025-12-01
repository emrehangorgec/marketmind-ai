"use client";

import { useParams } from "next/navigation";
import { useFinancialAnalysis } from "@/hooks/useFinancialAnalysis";
import { AgentVisualization } from "@/components/visualizations/AgentVisualization";
import { useRouter } from "next/navigation";
import { AnalysisHeader } from "@/components/analysis/AnalysisHeader";
import { TabbedResults } from "@/components/analysis/TabbedResults";
import { Disclaimer } from "@/components/common/Disclaimer";
import { AuthButton } from "@/components/auth/AuthButton";
import { SearchBar } from "@/components/SearchBar";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { DashboardDisclaimerModal } from "@/components/modals/DashboardDisclaimerModal";

export default function AnalyzeSymbolPage() {
  const router = useRouter();
  const params = useParams<{ symbol: string }>();
  const symbol = (params.symbol ?? "AAPL").toUpperCase();
  const { state, record, error, statusText, isRunning, analyze } = useFinancialAnalysis(symbol);
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#05060b] px-4 py-8 text-white">
      <DashboardDisclaimerModal />
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col-reverse justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4 w-full max-w-xl">
            <Link 
              href="/dashboard" 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </Link>
            <div className="flex-1">
              <SearchBar onSubmit={(s) => router.push(`/analyze/${s}`)} defaultSymbol="" />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/" className="hidden md:block text-xs uppercase tracking-[0.2em] text-emerald-300 hover:text-emerald-400 transition-colors">
              MyMarketMind
            </Link>
            <AuthButton />
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.6em] text-emerald-300">{t.analyze.dashboard}</p>
            <h1 className="text-4xl font-semibold">{symbol}</h1>
          </div>
          <button
            type="button"
            onClick={analyze}
            disabled={isRunning}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60 hover:bg-emerald-600 transition-colors"
          >
            {isRunning ? t.analyze.running : t.analyze.rerun}
          </button>
        </div>
        {error && (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error.message}
          </p>
        )}
        <Disclaimer />
        <AgentVisualization state={state} statusText={statusText} />
        <AnalysisHeader marketData={state.results.marketData} />
        <TabbedResults state={state} record={record} />
      </div>
    </main>
  );
}
