"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/i18n/translations";
import { ArrowRight, BarChart2, Shield, Cpu, LogIn } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Logo } from "@/components/common/Logo";
import { SignInModal } from "@/components/modals/SignInModal";
import { AnimatedBackground } from "./AnimatedBackground";
import { SpotlightCard } from "./SpotlightCard";

interface LandingPageProps {
  onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  const { language } = useLanguage();
  const { status } = useSession();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const t = translations[language].landing;
  const common = translations[language].common;

  const handleAction = () => {
    if (status === "authenticated") {
      onLaunch();
    } else {
      setIsSignInModalOpen(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-white flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <AnimatedBackground />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <Logo />
        <LanguageSwitcher />
      </header>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />

      <motion.div
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-semibold leading-tight text-white sm:text-5xl"
            >
              {t.heroTitle}
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base text-white/70 sm:text-lg">
              {t.heroSubtitle}
            </motion.p>

            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <button
                onClick={handleAction}
                className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                {status === "loading" ? (
                  common.loading
                ) : status === "authenticated" ? (
                  <>
                    {t.launchButton}
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    {common.signIn}
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>
              <span className="text-xs text-white/50">
                Secure access required for analysis workspace.
              </span>
            </motion.div>
          </section>

          <section className="space-y-4">
            <motion.div
              variants={containerVariants}
              className="space-y-4"
            >
              <FeatureCard
                icon={<Cpu className="w-5 h-5 text-white/70" />}
                title={t.features.multiAgent.title}
                description={t.features.multiAgent.description}
                variants={itemVariants}
              />
              <FeatureCard
                icon={<BarChart2 className="w-5 h-5 text-white/70" />}
                title={t.features.realTime.title}
                description={t.features.realTime.description}
                variants={itemVariants}
              />
              <FeatureCard
                icon={<Shield className="w-5 h-5 text-white/70" />}
                title={t.features.risk.title}
                description={t.features.risk.description}
                variants={itemVariants}
              />
            </motion.div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FeatureCard({ icon, title, description, variants }: any) {
  return (
    <motion.div variants={variants} className="h-full">
      <SpotlightCard className="h-full rounded-lg border border-white/10 bg-white/5 p-5 transition-colors">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5">
            {icon}
          </div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-white/70">{description}</p>
      </SpotlightCard>
    </motion.div>
  );
}
