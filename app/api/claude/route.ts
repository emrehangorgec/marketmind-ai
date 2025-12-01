import { NextResponse } from "next/server";

const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MISSING_API_KEY",
          message: "Anthropic API key is not configured.",
          recoverable: false,
        },
      },
      { status: 500 }
    );
  }

  try {
    const { messages, systemPrompt, maxTokens = 500 } = await request.json();
    if (!messages?.length) {
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

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorJson = await anthropicResponse.json().catch(() => ({}));
      const status = anthropicResponse.status;
      return NextResponse.json(
        {
          success: false,
          error: {
            code: status === 429 ? "RATE_LIMIT_EXCEEDED" : "CLAUDE_ERROR",
            message:
              errorJson?.error?.message ??
              `Claude API request failed with status ${status}`,
            recoverable: status === 429,
          },
        },
        { status }
      );
    }

    const data = await anthropicResponse.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CLAUDE_PROXY_ERROR",
          message: (error as Error)?.message ?? "Unexpected error calling Claude",
          recoverable: true,
        },
      },
      { status: 500 }
    );
  }
}
