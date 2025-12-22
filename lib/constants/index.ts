export const DISCLAIMER_TEXT =
  "⚠️ DISCLAIMER: Educational purposes only. Not financial advice. Do your own research before investing.";

export const MARKET_DATA_CACHE_TTL = 1000 * 60 * 2; // 2 minutes
export const DEFAULT_TIMEFRAME = "100d";

export const POPULAR_MARKETS = {
  US: [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "META", name: "Meta Platforms" },
    { symbol: "AMD", name: "Advanced Micro Devices" },
  ],
  TR: [
    { symbol: "THYAO.IS", name: "Türk Hava Yolları" },
    { symbol: "GARAN.IS", name: "Garanti BBVA" },
    { symbol: "ASELS.IS", name: "Aselsan" },
    { symbol: "KCHOL.IS", name: "Koç Holding" },
    { symbol: "AKBNK.IS", name: "Akbank" },
    { symbol: "EREGL.IS", name: "Ereğli Demir Çelik" },
    { symbol: "SISE.IS", name: "Şişecam" },
    { symbol: "BIMAS.IS", name: "BİM Mağazalar" },
  ],
  CRYPTO: [
    { symbol: "BTC-USD", name: "Bitcoin" },
    { symbol: "ETH-USD", name: "Ethereum" },
    { symbol: "SOL-USD", name: "Solana" },
    { symbol: "XRP-USD", name: "XRP" },
    { symbol: "DOGE-USD", name: "Dogecoin" },
    { symbol: "AVAX-USD", name: "Avalanche" },
    { symbol: "BNB-USD", name: "Binance Coin" },
    { symbol: "ADA-USD", name: "Cardano" },
  ],
};

export const SUPPORTED_SYMBOLS = [
  ...POPULAR_MARKETS.US.map(m => m.symbol),
  ...POPULAR_MARKETS.TR.map(m => m.symbol),
  ...POPULAR_MARKETS.CRYPTO.map(m => m.symbol),
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
