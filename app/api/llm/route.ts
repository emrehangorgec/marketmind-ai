import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const DEFAULT_MODEL = "gpt-4o-mini";

// Simple in-memory token tracker (resets on server restart)
let totalSessionTokens = {
  prompt: 0,
  completion: 0,
  total: 0,
  cost: 0
};

// GPT-4o-mini pricing (as of late 2024)
const PRICING = {
  input: 0.15 / 1_000_000, // $0.15 per 1M tokens
  output: 0.60 / 1_000_000 // $0.60 per 1M tokens
};

type ChatRole = "system" | "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface LLMRequestPayload {
  messages: ChatMessage[];
  maxTokens: number;
  temperature: number;
  model: string;
  requestId: string;
}

interface ProviderErrorInfo {
  code: string;
  message: string;
  recoverable: boolean;
  status: number;
}

class ProviderError extends Error {
  info: ProviderErrorInfo;

  constructor(info: ProviderErrorInfo) {
    super(info.message);
    this.name = "ProviderError";
    this.info = info;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      messages,
      systemPrompt,
      maxTokens = 500,
      temperature = 0.2,
      model: overrideModel,
    } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PAYLOAD",
            message: "Messages array is required",
            recoverable: true,
          },
        },
        { status: 400 }
      );
    }

    const userApiKey = request.headers.get("x-openai-api-key");
    const apiKey = userApiKey || process.env.OPENAI_API_KEY;
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || !apiKey;

    if (useMock) {
      console.info("[LLM] Using MOCK response");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const lastMessage = messages[messages.length - 1]?.content || "";
      const sysPrompt = systemPrompt || "";
      
      let mockContent = "";

      if (sysPrompt.includes("technical analysis expert")) {
        mockContent = JSON.stringify({
          trend: "bullish",
          trendStrength: "strong",
          signals: ["Golden Cross", "RSI Oversold"],
          support: [145.50, 142.00],
          resistance: [155.00, 160.00],
          recommendation: "BUY",
          confidence: 0.85,
          reasoning: "Mock technical analysis suggests strong bullish momentum with price above key moving averages.",
          score: 8
        });
      } else if (sysPrompt.includes("CFA charterholder")) {
        mockContent = JSON.stringify({
          metrics: { peRatio: 15.5, pbRatio: 2.1, debtToEquity: 0.5, roe: 0.18, profitMargin: 0.12 },
          sectorComparison: { peSectorAvg: 18.0, peRelative: "undervalued" },
          valuation: "undervalued",
          growthPotential: "high",
          strengths: ["Strong revenue growth", "Healthy margins"],
          weaknesses: ["High competition"],
          recommendation: "BUY",
          confidence: 0.8,
          reasoning: "Solid fundamentals with undervaluation relative to sector.",
          score: 8
        });
      } else if (sysPrompt.includes("financial news sentiment")) {
        mockContent = JSON.stringify({
          overallSentiment: "positive",
          sentimentScore: 0.75,
          keyThemes: ["Growth", "Innovation"],
          risks: ["Regulatory changes"],
          catalysts: ["Product launch"],
          marketMood: "optimistic",
          newsCount: 10,
          positiveCount: 7,
          negativeCount: 1,
          neutralCount: 2,
          reasoning: "News sentiment is generally positive following recent product announcements.",
          score: 8
        });
      } else if (sysPrompt.includes("disciplined risk manager")) {
        mockContent = JSON.stringify({
          riskScore: 4.5,
          riskLevel: "medium",
          volatility: 0.025,
          beta: 1.1,
          maxDrawdownEstimate: "12.5%",
          recommendedPositionSize: "5%",
          stopLossLevel: 142.00,
          keyRisks: ["Market volatility", "Sector rotation"],
          mitigationStrategies: ["Diversify", "Use stop loss"],
          reasoning: "Moderate risk profile with acceptable volatility.",
          score: 6
        });
      } else if (sysPrompt.includes("synthesize findings")) {
        mockContent = JSON.stringify({
          finalRecommendation: "BUY",
          overallConfidence: 0.85,
          compositeScore: 8.2,
          executiveSummary: "This is a **MOCK REPORT** generated for demonstration purposes. The analysis indicates a positive outlook based on simulated data.",
          agentConsensus: {
            agreement: "high",
            conflictingAgents: [],
            consensus: "BUY"
          },
          keyInsights: ["Strong technical momentum", "Solid fundamentals", "Positive sentiment"],
          actionItems: ["Enter long position", "Set stop loss at 142.00"],
          fullReport: "# MarketMind Analysis Report\n\n## Executive Summary\nThis is a **MOCK REPORT** generated for demonstration purposes. The analysis indicates a positive outlook based on simulated data.\n\n## Technical Outlook\nBullish trend observed with key indicators flashing buy signals.\n\n## Fundamental Health\nStrong balance sheet and consistent revenue growth support the bullish thesis.\n\n## Risk Assessment\nModerate risk level. Recommended stop loss at $142.00.\n\n## Conclusion\n**BUY** recommendation with a target of $165.00."
        });
      } else {
        mockContent = JSON.stringify({
          analysis: "Generic mock response for unknown agent.",
          recommendation: "hold"
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          id: "mock-id",
          model: "mock-model",
          choices: [
            {
              message: {
                role: "assistant",
                content: mockContent
              }
            }
          ],
          usage: { total_tokens: 100 }
        }
      });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_API_KEY",
            message: "OpenAI API Key is not configured.",
            recoverable: false,
          },
        },
        { status: 500 }
      );
    }

    const requestId = randomUUID();
    const model = overrideModel ?? DEFAULT_MODEL;

    const payloadMessages: ChatMessage[] = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;

    console.info("[LLM] request received", {
      requestId,
      model,
      messageCount: messages.length,
      maxTokens,
      temperature,
    });

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Force GPT-4o-mini for now as requested
      messages: payloadMessages as any,
      max_tokens: maxTokens,
      temperature: temperature,
    });

    const usage = completion.usage;
    if (usage) {
      const cost = (usage.prompt_tokens * PRICING.input) + (usage.completion_tokens * PRICING.output);
      totalSessionTokens.prompt += usage.prompt_tokens;
      totalSessionTokens.completion += usage.completion_tokens;
      totalSessionTokens.total += usage.total_tokens;
      totalSessionTokens.cost += cost;

      console.info("[LLM] Usage Stats:", {
        requestId,
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
        cost: `$${cost.toFixed(6)}`,
        sessionTotalCost: `$${totalSessionTokens.cost.toFixed(4)}`
      });
    }

    // Transform OpenAI response to match previous format if needed, or just return it
    // The frontend expects `data.choices[0].message.content`
    return NextResponse.json({ 
      success: true, 
      data: completion, 
      meta: { 
        requestId, 
        provider: "openai",
        usage: usage,
        cost: usage ? (usage.prompt_tokens * PRICING.input) + (usage.completion_tokens * PRICING.output) : 0
      } 
    });

  } catch (error) {
    console.error("[LLM] unexpected failure", { error });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LLM_PROXY_ERROR",
          message: (error as Error)?.message ?? "Unexpected error calling OpenAI",
          recoverable: true,
        },
      },
      { status: 500 }
    );
  }
}
