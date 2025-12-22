"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/i18n/translations";
import { ArrowRight, BarChart2, Shield, Cpu, LogIn } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />

      <motion.div
        className="max-w-5xl w-full z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div variants={itemVariants} className="mb-4 inline-block relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"></div>
            <span className="relative px-4 py-1.5 rounded-full bg-black border border-white/10 text-blue-400 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
              MyMarketMind
            </span>
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 drop-shadow-2xl"
          >
            {t.heroTitle}
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            {t.heroSubtitle}
          </motion.p>
          
          <motion.button
            variants={itemVariants}
            onClick={handleAction}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold text-lg transition-all hover:bg-gray-100"
          >
            {status === "loading" ? (
              common.loading
            ) : status === "authenticated" ? (
              <>
                {t.launchButton}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </>
            ) : (
              <>
                {common.signIn}
                <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </motion.button>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <FeatureCard
            icon={<Cpu className="w-8 h-8 text-blue-400" />}
            title={t.features.multiAgent.title}
            description={t.features.multiAgent.description}
            variants={itemVariants}
          />
          <FeatureCard
            icon={<BarChart2 className="w-8 h-8 text-green-400" />}
            title={t.features.realTime.title}
            description={t.features.realTime.description}
            variants={itemVariants}
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-purple-400" />}
            title={t.features.risk.title}
            description={t.features.risk.description}
            variants={itemVariants}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description, variants }: any) {
  return (
    <motion.div variants={variants} className="h-full">
      <SpotlightCard className="h-full p-6 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
        <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit border border-white/10 shadow-lg shadow-blue-500/5">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </SpotlightCard>
    </motion.div>
  );
}
