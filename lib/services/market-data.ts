import YahooFinance from "yahoo-finance2";
import { HistoricalPriceBar, NewsHeadline, FundamentalsSnapshot } from "@/lib/types/analysis";

const yahooFinance = new YahooFinance();

// Simple in-memory cache for news
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes
type CachedNews = {
  expiresAt: number;
  data: NewsHeadline[];
};
const newsCache = new Map<string, CachedNews>();

export class MarketDataService {
  static async getPrice(symbol: string): Promise<{ 
    price: number; 
    previousClose: number;
    change: number;
    changePercent: number;
    historical: HistoricalPriceBar[] 
  }> {
    const [quote, chartResult] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.chart(symbol, {
        period1: "2023-01-01", 
        interval: "1d",
      }),
    ]);

    const price = quote.regularMarketPrice || 0;
    const previousClose = quote.regularMarketPreviousClose || 0;
    const change = quote.regularMarketChange || 0;
    const changePercent = quote.regularMarketChangePercent || 0;
    
    // Map historical data
    const historical: HistoricalPriceBar[] = (chartResult.quotes || []).map((q: any) => ({
      date: q.date instanceof Date ? q.date.toISOString() : q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    })).reverse(); // Newest first

    return { price, previousClose, change, changePercent, historical };
  }

  static async getFundamentals(symbol: string): Promise<FundamentalsSnapshot> {
    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: ["summaryDetail", "defaultKeyStatistics", "financialData", "assetProfile"],
    });

    if (!summary) {
      throw new Error("No fundamentals found");
    }

    const stats = summary.defaultKeyStatistics;
    const detail = summary.summaryDetail;
    const financial = summary.financialData;
    const profile = summary.assetProfile;

    return {
      marketCap: detail?.marketCap,
      peRatio: detail?.trailingPE,
      eps: stats?.trailingEps,
      pbRatio: stats?.priceToBook,
      dividendYield: detail?.dividendYield,
      revenuePerShare: financial?.revenuePerShare,
      profitMargin: financial?.profitMargins,
      sector: profile?.sector,
      roe: financial?.returnOnEquity,
      debtToEquity: financial?.debtToEquity,
      beta: detail?.beta,
    };
  }

  static async getNews(symbol: string): Promise<NewsHeadline[]> {
    // Check cache
    const cached = newsCache.get(symbol);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    const result = await yahooFinance.search(symbol, { newsCount: 10 });
    
    const headlines: NewsHeadline[] = (result.news || []).map((n: any) => ({
      title: n.title,
      source: n.publisher,
      publishedAt: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toISOString() : new Date().toISOString(),
      url: n.link,
    }));

    // Update cache
    newsCache.set(symbol, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data: headlines,
    });

    return headlines;
  }
}
