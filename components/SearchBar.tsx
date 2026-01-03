"use client";

import { FormEvent, useMemo, useState } from "react";
import { SUPPORTED_SYMBOLS, POPULAR_MARKETS } from "@/lib/constants";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface SearchBarProps {
  defaultSymbol?: string;
  onSubmit: (symbol: string) => void;
}

export function SearchBar({ defaultSymbol = "", onSubmit }: SearchBarProps) {
  const [value, setValue] = useState(defaultSymbol);
  const { t } = useLanguage();

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
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold uppercase text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
            placeholder={t.home.searchPlaceholder || "Search symbol (e.g. AAPL, THYAO.IS, BTC-USD)"}
            value={value}
            onChange={(event) => setValue(event.target.value.toUpperCase())}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1b23] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
              {suggestions.slice(0, 5).map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between group transition-colors"
                  onClick={() => {
                    setValue(symbol);
                    onSubmit(symbol);
                  }}
                >
                  <span className="font-bold text-white">{symbol}</span>
                  <span className="text-sm text-white/50 group-hover:text-white/80">{getSymbolName(symbol)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-6 py-3 text-lg font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 whitespace-nowrap"
        >
          {t.home.analyzeButton}
        </button>
      </div>
    </form>
  );
}
