import { BaseAgent } from "@/lib/agents/base-agent";
import {
  AgentError,
  MarketDataPayload,
  NewsHeadline,
  SentimentAnalysisPayload,
} from "@/lib/types/analysis";

const SYSTEM_PROMPT = `You evaluate financial news sentiment. Stay objective, score consistently, and identify catalysts and risks.`;

export class SentimentAnalysisAgent extends BaseAgent<
  MarketDataPayload,
  SentimentAnalysisPayload
> {
  constructor() {
    super("sentiment", SYSTEM_PROMPT);
  }

  async execute(input: MarketDataPayload): Promise<SentimentAnalysisPayload> {
    this.updateStatus("working");
    await this.think("Reviewing latest news for sentiment signals");
    try {
      const prompt = this.buildPrompt(input.symbol, input.news);
      const raw = await this.callLLM(prompt, 400);
      const parsed = JSON.parse(raw) as SentimentAnalysisPayload;
      this.result = parsed;
      this.updateStatus("completed");
      this.emit("result", parsed);
      return parsed;
    } catch (error) {
      const fallback = this.buildFallback(input.news);
      const agentError: AgentError = {
        code: "SENTIMENT_FALLBACK",
        message: (error as Error)?.message ?? "Sentiment fallback used",
        recoverable: true,
        agentName: this.name,
      };
      this.handleError(agentError);
      this.result = fallback;
      return fallback;
    }
  }

  private buildPrompt(symbol: string, news: NewsHeadline[]) {
    const formatted = news
      .slice(0, 20)
      .map((item) => `- ${item.title} (${item.source}, ${item.publishedAt})`)
      .join("\n");

    return `You are a financial sentiment analyst. Analyze these news headlines.
Stock: ${symbol}

News Headlines (last 7 days):
${formatted}

Respond ONLY with valid JSON (no markdown):
{
  "overallSentiment": "positive|negative|neutral",
  "sentimentScore": 0-10,
  "keyThemes": [],
  "risks": [],
  "catalysts": [],
  "marketMood": "fearful|cautious|neutral|optimistic|greedy",
  "newsCount": number,
  "positiveCount": number,
  "negativeCount": number,
  "neutralCount": number,
  "reasoning": "",
  "score": 0-10
}`;
  }

  private buildFallback(news: NewsHeadline[]): SentimentAnalysisPayload {
    const count = news.length;
    return {
      overallSentiment: "neutral",
      sentimentScore: 5,
      keyThemes: ["Insufficient sentiment data"],
      risks: ["Awaiting LLM insights"],
      catalysts: [],
      marketMood: "neutral",
      newsCount: count,
      positiveCount: Math.floor(count * 0.3),
      negativeCount: Math.floor(count * 0.2),
      neutralCount: count - Math.floor(count * 0.5),
      reasoning: "Fallback heuristic used",
      score: 5,
    };
  }
}
