"use client";

import { FormEvent, useMemo, useState } from "react";
import { SUPPORTED_SYMBOLS, POPULAR_MARKETS } from "@/lib/constants";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface SearchBarProps {
  defaultSymbol?: string;
  onSubmit: (symbol: string) => void;
  variant?: "light" | "dark";
  submitLabel?: string;
  onValueChange?: (value: string) => void;
}

export function SearchBar({
  defaultSymbol = "",
  onSubmit,
  variant = "dark",
  submitLabel,
  onValueChange,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultSymbol);
  const { t } = useLanguage();
  const isLight = variant === "light";

  const suggestions = useMemo(() => {
    if (!value) return [];
    return SUPPORTED_SYMBOLS.filter((symbol) => symbol.startsWith(value.toUpperCase()));
  }, [value]);

  const getSymbolName = (symbol: string) => {
    for (const category of Object.values(POPULAR_MARKETS)) {
      const found = category.find(item => item.symbol === symbol);
      if (found) return found.name;
    }
    return "";
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const symbol = value.trim().toUpperCase();
    if (!symbol) return;
    onSubmit(symbol);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="mt-2 flex gap-3 items-start">
        <div className="flex-1 relative">
          <input
            id="symbol"
            className={`w-full rounded-xl px-4 py-3 text-lg font-semibold uppercase focus:outline-none ${
              isLight
                ? "border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400"
                : "border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/40"
            }`}
            placeholder={t.home.searchPlaceholder || "Search symbol (e.g. AAPL, THYAO.IS, BTC-USD)"}
            value={value}
            onChange={(event) => {
              const nextValue = event.target.value.toUpperCase();
              setValue(nextValue);
              onValueChange?.(nextValue);
            }}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <div
              className={`absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 shadow-xl ${
                isLight
                  ? "bg-white border border-slate-200"
                  : "bg-[#1a1b23] border border-white/10"
              }`}
            >
              {suggestions.slice(0, 5).map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  className={`w-full px-4 py-3 text-left flex items-center justify-between group transition-colors ${
                    isLight ? "hover:bg-slate-50" : "hover:bg-white/5"
                  }`}
                  onClick={() => {
                    setValue(symbol);
                    onSubmit(symbol);
                  }}
                >
                  <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{symbol}</span>
                  <span
                    className={`text-sm ${
                      isLight
                        ? "text-slate-500 group-hover:text-slate-700"
                        : "text-white/50 group-hover:text-white/80"
                    }`}
                  >
                    {getSymbolName(symbol)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          className={`rounded-xl px-6 py-3 text-lg font-bold whitespace-nowrap transition ${
            isLight
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
          }`}
        >
          {submitLabel || t.home.analyzeButton}
        </button>
      </div>
    </form>
  );
}
