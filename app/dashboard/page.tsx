"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { RecentAnalyses } from "@/components/analysis/RecentAnalyses";
import { Disclaimer } from "@/components/common/Disclaimer";
import { AuthButton } from "@/components/auth/AuthButton";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import Link from "next/link";
import { DashboardDisclaimerModal } from "@/components/modals/DashboardDisclaimerModal";

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#05060b] px-6 py-12 text-white">
      <DashboardDisclaimerModal />
      <div className="mx-auto mb-8 flex max-w-5xl justify-end gap-4 items-center">
        <AuthButton />
      </div>
      <section className="mx-auto max-w-5xl space-y-6">
        <Link href="/" className="text-sm uppercase tracking-[0.6em] text-emerald-300 hover:text-emerald-400 transition-colors cursor-pointer">
          MyMarketMind
        </Link>
        <h1 className="text-5xl font-semibold leading-tight">
          {t.home.title}
        </h1>
        <p className="text-lg text-white/70">
          {t.home.description}
        </p>
        <SearchBar onSubmit={(symbol) => router.push(`/analyze/${symbol}`)} />
        <Disclaimer />
      </section>
      <section className="mx-auto mt-12 max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t.home.recentAnalyses}</h2>
        </div>
        <RecentAnalyses />
      </section>
    </main>
  );
}
