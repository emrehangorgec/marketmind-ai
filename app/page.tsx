"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { RecentAnalyses } from "@/components/analysis/RecentAnalyses";
import { Disclaimer } from "@/components/common/Disclaimer";

export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-[#05060b] px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl space-y-6">
        <p className="text-sm uppercase tracking-[0.6em] text-emerald-300">MarketMind</p>
        <h1 className="text-5xl font-semibold leading-tight">
          Multi-agent investment intelligence built for decisive portfolio moves.
        </h1>
        <p className="text-lg text-white/70">
          Combine live market data, AI-powered research, and risk discipline inside one orchestrated workflow.
        </p>
        <SearchBar onSubmit={(symbol) => router.push(`/analyze/${symbol}`)} />
        <Disclaimer />
      </section>
      <section className="mx-auto mt-12 max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent analyses</h2>
        </div>
        <RecentAnalyses />
      </section>
    </main>
  );
}
