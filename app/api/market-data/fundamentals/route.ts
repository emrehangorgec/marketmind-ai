import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { MarketDataService } from "@/lib/services/market-data";

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

    console.info("[FUNDAMENTALS] fetching data (MarketDataService)", { requestId, symbol });

    const data = await MarketDataService.getFundamentals(symbol);

    console.info("[FUNDAMENTALS] success", {
      requestId,
      symbol,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({
      success: true,
      data: {
        marketCap: data.marketCap ?? 0,
        peRatio: data.peRatio ?? 0,
        eps: data.eps ?? 0,
        pbRatio: data.pbRatio ?? 0,
        dividendYield: (data.dividendYield ?? 0) * 100,
        revenuePerShare: data.revenuePerShare ?? 0,
        profitMargin: data.profitMargin ?? 0,
        sector: data.sector ?? "Unknown",
        roe: data.roe ?? 0,
        debtToEquity: data.debtToEquity ?? 0,
        beta: data.beta ?? 0,
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
