import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

// Suppress the "yahooSurvey" notice which can cause issues in some environments
// yahooFinance.suppressNotices(['yahooSurvey']);

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

    console.info("[PRICE] fetching data (Yahoo Finance)", { requestId, symbol });

    // Fetch quote and historical data in parallel
    const [quote, chartResult] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.chart(symbol, {
        period1: "2023-01-01", 
        interval: "1d",
      }),
    ]);

    const history = chartResult.quotes;

    if (!quote) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SYMBOL_NOT_FOUND",
            message: "Unable to resolve symbol via Yahoo Finance",
            recoverable: true,
          },
        },
        { status: 404 }
      );
    }

    const currentPrice = quote.regularMarketPrice ?? 0;
    const previousClose = quote.regularMarketPreviousClose ?? 0;
    const priceChange = quote.regularMarketChange ?? 0;
    const priceChangePercent = quote.regularMarketChangePercent ?? 0;

    const historicalPrices = history
      .map((item) => ({
        date: item.date.toISOString().split("T")[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 120);

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
        symbol: symbol.toUpperCase(),
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
