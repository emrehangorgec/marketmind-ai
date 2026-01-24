import { HistoricalPriceBar, NewsHeadline, FundamentalsSnapshot } from "@/lib/types/analysis";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
  suppressNotices: ["ripHistorical"],
});

const FINNHUB_API_KEY = process.env.FINNHUB_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
const ALPHA_VANTAGE_PREMIUM = process.env.ALPHA_VANTAGE_PREMIUM === "true";
const BASE_URL = "https://finnhub.io/api/v1";
const AV_BASE_URL = "https://www.alphavantage.co/query";

// Known BIST stock symbols (common ones - can be extended)
const KNOWN_BIST_SYMBOLS = new Set([
  "THYAO", "GARAN", "ASELS", "KCHOL", "AKBNK", "EREGL", "SISE", "BIMAS",
  "TUPRS", "SAHOL", "YKBNK", "HALKB", "VAKBN", "TCELL", "EKGYO", "PGSUS",
  "TTKOM", "ENKAI", "KOZAL", "PETKM", "SASA", "TOASO", "FROTO", "ARCLK",
  "VESTL", "DOHOL", "AEFES", "MGROS", "ULKER", "CCOLA", "TAVHL", "KOZAA",
  "OYAKC", "ISCTR", "GUBRF", "SOKM", "KONTR", "AGHOL", "ARENA", "LOGO",
  "MAVI", "NETAS", "INDES", "PAPIL", "DOAS", "OTKAR", "TMSN", "ALARK",
]);

// Symbol type detection
function getSymbolType(symbol: string): "bist" | "crypto" | "us" {
  const upper = symbol.toUpperCase();
  if (upper.endsWith(".IS")) return "bist";
  if (upper.endsWith("-USD") || upper.endsWith("USD")) return "crypto";
  if (KNOWN_BIST_SYMBOLS.has(upper)) return "bist";
  return "us";
}

// Normalize symbol for Yahoo Finance
function normalizeForYahoo(symbol: string): string {
  const upper = symbol.toUpperCase();
  const type = getSymbolType(upper);

  if (type === "bist" && !upper.endsWith(".IS")) {
    return `${upper}.IS`;
  }
  return upper;
}

// Check if symbol is a BIST stock
function isBistStock(symbol: string): boolean {
  return getSymbolType(symbol) === "bist";
}

// Export for use in other modules
export { normalizeForYahoo, getSymbolType, isBistStock };

