import { BaseAgent } from "@/lib/agents/base-agent";
import { cleanAndParseJSON } from "@/lib/utils/json";
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
      "You synthesize findings from every agent into a single executive report and recommendation.",
      "gpt-4o-mini" // GPT-4o-mini is great for long context synthesis
    );
  }

  async execute(input: ReportAgentInput): Promise<ReportPayload> {
    this.updateStatus("working");
    await this.think("Combining agent findings into final recommendation");
    let text = "";
    try {
      const prompt = this.buildPrompt(input);
      // Increased token limit to prevent JSON truncation
      text = await this.callLLM(prompt, 2500);
      const parsed = cleanAndParseJSON<ReportPayload>(text);
      this.result = parsed;
      this.updateStatus("completed");
      this.emit("result", parsed);
      return parsed;
    } catch (error) {
      console.error("Report Generation Failed:", error);
      if (text) console.error("Raw LLM Response:", text);
      
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
    return `You are the Chief Investment Officer and "MarketMind Analyst". Review each agent's outputs and respond with strict JSON matching the schema below.

CRITICAL ETHICAL & SAFETY GUIDELINES:
1. NO FINANCIAL ADVICE: Never explicitly tell the user to "Buy", "Sell", or "Short" in the text.
2. NEUTRAL LANGUAGE: Use professional terms like "Bullish Outlook", "Bearish Signals", "Accumulation Zone", "Overbought Conditions".
3. DISCLAIMER: Always imply that this is an AI-generated analysis based on historical data.
4. DATA GAPS: If data is missing, state "Insufficient Data" clearly; do not hallucinate numbers.

JSON Schema:
{
  "finalRecommendation": "BUY|HOLD|SELL",
  "overallConfidence": 0-1,
  "compositeScore": 0-10,
  "executiveSummary": "Executive summary of the analysis (max 3 sentences). Use educational tone.",
  "agentConsensus": {"agreement": "low|medium|high", "conflictingAgents": [], "consensus": "BUY|HOLD|SELL"},
  "keyInsights": [],
  "actionItems": ["Educational points to watch", "Key levels to monitor"],
  "fullReport": "markdown formatted report. Include a disclaimer section."
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
