export const DISCLAIMER_TEXT =
  "⚠️ DISCLAIMER: Educational purposes only. Not financial advice. Do your own research before investing.";

export const MARKET_DATA_CACHE_TTL = 1000 * 60 * 2; // 2 minutes
export const DEFAULT_TIMEFRAME = "100d";

export const SUPPORTED_SYMBOLS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "META",
  "NVDA",
  "TSLA",
  "NFLX",
  "UNH",
  "JPM",
];

export const ANALYSIS_TABS = [
  "Overview",
  "Technical",
  "Fundamental",
  "Sentiment",
  "Risk",
  "Full Report",
] as const;

export type AnalysisTab = (typeof ANALYSIS_TABS)[number];