// Simple in-memory cache for news and history
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes
const HISTORY_CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const YAHOO_COOLDOWN_MS = 1000 * 60; // 60 seconds
type CachedNews = {
  expiresAt: number;
  data: NewsHeadline[];
};
const newsCache = new Map<string, CachedNews>();
type CachedHistory = {
  expiresAt: number;
  data: HistoricalPriceBar[];
};
const historyCache = new Map<string, CachedHistory>();
const yahooCooldownBySymbol = new Map<string, number>();
let yahooGlobalCooldownUntil = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchFinnhub(endpoint: string, params: Record<string, string> = {}) {
  if (!FINNHUB_API_KEY) {
    throw new Error("FINNHUB_KEY is not defined in environment variables");
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("token", FINNHUB_API_KEY);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const response = await fetch(url.toString(), { next: { revalidate: 60 } });
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Finnhub Request Failed: ${endpoint}`);
    console.error(`Status: ${response.status} ${response.statusText}`);
    console.error(`Body: ${errorBody}`);

    if (response.status === 429) {
      throw new Error("Finnhub API rate limit exceeded");
    }
    if (response.status === 403) {
      console.warn(`Finnhub API Forbidden for ${endpoint}. Returning null/empty.`);
      return null; // Allow fallback or graceful degradation
    }
    throw new Error(`Finnhub API error: ${response.statusText}`);
  }

  return response.json();
}

async function fetchAlphaVantage(params: Record<string, string>) {
  if (!ALPHA_VANTAGE_KEY) {
    console.warn("ALPHA_VANTAGE_KEY missing, skipping history");
    return null;
  }
  const url = new URL(AV_BASE_URL);
  url.searchParams.append("apikey", ALPHA_VANTAGE_KEY);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } }); // Cache longer for history
  if (!res.ok) {
    console.error(`Alpha Vantage Error: ${res.statusText}`);
    return null;
  }
  return res.json();
}

export class MarketDataService {
  private static getAlphaVantageSymbol(symbol: string): string {
    if (symbol.endsWith(".IS")) return symbol.replace(".IS", "");
    if (symbol.endsWith("-USD")) return symbol.replace("-USD", "");
    return symbol;
  }

  private static async fetchAlphaVantageCrypto(symbol: string): Promise<HistoricalPriceBar[]> {
    if (!symbol.endsWith("-USD")) return [];
    const cryptoSymbol = symbol.replace("-USD", "");
    const avData = await fetchAlphaVantage({
      function: "DIGITAL_CURRENCY_DAILY",
      symbol: cryptoSymbol,
      market: "USD",
    });

    const timeSeries = avData?.["Time Series (Digital Currency Daily)"];
    if (!timeSeries) return [];

    return Object.entries(timeSeries)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values["1a. open (USD)"] ?? values["1. open"]),
        high: parseFloat(values["2a. high (USD)"] ?? values["2. high"]),
        low: parseFloat(values["3a. low (USD)"] ?? values["3. low"]),
        close: parseFloat(values["4a. close (USD)"] ?? values["4. close"]),
        volume: parseFloat(values["5. volume"] ?? 0),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 200);
  }

  static async getPrice(symbol: string): Promise<{
    price: number;
    previousClose: number;
    change: number;
    changePercent: number;
    historical: HistoricalPriceBar[]
  }> {
    const symbolType = getSymbolType(symbol);
    const yahooSymbol = normalizeForYahoo(symbol);
    const cacheKey = yahooSymbol.toUpperCase();

    let historical: HistoricalPriceBar[] = [];
    let quote: { c?: number; pc?: number; d?: number; dp?: number } | null = null;

    // For BIST stocks, use Yahoo Finance as primary source (Finnhub doesn't support them)
    if (symbolType === "bist") {
      console.info(`[MarketData] BIST stock detected: ${symbol} -> ${yahooSymbol}`);
      const yahooData = await this.fetchYahooData(yahooSymbol, cacheKey);
      historical = yahooData.historical;
      if (yahooData.price) {
        quote = {
          c: yahooData.price,
          pc: yahooData.previousClose,
          d: yahooData.change,
          dp: yahooData.changePercent,
        };
      }
    } else {
      // For US stocks and crypto, try Finnhub first for quotes
      try {
        quote = await fetchFinnhub("/quote", { symbol });
      } catch (e) {
        console.warn("Finnhub quote failed, will use fallback", e);
      }

      // Get historical data from Alpha Vantage or fallbacks
      historical = await this.fetchHistoricalData(symbol, symbolType);
    }

    // Final fallback to Yahoo for non-BIST stocks (BIST already uses Yahoo as primary)
    if (symbolType !== "bist" && historical.length < 20) {
      console.info(`[MarketData] Insufficient history (${historical.length}), trying Yahoo Finance for ${yahooSymbol}`);
      const yahooData = await this.fetchYahooData(yahooSymbol, cacheKey);
      if (yahooData.historical.length > historical.length) {
        historical = yahooData.historical;
      }
      // Use Yahoo quote if Finnhub quote is empty
      if (!quote?.c && yahooData.price) {
        quote = {
          c: yahooData.price,
          pc: yahooData.previousClose,
          d: yahooData.change,
          dp: yahooData.changePercent,
        };
      }
    }

    const lastClose = historical[0]?.close ?? 0;
    const price = quote?.c || lastClose || 0;
    const previousClose = quote?.pc || historical[1]?.close || 0;
    const change = quote?.d || (price && previousClose ? price - previousClose : 0);
    const changePercent = quote?.dp || (previousClose ? (change / previousClose) * 100 : 0);

    console.info(`[MarketData] Result for ${symbol}: price=${price}, historyPoints=${historical.length}`);
    return { price, previousClose, change, changePercent, historical };
  }

  private static async fetchHistoricalData(
    symbol: string,
    symbolType: "bist" | "crypto" | "us"
  ): Promise<HistoricalPriceBar[]> {
    let historical: HistoricalPriceBar[] = [];

    // Try Alpha Vantage first for US stocks
    if (symbolType === "us") {
      try {
        const avSymbol = this.getAlphaVantageSymbol(symbol);
        let avData = await fetchAlphaVantage({
          function: "TIME_SERIES_DAILY",
          symbol: avSymbol,
          outputsize: "compact"
        });

        let finalSeries = avData?.["Time Series (Daily)"];
        if (!finalSeries && (avData?.Note || avData?.Information)) {
          console.warn("Alpha Vantage throttled or unavailable");
        }

        if (!finalSeries && ALPHA_VANTAGE_PREMIUM) {
          avData = await fetchAlphaVantage({
            function: "TIME_SERIES_DAILY",
            symbol: avSymbol,
            outputsize: "full"
          });
          finalSeries = avData?.["Time Series (Daily)"];
        }

        if (finalSeries) {
          historical = Object.entries(finalSeries)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map(([date, values]: [string, any]) => ({
              date,
              open: parseFloat(values["1. open"]),
              high: parseFloat(values["2. high"]),
              low: parseFloat(values["3. low"]),
              close: parseFloat(values["4. close"]),
              volume: parseFloat(values["5. volume"])
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 200);
        }
      } catch (e) {
        console.error("Failed to fetch history from Alpha Vantage", e);
      }
    }

    // Try Alpha Vantage crypto endpoint
    if (symbolType === "crypto" && historical.length < 20) {
      try {
        historical = await this.fetchAlphaVantageCrypto(symbol);
      } catch (e) {
        console.error("Failed to fetch crypto history from Alpha Vantage", e);
      }
    }

    // Try Finnhub candles for US stocks
    if (symbolType === "us" && historical.length < 20) {
      try {
        const to = Math.floor(Date.now() / 1000);
        const from = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);
        const candles = await fetchFinnhub("/stock/candle", {
          symbol,
          resolution: "D",
          from: String(from),
          to: String(to),
        });

        if (candles?.s === "ok" && Array.isArray(candles?.t)) {
          const mapped = candles.t
            .map((t: number, idx: number) => ({
              date: new Date(t * 1000).toISOString().split("T")[0],
              open: candles.o?.[idx] ?? 0,
              high: candles.h?.[idx] ?? 0,
              low: candles.l?.[idx] ?? 0,
              close: candles.c?.[idx] ?? 0,
              volume: candles.v?.[idx] ?? 0,
            }))
            .filter((bar: HistoricalPriceBar) => bar.close)
            .sort((a: HistoricalPriceBar, b: HistoricalPriceBar) =>
              new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 200);

          if (mapped.length > historical.length) {
            historical = mapped;
          }
        }
      } catch (e) {
        console.warn("Finnhub candles unavailable", e);
      }
    }

    return historical;
  }

  private static async fetchYahooData(
    yahooSymbol: string,
    cacheKey: string
  ): Promise<{
    historical: HistoricalPriceBar[];
    price?: number;
    previousClose?: number;
    change?: number;
    changePercent?: number;
  }> {
    const now = Date.now();
    const symbolCooldownUntil = yahooCooldownBySymbol.get(cacheKey) ?? 0;

    // Check cooldown
    if (now < yahooGlobalCooldownUntil || now < symbolCooldownUntil) {
      const cachedHistory = historyCache.get(cacheKey);
      if (cachedHistory && now < cachedHistory.expiresAt) {
        return { historical: cachedHistory.data };
      }
      return { historical: [] };
    }

    // Check cache
    const cachedHistory = historyCache.get(cacheKey);
    if (cachedHistory && now < cachedHistory.expiresAt) {
      return { historical: cachedHistory.data };
    }

    const period2 = new Date();
    const period1 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const yfChart = await yahooFinance.chart(yahooSymbol, {
          period1,
          period2,
          interval: "1d",
          return: "array",
        });

        const quotes = yfChart?.quotes ?? [];
        const mapped = quotes
          .filter((bar) => bar.close != null)
          .map((bar) => ({
            date: bar.date.toISOString().split("T")[0],
            open: bar.open ?? bar.close ?? 0,
            high: bar.high ?? bar.close ?? 0,
            low: bar.low ?? bar.close ?? 0,
            close: bar.close ?? 0,
            volume: bar.volume ?? 0,
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 200);

        historyCache.set(cacheKey, {
          expiresAt: Date.now() + HISTORY_CACHE_TTL_MS,
          data: mapped,
        });

        // Extract current price from meta or last quote
        const meta = yfChart?.meta;
        const lastQuote = quotes[quotes.length - 1];
        const price = meta?.regularMarketPrice ?? lastQuote?.close ?? undefined;
        const previousClose = meta?.previousClose ?? (quotes.length > 1 ? quotes[quotes.length - 2]?.close : undefined) ?? undefined;

        return {
          historical: mapped,
          price: price ?? undefined,
          previousClose: previousClose ?? undefined,
          change: price && previousClose ? price - previousClose : undefined,
          changePercent: price && previousClose ? ((price - previousClose) / previousClose) * 100 : undefined,
        };
      } catch (e) {
        const err = e as { statusCode?: number; message?: string };
        const isRateLimited = err?.statusCode === 429 ||
          err?.message?.includes("Too Many Requests") ||
          err?.message?.includes("429");

        console.error(`Yahoo Finance error for ${yahooSymbol}:`, err.message, isRateLimited ? "(rate limited)" : "");

        if (isRateLimited) {
          const cooldownUntil = Date.now() + YAHOO_COOLDOWN_MS;
          yahooCooldownBySymbol.set(cacheKey, cooldownUntil);
          yahooGlobalCooldownUntil = cooldownUntil;

          if (attempt === 0) {
            await sleep(1250);
            continue;
          }
        }
        break;
      }
    }

    return { historical: [] };
  }

  static async getFundamentals(symbol: string): Promise<FundamentalsSnapshot> {
    const symbolType = getSymbolType(symbol);
    const yahooSymbol = normalizeForYahoo(symbol);

    // For BIST stocks, use Yahoo Finance for fundamentals
    if (symbolType === "bist") {
      return this.fetchYahooFundamentals(yahooSymbol);
    }

    // For US stocks, try Finnhub first
    try {
      const [profile, metrics] = await Promise.all([
        fetchFinnhub("/stock/profile2", { symbol }),
        fetchFinnhub("/stock/metric", { symbol, metric: "all" })
      ]);

      const m = metrics?.metric || {};
      const p = profile || {};

      const fundamentals: FundamentalsSnapshot = {
        marketCap: p.marketCapitalization ? p.marketCapitalization * 1000000 : undefined,
        peRatio: m.peBasicExclExtraTTM,
        eps: m.epsExclExtraTTM,
        pbRatio: m.pbAnnual,
        dividendYield: m.dividendYieldIndicatedAnnual ? m.dividendYieldIndicatedAnnual / 100 : undefined,
        revenuePerShare: m.revenuePerShareTTM,
        profitMargin: m.netProfitMarginTTM ? m.netProfitMarginTTM / 100 : undefined,
        sector: p.finnhubIndustry,
        roe: m.roeTTM ? m.roeTTM / 100 : undefined,
        debtToEquity: m.totalDebtToEquityAnnual ? m.totalDebtToEquityAnnual / 100 : undefined,
        beta: m.beta,
      };

      // If Finnhub returned no data, try Yahoo
      const hasData = Object.values(fundamentals).some(v => v !== undefined);
      if (!hasData) {
        return this.fetchYahooFundamentals(yahooSymbol);
      }

      return fundamentals;
    } catch (e) {
      console.warn("Finnhub fundamentals failed, trying Yahoo", e);
      return this.fetchYahooFundamentals(yahooSymbol);
    }
  }

  private static async fetchYahooFundamentals(yahooSymbol: string): Promise<FundamentalsSnapshot> {
    try {
      const quote = await yahooFinance.quote(yahooSymbol);

      return {
        marketCap: quote.marketCap ?? undefined,
        peRatio: quote.trailingPE ?? undefined,
        eps: quote.epsTrailingTwelveMonths ?? undefined,
        pbRatio: quote.priceToBook ?? undefined,
        dividendYield: quote.dividendYield ?? undefined,
        sector: quote.sector ?? undefined,
        beta: quote.beta ?? undefined,
      };
    } catch (e) {
      console.error("Yahoo Finance fundamentals failed", e);
      return {};
    }
  }

  static async getNews(symbol: string): Promise<NewsHeadline[]> {
    const symbolType = getSymbolType(symbol);
    const yahooSymbol = normalizeForYahoo(symbol);
    const cacheKey = yahooSymbol.toUpperCase();

    // Check cache
    const cached = newsCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    let headlines: NewsHeadline[] = [];

    // For BIST stocks, skip Finnhub (doesn't support them)
    if (symbolType !== "bist") {
      try {
        const to = new Date().toISOString().split('T')[0];
        const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const result = await fetchFinnhub("/company-news", {
          symbol,
          from,
          to
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        headlines = (result || []).slice(0, 10).map((n: any) => ({
          title: n.headline,
          source: n.source,
          publishedAt: new Date(n.datetime * 1000).toISOString(),
          url: n.url,
        }));
      } catch (e) {
        console.warn("Finnhub news failed", e);
      }
    }

    // Fallback to Yahoo for news if Finnhub returned nothing
    if (headlines.length === 0) {
      try {
        // Yahoo Finance doesn't have a direct news API in yahoo-finance2,
        // but we can use search to get some context
        console.info(`[MarketData] No Finnhub news for ${symbol}, news will be limited`);
      } catch (e) {
        console.warn("Yahoo news fallback failed", e);
      }
    }

    // Update cache
    newsCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data: headlines,
    });

    return headlines;
  }
}
