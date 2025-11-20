import { MarketDataPayload } from "@/lib/types/analysis";

interface AnalysisHeaderProps {
  marketData?: MarketDataPayload;
}

export function AnalysisHeader({ marketData }: AnalysisHeaderProps) {
  if (!marketData) return null;
  const changePositive = (marketData.priceChange ?? 0) >= 0;
  return (
    <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 to-white/5 p-6 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">{marketData.symbol}</p>
          <h1 className="text-4xl font-semibold">${marketData.currentPrice.toFixed(2)}</h1>
          <p className="text-sm text-white/70">Updated {new Date(marketData.fetchedAt).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${changePositive ? "text-emerald-400" : "text-rose-400"}`}>
            {changePositive ? "+" : ""}
            {marketData.priceChange?.toFixed(2)} ({marketData.priceChangePercent?.toFixed(2)}%)
          </p>
          <p className="text-xs text-white/60">vs previous close</p>
        </div>
      </div>
    </header>
  );
}
