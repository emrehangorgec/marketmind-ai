import { BaseAgent } from "@/lib/agents/base-agent";
import { MarketDataService } from "@/lib/services/market-data";
import {
  AgentError,
  MarketDataPayload,
} from "@/lib/types/analysis";

export class MarketDataAgent extends BaseAgent<string, MarketDataPayload> {
  constructor() {
    super(
      "marketData",
      "You are the Market Data Agent for MarketMind. Gather precise, actionable market data."
    );
  }

  async execute(symbol: string): Promise<MarketDataPayload> {
    this.updateStatus("working");
    await this.think(`Collecting price, fundamentals, and news for ${symbol}`);
    
    try {
      const [priceData, fundamentals, news] = await Promise.all([
        MarketDataService.getPrice(symbol),
        MarketDataService.getFundamentals(symbol),
        MarketDataService.getNews(symbol)
      ]);

      const payload: MarketDataPayload = {
        symbol,
        currentPrice: priceData.price,
        previousClose: priceData.previousClose,
        priceChange: priceData.change,
        priceChangePercent: priceData.changePercent,
        historicalPrices: priceData.historical,
        fundamentals,
        news,
        fetchedAt: Date.now(),
      };

      this.result = payload;
      this.updateStatus("completed");
      this.emit("result", payload);
      return payload;

    } catch (error) {
      const err = error as Error;
      const agentError: AgentError = {
        code: "MARKET_DATA_ERROR",
        message: err.message || "Failed to fetch market data",
        recoverable: true,
        agentName: this.name,
      };
      this.error = agentError;
      this.updateStatus("error");
      throw agentError;
    }
  }
}
