"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/i18n/translations";
import { ArrowRight, BarChart2, Shield, Cpu } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

interface LandingPageProps {
  onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  const { language } = useLanguage();
  const t = translations[language].landing;

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
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <motion.div
        className="max-w-5xl w-full z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div variants={itemVariants} className="mb-4 inline-block">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              MyMarketMind
            </span>
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
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
            onClick={onLaunch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold text-lg transition-all hover:bg-gray-100"
          >
            {t.launchButton}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
    <motion.div
      variants={variants}
      className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
    >
      <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
