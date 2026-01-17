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
    const compactMarketData = this.summarizeMarketData(input.marketData);
    const compactTechnical = {
      indicators: input.technical.indicators,
      trend: input.technical.trend,
      trendStrength: input.technical.trendStrength,
      support: input.technical.support?.slice(0, 5),
      resistance: input.technical.resistance?.slice(0, 5),
      signals: input.technical.signals?.slice(0, 8),
      recommendation: input.technical.recommendation,
      confidence: input.technical.confidence,
      score: input.technical.score,
      reasoning: input.technical.reasoning,
    };
    const compactFundamental = {
      metrics: input.fundamental.metrics,
      sectorComparison: input.fundamental.sectorComparison,
      valuation: input.fundamental.valuation,
      growthPotential: input.fundamental.growthPotential,
      strengths: input.fundamental.strengths?.slice(0, 6),
      weaknesses: input.fundamental.weaknesses?.slice(0, 6),
      recommendation: input.fundamental.recommendation,
      confidence: input.fundamental.confidence,
      score: input.fundamental.score,
      reasoning: input.fundamental.reasoning,
    };
    const compactSentiment = {
      overallSentiment: input.sentiment.overallSentiment,
      sentimentScore: input.sentiment.sentimentScore,
      keyThemes: input.sentiment.keyThemes?.slice(0, 6),
      risks: input.sentiment.risks?.slice(0, 6),
      catalysts: input.sentiment.catalysts?.slice(0, 6),
      marketMood: input.sentiment.marketMood,
      newsCount: input.sentiment.newsCount,
      positiveCount: input.sentiment.positiveCount,
      negativeCount: input.sentiment.negativeCount,
      neutralCount: input.sentiment.neutralCount,
      reasoning: input.sentiment.reasoning,
      score: input.sentiment.score,
    };
    const compactRisk = {
      riskScore: input.risk.riskScore,
      riskLevel: input.risk.riskLevel,
      volatility: input.risk.volatility,
      beta: input.risk.beta,
      maxDrawdownEstimate: input.risk.maxDrawdownEstimate,
      recommendedPositionSize: input.risk.recommendedPositionSize,
      stopLossLevel: input.risk.stopLossLevel,
      keyRisks: input.risk.keyRisks?.slice(0, 6),
      mitigationStrategies: input.risk.mitigationStrategies?.slice(0, 6),
      reasoning: input.risk.reasoning,
      score: input.risk.score,
    };

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
  "fullReport": "A comprehensive, beautifully formatted Markdown report. Structure it exactly as follows:\n\n# [Symbol] Investment Analysis Report\n\n## 1. Executive Summary\n[Provide a high-level synthesis of the investment thesis. Is it a growth play, a value trap, or a momentum trade?]\n\n## 2. Market Pulse\n- **Current Price:** [Price]\n- **24h Change:** [Change%]\n- **Volume:** [Volume]\n\n## 3. Technical Deep Dive\n[Analyze the trend, key moving averages, RSI, MACD, and chart patterns. Identify major Support and Resistance levels. **Bold key numbers and percentages ONLY when they appear in paragraphs. Do NOT bold values in lists or key-value pairs.**]\n\n## 4. Fundamental Health\n[Discuss valuation ratios (P/E, P/S), revenue growth, margins, and overall financial stability. **Bold key financial metrics and ratios ONLY in paragraphs. Do NOT bold values in lists.**]\n\n## 5. Sentiment & News\n[Summarize the market mood. Are news headlines positive or negative? What is the social sentiment?]\n\n## 6. Risk Assessment\n[Highlight the primary risks: Volatility, market beta, sector risks, or specific company headwinds. **Bold any risk scores or probability percentages ONLY in paragraphs.**]\n\n## 7. Bull & Bear Scenarios\n- **Bull Case:** [What needs to happen for the price to go up?]\n- **Bear Case:** [What could cause the price to drop?]\n\n## 8. Final Verdict\n[Summarize the composite score and the rationale behind the final rating.]\n\n---\n*Disclaimer: This report is generated by AI for informational purposes only and does not constitute financial advice.*"
}

Market Data: ${JSON.stringify(compactMarketData)}
Technical: ${JSON.stringify(compactTechnical)}
Fundamental: ${JSON.stringify(compactFundamental)}
Sentiment: ${JSON.stringify(compactSentiment)}
Risk: ${JSON.stringify(compactRisk)}`;
  }

  private summarizeMarketData(data: MarketDataPayload) {
    const recent = data.historicalPrices?.slice(-30) ?? [];
    const lastBar = recent[recent.length - 1] ?? data.historicalPrices?.[data.historicalPrices.length - 1];
    const high30 = recent.length ? Math.max(...recent.map((bar) => bar.high)) : undefined;
    const low30 = recent.length ? Math.min(...recent.map((bar) => bar.low)) : undefined;
    const avgVol30 = recent.length
      ? Math.round(recent.reduce((sum, bar) => sum + bar.volume, 0) / recent.length)
      : undefined;

    const news = (data.news ?? []).slice(0, 5).map((item) => ({
      title: item.title,
      source: item.source,
      publishedAt: item.publishedAt,
      sentiment: item.sentiment ?? "neutral",
    }));

    return {
      symbol: data.symbol,
      currentPrice: data.currentPrice,
      previousClose: data.previousClose,
      priceChange: data.priceChange,
      priceChangePercent: data.priceChangePercent,
      lastClose: lastBar?.close,
      lastVolume: lastBar?.volume,
      range30d: high30 && low30 ? { high: high30, low: low30 } : undefined,
      avgVolume30d: avgVol30,
      fundamentals: data.fundamentals,
      news,
      fetchedAt: data.fetchedAt,
    };
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
