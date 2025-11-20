import { BaseAgent } from "@/lib/agents/base-agent";
import {
  AgentError,
  FundamentalAnalysisPayload,
  MarketDataPayload,
  ReportPayload,
  RiskAnalysisPayload,
  SentimentAnalysisPayload,
  TechnicalAnalysisPayload,
} from "@/lib/types/analysis";

export interface ReportAgentInput {
  marketData: MarketDataPayload;
  technical: TechnicalAnalysisPayload;
  fundamental: FundamentalAnalysisPayload;
  sentiment: SentimentAnalysisPayload;
  risk: RiskAnalysisPayload;
}

export class ReportGeneratorAgent extends BaseAgent<ReportAgentInput, ReportPayload> {
  constructor() {
    super(
      "reporter",
      "You synthesize findings from every agent into a single executive report and recommendation."
    );
  }

  async execute(input: ReportAgentInput): Promise<ReportPayload> {
    this.updateStatus("working");
    await this.think("Combining agent findings into final recommendation");
    try {
      const prompt = this.buildPrompt(input);
      const text = await this.callLLM(prompt, 600);
      const parsed = JSON.parse(text) as ReportPayload;
      this.result = parsed;
      this.updateStatus("completed");
      this.emit("result", parsed);
      return parsed;
    } catch (error) {
      const fallback = this.buildFallback(input);
      const agentError: AgentError = {
        code: "REPORT_FALLBACK",
        message: (error as Error)?.message ?? "Generated fallback report",
        recoverable: true,
        agentName: this.name,
      };
      this.handleError(agentError);
      this.result = fallback;
      return fallback;
    }
  }

  private buildPrompt(input: ReportAgentInput) {
    return `You are the Chief Investment Officer. Review each agent's outputs and respond with strict JSON matching:
{
  "finalRecommendation": "BUY|HOLD|SELL",
  "overallConfidence": 0-1,
  "compositeScore": 0-10,
  "executiveSummary": "",
  "agentConsensus": {"agreement": "low|medium|high", "conflictingAgents": [], "consensus": "BUY|HOLD|SELL"},
  "keyInsights": [],
  "actionItems": [],
  "fullReport": "markdown"
}

Market Data: ${JSON.stringify(input.marketData)}
Technical: ${JSON.stringify(input.technical)}
Fundamental: ${JSON.stringify(input.fundamental)}
Sentiment: ${JSON.stringify(input.sentiment)}
Risk: ${JSON.stringify(input.risk)}`;
  }

  private buildFallback(input: ReportAgentInput): ReportPayload {
    const scores = [
      input.technical.score,
      input.fundamental.score,
      input.sentiment.score,
      input.risk.score,
    ];
    const composite = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const finalRecommendation = composite > 6.5 ? "BUY" : composite > 5 ? "HOLD" : "SELL";

    return {
      finalRecommendation,
      overallConfidence: 0.6,
      compositeScore: +composite.toFixed(1),
      executiveSummary: "Fallback synthesis leveraging agent scores.",
      agentConsensus: {
        agreement: "medium",
        conflictingAgents: [],
        consensus: finalRecommendation,
      },
      keyInsights: [
        `Technical score: ${input.technical.score}`,
        `Fundamental score: ${input.fundamental.score}`,
        `Sentiment score: ${input.sentiment.score}`,
      ],
      actionItems: [
        "Monitor key support levels",
        "Review risk limits before entry",
      ],
      fullReport: `# Investment Analysis Report\n\n- Composite Score: ${composite.toFixed(
        1
      )}\n- Recommendation: ${finalRecommendation}\n\nThis report was generated using fallback heuristics due to an upstream LLM issue.`,
    };
  }
}
