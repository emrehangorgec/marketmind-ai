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

    console.info("[FUNDAMENTALS] fetching data (Yahoo Finance)", { requestId, symbol });

    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: ["summaryDetail", "defaultKeyStatistics", "financialData", "assetProfile"],
    });

    if (!summary) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATA_UNAVAILABLE",
            message: "Unable to load fundamentals for symbol via Yahoo Finance",
            recoverable: true,
          },
        },
        { status: 404 }
      );
    }

    const stats = summary.defaultKeyStatistics;
    const finance = summary.financialData;
    const profile = summary.assetProfile;
    const detail = summary.summaryDetail;

    console.info("[FUNDAMENTALS] success", {
      requestId,
      symbol,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({
      success: true,
      data: {
        marketCap: detail?.marketCap ?? 0,
        peRatio: detail?.trailingPE ?? detail?.forwardPE ?? 0,
        eps: stats?.trailingEps ?? stats?.forwardEps ?? 0,
        pbRatio: stats?.priceToBook ?? 0,
        dividendYield: (detail?.dividendYield ?? 0) * 100,
        revenuePerShare: finance?.revenuePerShare ?? 0,
        profitMargin: finance?.profitMargins ?? 0,
        sector: profile?.sector ?? "Unknown",
        roe: finance?.returnOnEquity ?? 0,
        debtToEquity: finance?.debtToEquity ?? 0,
        beta: detail?.beta ?? 0,
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
