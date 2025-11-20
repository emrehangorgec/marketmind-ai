import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_DEFAULT_MODEL ?? "google/gemini-2.0-flash-exp:free";
const MAX_RETRIES = Number(process.env.OPENROUTER_MAX_RETRIES ?? "2");
const BASE_RETRY_DELAY_MS = Number(process.env.OPENROUTER_RETRY_DELAY_MS ?? "1500");
const MIN_REQUEST_INTERVAL_MS = Number(process.env.OPENROUTER_MIN_INTERVAL_MS ?? "6000");
const RATE_LIMIT_COOLDOWN_MS = Number(process.env.OPENROUTER_RATE_LIMIT_COOLDOWN_MS ?? "15000");
const MAX_QUEUE_SIZE = Number(process.env.OPENROUTER_MAX_QUEUE ?? "4");

let lastOpenRouterRequestAt = 0;
let requestQueue: Promise<void> = Promise.resolve();
let queuedRequests = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function enqueueRequest<T>(task: () => Promise<T>) {
  if (queuedRequests >= MAX_QUEUE_SIZE) {
    throw new ProviderError({
      code: "LLM_QUEUE_FULL",
      message: "Too many AI requests running. Please try again shortly.",
      recoverable: true,
      status: 429,
    });
  }

  queuedRequests += 1;
  const previous = requestQueue;
  let release: (() => void) | undefined;
  requestQueue = new Promise((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    const sinceLastCall = Date.now() - lastOpenRouterRequestAt;
    if (sinceLastCall < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - sinceLastCall);
    }
    const result = await task();
    lastOpenRouterRequestAt = Date.now();
    return result;
  } finally {
    queuedRequests -= 1;
    release?.();
  }
}

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

    const apiKey = process.env.OPENROUTER_API_KEY;
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || !apiKey;

    if (useMock) {
      console.info("[LLM] Using MOCK response");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const lastMessage = messages[messages.length - 1]?.content || "";
      const sysPrompt = systemPrompt || "";
      
      let mockContent = "";

      if (sysPrompt.includes("Technical Analysis Agent")) {
        mockContent = JSON.stringify({
          trend: "bullish",
          signal: "buy",
          confidence: 85,
          indicators: {
            rsi: 65,
            mac: "bullish_crossover",
            movingAverages: "price_above_sma200"
          },
          support: 145.50,
          resistance: 155.00,
          analysis: "Mock technical analysis suggests strong bullish momentum with price above key moving averages."
        });
      } else if (sysPrompt.includes("Fundamental Analysis Agent")) {
        mockContent = JSON.stringify({
          health: "strong",
          valuation: "undervalued",
          growth: "high",
          profitability: "excellent",
          score: 88,
          analysis: "Mock fundamental analysis indicates solid financial health with strong revenue growth and healthy margins."
        });
      } else if (sysPrompt.includes("Sentiment Analysis Agent")) {
        mockContent = JSON.stringify({
          sentiment: "positive",
          score: 0.75,
          keywords: ["growth", "earnings", "innovation"],
          sources_summary: "News sentiment is generally positive following recent product announcements."
        });
      } else if (sysPrompt.includes("Risk Manager Agent")) {
        mockContent = JSON.stringify({
          riskLevel: "moderate",
          maxDrawdown: 12.5,
          volatility: "medium",
          sharpeRatio: 1.8,
          recommendation: "allocate_with_caution",
          stopLoss: 142.00,
          takeProfit: 165.00
        });
      } else if (sysPrompt.includes("Report Generator Agent")) {
        mockContent = `
# MarketMind Analysis Report

## Executive Summary
This is a **MOCK REPORT** generated for demonstration purposes. The analysis indicates a positive outlook based on simulated data.

## Technical Outlook
Bullish trend observed with key indicators flashing buy signals.

## Fundamental Health
Strong balance sheet and consistent revenue growth support the bullish thesis.

## Risk Assessment
Moderate risk level. Recommended stop loss at $142.00.

## Conclusion
**BUY** recommendation with a target of $165.00.
        `;
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
            message: "OPENROUTER_API_KEY is not configured.",
            recoverable: false,
          },
        },
        { status: 500 }
      );
    }

    const requestId = randomUUID();
    const referer = process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000";
    const title = process.env.OPENROUTER_APP_TITLE ?? "MarketMind";
    const model = overrideModel ?? DEFAULT_MODEL;

    const payloadMessages: ChatMessage[] = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;

    const payload: LLMRequestPayload = {
      messages: payloadMessages,
      maxTokens,
      temperature,
      model,
      requestId,
    };

    console.info("[LLM] request received", {
      requestId,
      model,
      messageCount: messages.length,
      maxTokens,
      temperature,
    });

    const data = await callOpenRouter(payload, { apiKey, referer, title });
    return NextResponse.json({ success: true, data, meta: { requestId, provider: "openrouter" } });
  } catch (error) {
    return createErrorResponse(error);
  }
}

async function callOpenRouter(
  { messages, maxTokens, temperature, model, requestId }: LLMRequestPayload,
  {
    apiKey,
    referer,
    title,
  }: { apiKey: string; referer: string; title: string }
) {
  let attempt = 0;
  const startedAt = Date.now();

  while (true) {
    const response = await enqueueRequest(async () => {
      console.debug("[LLM] dispatching request", {
        requestId,
        model,
        attempt,
        queuedRequests,
      });

      return fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": referer,
          "X-Title": title,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
        }),
      });
    });

    const payload = await response.json().catch(() => null);

    if (response.ok) {
      console.info("[LLM] success", {
        requestId,
        model,
        durationMs: Date.now() - startedAt,
        attempt,
      });
      return payload;
    }

    const status = response.status;
    const message = payload?.error?.message ?? `OpenRouter request failed with status ${status}`;
    console.warn("[LLM] provider error", {
      requestId,
      model,
      attempt,
      status,
      durationMs: Date.now() - startedAt,
      message,
    });

    if (status === 429 && attempt < MAX_RETRIES) {
      attempt += 1;
      await sleep(BASE_RETRY_DELAY_MS * attempt + RATE_LIMIT_COOLDOWN_MS);
      continue;
    }

    throw new ProviderError({
      code: status === 429 ? "RATE_LIMIT_EXCEEDED" : "OPENROUTER_ERROR",
      message,
      recoverable: status === 429,
      status,
    });
  }
}

function createErrorResponse(error: unknown) {
  if (error instanceof ProviderError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.info.code,
          message: error.info.message,
          recoverable: error.info.recoverable,
          provider: "openrouter",
        },
      },
      { status: error.info.status }
    );
  }

  console.error("[LLM] unexpected failure", { error });
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "LLM_PROXY_ERROR",
        message: (error as Error)?.message ?? "Unexpected error calling OpenRouter",
        recoverable: true,
      },
    },
    { status: 500 }
  );
}
