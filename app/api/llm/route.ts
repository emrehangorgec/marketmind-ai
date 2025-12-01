import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { LLMFactory } from "@/lib/llm/factory";
import { LLMRequest, ChatMessage } from "@/lib/llm/types";

// Simple in-memory token tracker (resets on server restart)
let totalSessionTokens = {
  prompt: 0,
  completion: 0,
  total: 0,
  cost: 0
};

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

    const requestId = randomUUID();
    
    const payloadMessages: ChatMessage[] = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;

    console.info("[LLM] request received", {
      requestId,
      model: overrideModel,
      messageCount: messages.length,
      maxTokens,
      temperature,
    });

    // Use the Factory to get the provider (defaulting to OpenAI for now)
    const provider = LLMFactory.getProvider("openai");
    
    const llmRequest: LLMRequest = {
      messages: payloadMessages,
      maxTokens,
      temperature,
      model: overrideModel,
      requestId,
      apiKey: apiKey || undefined
    };

    const response = await provider.generate(llmRequest);

    if (response.usage) {
      const cost = response.usage.cost || 0;
      totalSessionTokens.prompt += response.usage.promptTokens;
      totalSessionTokens.completion += response.usage.completionTokens;
      totalSessionTokens.total += response.usage.totalTokens;
      totalSessionTokens.cost += cost;

      console.info("[LLM] Usage Stats:", {
        requestId,
        prompt: response.usage.promptTokens,
        completion: response.usage.completionTokens,
        total: response.usage.totalTokens,
        cost: `$${cost.toFixed(6)}`,
        sessionTotalCost: `$${totalSessionTokens.cost.toFixed(4)}`
      });
    }

    // Transform to match the expected frontend format (OpenAI-like structure)
    return NextResponse.json({ 
      success: true, 
      data: {
        id: requestId,
        model: response.model,
        choices: [
          {
            message: {
              role: "assistant",
              content: response.content
            }
          }
        ],
        usage: response.usage ? {
          prompt_tokens: response.usage.promptTokens,
          completion_tokens: response.usage.completionTokens,
          total_tokens: response.usage.totalTokens
        } : undefined
      }, 
      meta: { 
        requestId, 
        provider: response.provider,
        usage: response.usage,
        cost: response.usage?.cost || 0
      } 
    });

  } catch (error: any) {
    console.error("[LLM] unexpected failure", { error });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || "LLM_PROXY_ERROR",
          message: error.message || "Unexpected error calling LLM Provider",
          recoverable: true,
        },
      },
      { status: 500 }
    );
  }
}
