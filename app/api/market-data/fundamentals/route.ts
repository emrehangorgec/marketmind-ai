import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query";

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
    const apiKey = userKey || process.env.ALPHA_VANTAGE_KEY;
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || !apiKey;

    if (useMock) {
      console.info("[FUNDAMENTALS] Using MOCK data", { symbol });
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      return NextResponse.json({
        success: true,
        data: {
          marketCap: 2500000000000,
          peRatio: 28.5,
          eps: 6.4,
          beta: 1.2,
          sector: "Technology",
          industry: "Consumer Electronics",
          description: `Mock description for ${symbol}. This is a leading technology company known for its innovative products and services.`,
        },
      });
    }

    if (!apiKey) {
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

    console.info("[FUNDAMENTALS] fetching data", { requestId, symbol });
    const response = await fetch(
      `${ALPHA_VANTAGE_URL}?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    const data = await response.json();

    if (data?.Note) {
      console.warn("[FUNDAMENTALS] rate limited", { requestId, symbol });
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

    if (!data?.Symbol) {
      console.warn("[FUNDAMENTALS] data unavailable", { requestId, symbol, responseStatus: response.status });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATA_UNAVAILABLE",
            message: "Unable to load fundamentals for symbol",
            recoverable: true,
          },
        },
        { status: 404 }
      );
    }

    console.info("[FUNDAMENTALS] success", {
      requestId,
      symbol,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({
      success: true,
      data: {
        marketCap: parseFloat(data.MarketCapitalization ?? "0"),
        peRatio: parseFloat(data.PERatio ?? "0"),
        eps: parseFloat(data.EPS ?? "0"),
        pbRatio: parseFloat(data.PriceToBookRatio ?? data.PriceToBook ?? "0"),
        dividendYield: parseFloat(data.DividendYield ?? "0") * 100,
        revenuePerShare: parseFloat(data.RevenuePerShareTTM ?? "0"),
        profitMargin: parseFloat(data.ProfitMargin ?? "0"),
        sector: data.Sector,
        roe: parseFloat(data.ReturnOnEquityTTM ?? "0"),
        debtToEquity: parseFloat(data.DebtToEquityRatio ?? "0"),
        beta: parseFloat(data.Beta ?? "0"),
      },
    });
  } catch (error) {
    console.error("[FUNDAMENTALS] unexpected error", { error });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FUNDAMENTAL_ROUTE_ERROR",
          message: (error as Error)?.message ?? "Unable to fetch fundamentals",
          recoverable: true,
        },
      },
      { status: 500 }
    );
  }
}
