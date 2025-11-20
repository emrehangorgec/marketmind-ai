import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const BRAVE_NEWS_URL = "https://api.search.brave.com/res/v1/news/search";
const CACHE_TTL_MS = 1000 * 60 * 5; // reuse news for five minutes per symbol
const MIN_REQUEST_INTERVAL_MS = 1100; // Brave free tier is 1 req/sec

type CachedNews = {
  expiresAt: number;
  data: Array<{
    title: string;
    source: string;
    publishedAt: string;
    url: string;
  }>;
};

type BraveNewsPublisher = {
  name?: string;
};

type BraveNewsResult = {
  title: string;
  publisher?: BraveNewsPublisher;
  published_date?: string;
  url: string;
};

type BraveNewsResponse = {
  results?: BraveNewsResult[];
};

const newsCache = new Map<string, CachedNews>();
let lastBraveRequestAt = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const apiKey = process.env.BRAVE_SEARCH_KEY;
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || !apiKey;

    if (useMock) {
      console.info("[NEWS] Using MOCK data", { symbol });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      return NextResponse.json({
        success: true,
        data: [
          {
            title: `${symbol} Reports Strong Quarterly Earnings`,
            source: "Mock Financial News",
            publishedAt: new Date().toISOString(),
            url: "#",
          },
          {
            title: `Analysts Upgrade ${symbol} to Buy`,
            source: "Market Watcher",
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
            url: "#",
          },
          {
            title: `New Product Launch Expected from ${symbol}`,
            source: "Tech Daily",
            publishedAt: new Date(Date.now() - 172800000).toISOString(),
            url: "#",
          },
        ],
      });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_NEWS_KEY",
            message: "Brave Search API key missing",
            recoverable: false,
          },
        },
        { status: 500 }
      );
    }

    const cacheKey = `${symbol.toUpperCase()}-${days}`;
    const cached = newsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.info("[NEWS] cache hit", { requestId, symbol, days });
      return NextResponse.json({ success: true, data: cached.data, meta: { cached: true } });
    }

    const params = new URLSearchParams({
      q: `${symbol} stock news`,
      count: "15",
      freshness: `${days}d`,
    });

    const sinceLastRequest = Date.now() - lastBraveRequestAt;
    if (sinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
      console.debug("[NEWS] throttling before request", { requestId, waitMs: MIN_REQUEST_INTERVAL_MS - sinceLastRequest });
      await sleep(MIN_REQUEST_INTERVAL_MS - sinceLastRequest);
    }

    console.info("[NEWS] fetching data", { requestId, symbol, days });
    const response = await fetch(`${BRAVE_NEWS_URL}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": apiKey,
      },
      next: { revalidate: 600 },
    });
    lastBraveRequestAt = Date.now();

    if (response.status === 429) {
      if (cached) {
        console.warn("[NEWS] rate limited, returning cached", { requestId, symbol });
        return NextResponse.json(
          {
            success: true,
            data: cached.data,
            meta: {
              cached: true,
              degraded: true,
              message: "Brave Search rate limit reached; served cached news",
            },
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Brave Search rate limit reached. Try again later.",
            recoverable: true,
          },
        },
        { status: 429 }
      );
    }

    if (!response.ok) {
      console.warn("[NEWS] provider error", { requestId, symbol, status: response.status });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NEWS_ERROR",
            message: `News API request failed with status ${response.status}`,
            recoverable: true,
          },
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as BraveNewsResponse;
    const articles = (data?.results ?? []).map((result) => ({
      title: result.title,
      source: result.publisher?.name ?? "Unknown",
      publishedAt: result.published_date ?? new Date().toISOString(),
      url: result.url,
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
