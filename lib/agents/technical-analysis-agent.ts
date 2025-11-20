import { BaseAgent } from "@/lib/agents/base-agent";
import {
  MarketDataPayload,
  TechnicalAnalysisPayload,
  AgentError,
} from "@/lib/types/analysis";
import {
  calculateBollingerBands,
  calculateMACD,
  calculateRSI,
  calculateSMA,
} from "@/lib/utils/indicators";

const SYSTEM_PROMPT = `You are MarketMind's senior technical analysis expert. You interpret price action and indicators, respond with concise, data-backed insights, and never Hallucinate.`;

export class TechnicalAnalysisAgent extends BaseAgent<
  MarketDataPayload,
  TechnicalAnalysisPayload
> {
  constructor() {
    super("technical", SYSTEM_PROMPT);
  }

  async execute(input: MarketDataPayload): Promise<TechnicalAnalysisPayload> {
    this.updateStatus("working");
    await this.think("Crunching indicators for technical outlook");
    try {
      const indicators = this.buildIndicators(input);
      const prompt = this.buildPrompt(input.symbol, input.currentPrice, indicators, input);
      const llmResponse = await this.safeCallLLM(prompt);
      const payload = {
        indicators,
        ...llmResponse,
      } satisfies TechnicalAnalysisPayload;
      this.result = payload;
      this.updateStatus("completed");
      this.emit("result", payload);
      return payload;
    } catch (error) {
      const fallback = this.buildFallback(input);
      const agentError: AgentError = {
        code: "TECH_ANALYSIS_FALLBACK",
        message: (error as Error)?.message ?? "Technical analysis fallback used",
        recoverable: true,
        agentName: this.name,
      };
      this.handleError(agentError);
      this.result = fallback;
      return fallback;
    }
  }

  private buildIndicators(input: MarketDataPayload) {
    const { historicalPrices } = input;
    return {
      rsi: calculateRSI(historicalPrices),
      macd: calculateMACD(historicalPrices),
      sma20: calculateSMA(historicalPrices, 20),
      sma50: calculateSMA(historicalPrices, 50),
      sma200: calculateSMA(historicalPrices, 200),
      bollingerBands: calculateBollingerBands(historicalPrices),
    };
  }

  private buildPrompt(
    symbol: string,
    price: number,
    indicators: TechnicalAnalysisPayload["indicators"],
    input: MarketDataPayload
  ) {
    const recent = input.historicalPrices
      .slice(0, 30)
      .map((bar) => `${bar.date}: close=${bar.close}`)
      .join("\n");

    return `You are an expert technical analyst. Analyze this stock data and provide insights.
Stock: ${symbol}
Current Price: $${price.toFixed(2)}

Technical Indicators:
- RSI(14): ${indicators.rsi ?? "n/a"}
- MACD: ${JSON.stringify(indicators.macd ?? {})}
- SMA(20): ${indicators.sma20 ?? "n/a"}, SMA(50): ${indicators.sma50 ?? "n/a"}, SMA(200): ${
      indicators.sma200 ?? "n/a"
    }
- Bollinger Bands: ${JSON.stringify(indicators.bollingerBands ?? {})}

Recent Price Action (last 30 days):
${recent}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "trend": "bullish|bearish|neutral",
  "trendStrength": "weak|moderate|strong",
  "signals": ["array of identified signals"],
  "support": [price levels],
  "resistance": [price levels],
  "recommendation": "BUY|HOLD|SELL",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "score": 0-10
}
`;
  }

  private async safeCallLLM(prompt: string) {
    try {
      const text = await this.callLLM(prompt, 500);
      return JSON.parse(text) as Omit<
        TechnicalAnalysisPayload,
        "indicators"
      >;
    } catch (error) {
      throw new Error((error as Error).message ?? "LLM parsing error");
    }
  }

  private buildFallback(input: MarketDataPayload): TechnicalAnalysisPayload {
    const indicators = this.buildIndicators(input);
    const price = input.currentPrice;
    const priceVsSma50 =
      indicators.sma50 && price > indicators.sma50 ? "above" : "below";
    return {
      indicators,
      trend: priceVsSma50 === "above" ? "bullish" : "neutral",
      trendStrength: "moderate",
      support: [input.historicalPrices[0]?.close ?? price],
      resistance: [price * 1.05],
      signals: [
        priceVsSma50 === "above"
          ? "Price trading above SMA50"
          : "Price consolidating near SMA50",
      ],
      recommendation: priceVsSma50 === "above" ? "BUY" : "HOLD",
      confidence: 0.6,
      reasoning: "Fallback heuristic based on moving averages",
      score: priceVsSma50 === "above" ? 7 : 5,
    };
  }
}
