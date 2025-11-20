import { BaseAgent } from "@/lib/agents/base-agent";
import { fetchWithRetry } from "@/lib/utils/http";
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
      const [priceRes, fundamentalsRes, newsRes] = await Promise.all([
        fetchWithRetry("/api/market-data/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol }),
        }),
        fetchWithRetry("/api/market-data/fundamentals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol }),
        }),
        fetchWithRetry("/api/market-data/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol, days: 7 }),
        }),
      ]);

      const priceJson = await priceRes.json();
      const fundamentalsJson = await fundamentalsRes.json();
      const newsJson = await newsRes.json();

      if (!priceJson.success) throw priceJson.error;
      if (!fundamentalsJson.success) throw fundamentalsJson.error;
      if (!newsJson.success) throw newsJson.error;

      const payload: MarketDataPayload = {
        symbol,
        currentPrice: priceJson.data.currentPrice,
        previousClose: priceJson.data.previousClose,
        priceChange: priceJson.data.priceChange,
        priceChangePercent: priceJson.data.priceChangePercent,
        historicalPrices: priceJson.data.historicalPrices,
        fundamentals: fundamentalsJson.data,
        news: newsJson.data,
        fetchedAt: Date.now(),
      };

      this.result = payload;
      this.updateStatus("completed");
      this.emit("result", payload);
      return payload;
    } catch (error) {
      const agentError: AgentError = {
        code: (error as AgentError)?.code ?? "MARKET_DATA_ERROR",
        message:
          (error as AgentError)?.message ?? "Unable to fetch market data at this time.",
        recoverable: true,
        agentName: this.name,
      };
      this.handleError(agentError);
      throw agentError;
    }
  }
}
