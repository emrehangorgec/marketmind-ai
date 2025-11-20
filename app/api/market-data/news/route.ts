import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

// Suppress the "yahooSurvey" notice which can cause issues in some environments
// yahooFinance.suppressNotices(['yahooSurvey']);

const CACHE_TTL_MS = 1000 * 60 * 5; // reuse news for five minutes per symbol

type CachedNews = {
  expiresAt: number;
  data: Array<{
    title: string;
    source: string;
    publishedAt: string;
    url: string;
  }>;
};

const newsCache = new Map<string, CachedNews>();

export async function POST(request: Request) {
  try {
    const requestId = randomUUID();
    const startedAt = Date.now();
    const { symbol, days = 7 } = await request.json();
    
    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SYMBOL",
            message: "Symbol is required",
            recoverable: true,
          },
        },
        { status: 400 }
      );
    }

    const cacheKey = `${symbol.toUpperCase()}-${days}`;
    const cached = newsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.info("[NEWS] cache hit", { requestId, symbol, days });
      return NextResponse.json({ success: true, data: cached.data, meta: { cached: true } });
    }

    console.info("[NEWS] fetching data (Yahoo Finance)", { requestId, symbol, days });

    // Yahoo Finance search returns news
    const result = await yahooFinance.search(symbol, { newsCount: 15 });
    
    const articles = (result.news ?? []).map((item) => ({
      title: item.title,
      source: item.publisher,
      publishedAt: item.providerPublishTime ? new Date(item.providerPublishTime).toISOString() : new Date().toISOString(),
      url: item.link,
    }));

    newsCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data: articles,
    });

    console.info("[NEWS] success", {
      requestId,
      symbol,
      durationMs: Date.now() - startedAt,
      articles: articles.length,
      cached: false,
    });

    return NextResponse.json({ success: true, data: articles, meta: { requestId } });

  } catch (error) {
    console.error("[NEWS] unexpected error", { error });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NEWS_ROUTE_ERROR",
          message: (error as Error)?.message ?? "Unable to fetch news",
          recoverable: true,
        },
      },
      { status: 500 }
    );
  }
}
