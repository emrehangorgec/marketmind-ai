import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query";
const FINNHUB_URL = "https://finnhub.io/api/v1/quote";

type AlphaVantageDailyEntry = {
  "1. open"?: string;
  "2. high"?: string;
  "3. low"?: string;
  "4. close"?: string;
  "6. volume"?: string;
};

type AlphaVantageDailySeries = Record<string, AlphaVantageDailyEntry>;

export async function POST(request: Request) {
  try {
    const requestId = randomUUID();
    const startedAt = Date.now();
    const { symbol } = await request.json();
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SYMBOL", message: "Symbol is required", recoverable: true } },
        { status: 400 }
      );
    }

    const userKey = request.headers.get("x-alpha-key");
    const alphaKey = userKey || process.env.ALPHA_VANTAGE_KEY;
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || !alphaKey;

    if (useMock) {
      console.info("[PRICE] Using MOCK data", { symbol });
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate latency
      
      // Generate somewhat random but consistent-looking data based on symbol char codes
      const seed = symbol.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const basePrice = 100 + (seed % 200);
      const change = (seed % 10) - 5;
      
      return NextResponse.json({
        success: true,
        data: {
          currentPrice: basePrice,
          previousClose: basePrice - change,
          priceChange: change,
          priceChangePercent: (change / basePrice) * 100,
          historicalPrices: Array.from({ length: 30 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dailyVol = (Math.sin(i + seed) * 5);
            return {
              date: date.toISOString().split("T")[0],
              close: basePrice + dailyVol - (i * 0.5),
              volume: 1000000 + (seed * 1000) + (Math.random() * 500000),
            };
          }).reverse(),
        },
      });
    }

    if (!alphaKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_ALPHA_KEY",
            message: "Alpha Vantage key missing",
            recoverable: false,
          },
        },
        { status: 500 }
      );
    }

    console.info("[PRICE] fetching data", { requestId, symbol });
    const [quoteRes, historyRes] = await Promise.all([
      fetch(`${ALPHA_VANTAGE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${alphaKey}`, {
        next: { revalidate: 30 },
      }),
      fetch(
        `${ALPHA_VANTAGE_URL}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${alphaKey}`,
        { next: { revalidate: 3600 } }
      ),
    ]);

    const quoteJson = await quoteRes.json();
    const historyJson = await historyRes.json();

    if (quoteJson?.Note || historyJson?.Note) {
      console.warn("[PRICE] rate limited", { requestId, symbol });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Alpha Vantage rate limit reached. Try again in 1 minute.",
            recoverable: true,
          },
        },
        { status: 429 }
      );
    }

    const quote = quoteJson?.["Global Quote"] ?? {};
    let currentPrice = parseFloat(quote["05. price"] ?? "0");

    if (!currentPrice && process.env.FINNHUB_KEY) {
      const finnhubResponse = await fetch(
        `${FINNHUB_URL}?symbol=${encodeURIComponent(symbol)}&token=${process.env.FINNHUB_KEY}`
      );
      const finnhubJson = await finnhubResponse.json();
      if (finnhubJson?.c) {
        currentPrice = finnhubJson.c;
      }
    }

    if (!currentPrice) {
      const durationMs = Date.now() - startedAt;
      console.warn("[PRICE] symbol not found", { requestId, symbol, durationMs });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SYMBOL_NOT_FOUND",
            message: "Unable to resolve symbol",
            recoverable: true,
          },
        },
        { status: 404 }
      );
    }

    const previousClose = parseFloat(quote["08. previous close"] ?? "0");
    const priceChange = parseFloat(quote["09. change"] ?? "0");
    const priceChangePercent = parseFloat(quote["10. change percent"]?.replace("%", "") ?? "0");

    const series: AlphaVantageDailySeries = historyJson?.["Time Series (Daily)"] ?? {};
    const historicalPrices = Object.entries(series)
      .slice(0, 120)
      .map(([date, values]) => ({
        date,
        open: parseFloat(values["1. open"] ?? "0"),
        high: parseFloat(values["2. high"] ?? "0"),
        low: parseFloat(values["3. low"] ?? "0"),
        close: parseFloat(values["4. close"] ?? "0"),
        volume: parseInt(values["6. volume"] ?? "0", 10),
      }));

    const durationMs = Date.now() - startedAt;
    console.info("[PRICE] success", {
      requestId,
      symbol,
      durationMs,
      historyPoints: historicalPrices.length,
    });
    return NextResponse.json({
      success: true,
      data: {
        symbol,
        currentPrice,
        previousClose,
        priceChange,
        priceChangePercent,
        historicalPrices,
      },
    });
  } catch (error) {
    console.error("[PRICE] unexpected error", { error });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRICE_ROUTE_ERROR",
          message: (error as Error)?.message ?? "Unable to fetch price data",
          recoverable: true,
        },
      },
      { status: 500 }
    );
  }
}
