import { HistoricalPriceBar, NewsHeadline, FundamentalsSnapshot } from "@/lib/types/analysis";

const FINNHUB_API_KEY = process.env.FINNHUB_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
const BASE_URL = "https://finnhub.io/api/v1";
const AV_BASE_URL = "https://www.alphavantage.co/query";

// Simple in-memory cache for news
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes
type CachedNews = {
  expiresAt: number;
  data: NewsHeadline[];
};
const newsCache = new Map<string, CachedNews>();

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
  static async getPrice(symbol: string): Promise<{ 
    price: number; 
    previousClose: number;
    change: number;
    changePercent: number;
    historical: HistoricalPriceBar[] 
  }> {
    // Get Quote from Finnhub (Fast, higher rate limit)
    const quote = await fetchFinnhub("/quote", { symbol });
    
    // Get History from Alpha Vantage (Fallback for Finnhub 403)
    let historical: HistoricalPriceBar[] = [];
    
    try {
      // Try Alpha Vantage for history since Finnhub candles are restricted
      const avData = await fetchAlphaVantage({
        function: "TIME_SERIES_DAILY",
        symbol: symbol,
        outputsize: "full" // Need full to get enough data for MA200
      });
      
      const timeSeries = avData?.["Time Series (Daily)"];
      if (timeSeries) {
        historical = Object.entries(timeSeries)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map(([date, values]: [string, any]) => ({
            date: date,
            open: parseFloat(values["1. open"]),
            high: parseFloat(values["2. high"]),
            low: parseFloat(values["3. low"]),
            close: parseFloat(values["4. close"]),
            volume: parseFloat(values["5. volume"])
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Newest first
          .slice(0, 200); // Keep last 200 days for analysis
      }
    } catch (e) {
      console.error("Failed to fetch history from Alpha Vantage", e);
    }

    const price = quote?.c || 0;
    const previousClose = quote?.pc || 0;
    const change = quote?.d || 0;
    const changePercent = quote?.dp || 0;

    return { price, previousClose, change, changePercent, historical };
  }

  static async getFundamentals(symbol: string): Promise<FundamentalsSnapshot> {
    const [profile, metrics] = await Promise.all([
      fetchFinnhub("/stock/profile2", { symbol }),
      fetchFinnhub("/stock/metric", { symbol, metric: "all" })
    ]);

    const m = metrics?.metric || {};
    const p = profile || {};

    return {
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
  }

  static async getNews(symbol: string): Promise<NewsHeadline[]> {
    // Check cache
    const cached = newsCache.get(symbol);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    // Last 7 days
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await fetchFinnhub("/company-news", { 
      symbol, 
      from, 
      to 
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headlines: NewsHeadline[] = (result || []).slice(0, 10).map((n: any) => ({
      title: n.headline,
      source: n.source,
      publishedAt: new Date(n.datetime * 1000).toISOString(),
      url: n.url,
    }));

    // Update cache
    newsCache.set(symbol, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data: headlines,
    });

    return headlines;
  }
}
