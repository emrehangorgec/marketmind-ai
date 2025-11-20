"use client";

import { FormEvent, useMemo, useState } from "react";
import { SUPPORTED_SYMBOLS } from "@/lib/constants";

interface SearchBarProps {
  defaultSymbol?: string;
  onSubmit: (symbol: string) => void;
}

export function SearchBar({ defaultSymbol = "AAPL", onSubmit }: SearchBarProps) {
  const [value, setValue] = useState(defaultSymbol);

  const suggestions = useMemo(() => {
    if (!value) return SUPPORTED_SYMBOLS;
    return SUPPORTED_SYMBOLS.filter((symbol) => symbol.startsWith(value.toUpperCase()));
  }, [value]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const symbol = value.trim().toUpperCase();
    if (!symbol) return;
    onSubmit(symbol);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <label className="text-sm font-semibold text-muted-foreground" htmlFor="symbol">
        Enter a stock ticker
      </label>
      <div className="mt-2 flex gap-3">
        <div className="flex-1">
          <input
            id="symbol"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold uppercase text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
            placeholder="AAPL"
            value={value}
            onChange={(event) => setValue(event.target.value.toUpperCase())}
            autoComplete="off"
          />
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/60">
            {suggestions.slice(0, 5).map((symbol) => (
              <button
                key={symbol}
                type="button"
                className="rounded-full border border-white/20 px-3 py-1 transition hover:border-white"
                onClick={() => {
                  setValue(symbol);
                  onSubmit(symbol);
                }}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-6 py-3 text-lg font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
        >
          Analyze
        </button>
      </div>
    </form>
  );
}
