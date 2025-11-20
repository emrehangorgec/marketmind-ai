import { BaseAgent } from "@/lib/agents/base-agent";
import {
  AgentError,
  FundamentalsSnapshot,
  FundamentalAnalysisPayload,
  MarketDataPayload,
} from "@/lib/types/analysis";

const SYSTEM_PROMPT = `You are MarketMind's CFA charterholder. Evaluate financial health objectively and benchmark against sector norms.`;

export class FundamentalAnalysisAgent extends BaseAgent<
  MarketDataPayload,
  FundamentalAnalysisPayload
> {
  constructor() {
    super("fundamental", SYSTEM_PROMPT);
  }

  async execute(input: MarketDataPayload): Promise<FundamentalAnalysisPayload> {
    this.updateStatus("working");
    await this.think("Interpreting key financial ratios");
    try {
      const prompt = this.buildPrompt(input.symbol, input.fundamentals);
      const raw = await this.callLLM(prompt, 500);
      const parsed = JSON.parse(raw) as FundamentalAnalysisPayload;
      this.result = parsed;
      this.updateStatus("completed");
      this.emit("result", parsed);
      return parsed;
    } catch (error) {
      const fallback = this.buildFallback(input.fundamentals);
      const agentError: AgentError = {
        code: "FUNDAMENTAL_FALLBACK",
        message: (error as Error)?.message ?? "Fundamental analysis fallback used",
        recoverable: true,
        agentName: this.name,
      };
      this.handleError(agentError);
      this.result = fallback;
      return fallback;
    }
  }

  private buildPrompt(symbol: string, fundamentals: FundamentalsSnapshot) {
    return `You are a fundamental analyst. Review this company's metrics and provide an assessment.

Stock: ${symbol}
Metrics: ${JSON.stringify(fundamentals, null, 2)}

Respond ONLY with valid JSON:
{
  "metrics": {...},
  "sectorComparison": {...},
  "valuation": "cheap|fairly valued|expensive",
  "growthPotential": "low|medium|high",
  "strengths": [],
  "weaknesses": [],
  "recommendation": "BUY|HOLD|SELL",
  "confidence": 0-1,
  "reasoning": "",
  "score": 0-10
}`;
  }

  private buildFallback(fundamentals: FundamentalsSnapshot): FundamentalAnalysisPayload {
    const metrics = fundamentals as FundamentalAnalysisPayload["metrics"];
    const pe = metrics.peRatio ?? 0;
    const valuation = pe < 15 ? "cheap" : pe < 30 ? "fairly valued" : "expensive";

    return {
      metrics,
      sectorComparison: {
        peSectorAvg: 20,
        peRelative:
          pe === 0 ? "n/a" : pe < 20 ? "below sector average" : "above sector average",
      },
      valuation,
      growthPotential: (metrics.revenuePerShare ?? 0) > 0 ? "high" : "medium",
      strengths: ["Automated fallback insights"],
      weaknesses: ["LLM unavailable"],
      recommendation: valuation === "cheap" ? "BUY" : "HOLD",
      confidence: 0.55,
      reasoning: "Fallback heuristic using P/E relative to sector average",
      score: valuation === "cheap" ? 7 : 6,
    };
  }
}
