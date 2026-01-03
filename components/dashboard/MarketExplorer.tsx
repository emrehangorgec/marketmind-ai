"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "@/components/SearchBar";
import { POPULAR_MARKETS } from "@/lib/constants";
import { TrendingUp, Globe, Coins, Building2 } from "lucide-react";

export function MarketExplorer() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"US" | "TR" | "CRYPTO">("US");

  const tabs = [
    { id: "US", label: "US Stocks", icon: Globe },
    { id: "TR", label: "Borsa Istanbul", icon: Building2 },
    { id: "CRYPTO", label: "Crypto", icon: Coins },
  ] as const;

  const handleSymbolSelect = (symbol: string) => {
    router.push(`/analyze/${symbol}`);
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <SearchBar onSubmit={handleSymbolSelect} />
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {POPULAR_MARKETS[activeTab].map((item, index) => (
            <motion.button
              key={item.symbol}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onClick={() => handleSymbolSelect(item.symbol)}
              className="group relative flex flex-col items-start p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all text-left"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                  {item.symbol.replace("-USD", "").replace(".IS", "")}
                </span>
                <TrendingUp className="w-4 h-4 text-white/20 group-hover:text-emerald-400 transition-colors" />
              </div>
              <span className="text-sm text-white/60 line-clamp-1">
                {item.name}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
