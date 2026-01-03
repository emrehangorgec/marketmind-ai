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

    console.info("[NEWS] fetching data (MarketDataService)", { requestId, symbol });

    const articles = await MarketDataService.getNews(symbol);

    console.info("[NEWS] success", {
      requestId,
      symbol,
      durationMs: Date.now() - startedAt,
      articles: articles.length,
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
