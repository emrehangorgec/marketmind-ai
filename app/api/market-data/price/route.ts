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

    console.info("[PRICE] fetching data (MarketDataService)", { requestId, symbol });

    const data = await MarketDataService.getPrice(symbol);

    const historicalPrices = data.historical
      .map((item) => ({
        date: item.date.split("T")[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }))
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
        currentPrice: data.price,
        previousClose: data.previousClose,
        priceChange: data.change,
        priceChangePercent: data.changePercent,
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
