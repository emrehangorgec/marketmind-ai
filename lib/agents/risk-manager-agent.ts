import { BaseAgent } from "@/lib/agents/base-agent";
import {
  AgentError,
  MarketDataPayload,
  RiskAnalysisPayload,
  SentimentAnalysisPayload,
  TechnicalAnalysisPayload,
} from "@/lib/types/analysis";
import { calculateMaxDrawdown, calculateVolatility } from "@/lib/utils/indicators";

export interface RiskAgentInput {
  marketData: MarketDataPayload;
  technical: TechnicalAnalysisPayload;
  sentiment: SentimentAnalysisPayload;
}

export class RiskManagerAgent extends BaseAgent<RiskAgentInput, RiskAnalysisPayload> {
  constructor() {
    super(
      "risk",
      "You are a disciplined risk manager. Quantify downside scenarios and recommend defensive actions.",
      "gpt-4o-mini" // Stick to GPT-4o-mini for math/logic heavy tasks
    );
  }

  async execute(input: RiskAgentInput): Promise<RiskAnalysisPayload> {
    this.updateStatus("working");
    await this.think("Evaluating volatility, drawdowns, and concentration risk");
    try {
      if (input.marketData.historicalPrices.length < 2) {
        throw new Error("Insufficient historical data for risk analysis");
      }

      const volatility = calculateVolatility(input.marketData.historicalPrices);
      const maxDrawdown = calculateMaxDrawdown(input.marketData.historicalPrices);
      const sentimentDrag =
        input.sentiment.overallSentiment === "negative" ? 0.1 : 0;
      
      // Adjusted formula to be less sensitive to drawdown
      // Volatility is ~0.2-0.5 (20-50%), MaxDrawdown is ~10-50 (10-50%)
      // Old formula: volatility * 10 + maxDrawdown / 2
      // New formula: volatility * 8 + maxDrawdown / 10
      const riskScore = Math.min(10, (volatility * 8 + maxDrawdown / 10 + sentimentDrag * 5));
      
      const riskLevel = riskScore > 7 ? "high" : riskScore > 4 ? "medium" : "low";
      const stopLossLevel =
        input.technical.support[0] ?? input.marketData.currentPrice * 0.9;

      const payload: RiskAnalysisPayload = {
        riskScore: +riskScore.toFixed(1),
        riskLevel,
        volatility: +volatility.toFixed(3),
        beta: input.marketData.fundamentals.beta ?? null,
        maxDrawdownEstimate: `${maxDrawdown.toFixed(2)}%`,
        recommendedPositionSize:
          riskLevel === "high" ? "2% of portfolio" : riskLevel === "medium" ? "5%" : "8%",
        stopLossLevel: +stopLossLevel.toFixed(2),
        keyRisks: [
          riskLevel === "high" ? "Elevated volatility" : "Moderate price swings",
          "Market correlation risk",
        ],
        mitigationStrategies: [
          "Diversify across sectors",
          "Use trailing stop-loss",
        ],
        reasoning: "Risk quantified using realized volatility, drawdown, and sentiment",
        score: +(10 - riskScore).toFixed(1),
      };

      this.result = payload;
      this.updateStatus("completed");
      this.emit("result", payload);
      return payload;
    } catch (error) {
      const fallback = this.buildFallback(input);
      const agentError: AgentError = {
        code: "RISK_ERROR",
        message: (error as Error)?.message ?? "Unable to compute risk metrics",
        recoverable: true,
        agentName: this.name,
      };
      this.handleError(agentError);
      this.result = fallback;
      return fallback;
    }
  }

  private buildFallback(input: RiskAgentInput): RiskAnalysisPayload {
    return {
      riskScore: 5,
      riskLevel: "medium",
      volatility: 0,
      beta: input.marketData.fundamentals.beta ?? 1,
      maxDrawdownEstimate: "N/A",
      recommendedPositionSize: "5%",
      stopLossLevel: input.marketData.currentPrice * 0.95,
      keyRisks: ["Insufficient data for risk calculation"],
      mitigationStrategies: ["Use standard position sizing", "Monitor closely"],
      reasoning: "Fallback due to missing historical data",
      score: 5,
    };
  }
}
