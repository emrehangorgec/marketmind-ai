import EventEmitter from "eventemitter3";
import { LLMFactory } from "@/lib/llm/factory";
import { GuardrailsService } from "@/lib/guardrails";
import {
  AgentError,
  AgentName,
  AgentStatus,
} from "@/lib/types/analysis";

export interface ThinkingEntry {
  timestamp: number;
  thought: string;
}

export abstract class BaseAgent<TInput, TResult> extends EventEmitter<{
  status: AgentStatus;
  thinking: ThinkingEntry;
  result: TResult;
  error: AgentError;
}> {
  public status: AgentStatus = "idle";

  public result: TResult | null = null;

  public thinking: ThinkingEntry[] = [];

  public error: AgentError | null = null;

  protected constructor(
    public readonly name: AgentName,
    protected readonly systemPrompt: string,
    protected readonly model?: string
  ) {
    super();
  }

  protected async think(thought: string) {
    const entry: ThinkingEntry = { timestamp: Date.now(), thought };
    this.thinking.push(entry);
    this.emit("thinking", entry);
  }

  protected updateStatus(status: AgentStatus) {
    this.status = status;
    this.emit("status", status);
  }

  protected async callLLM(userPrompt: string, maxTokens = 500) {
    // --- 1. Guardrails: Input Validation ---
    await this.think("Checking input against safety guardrails...");
    const inputGuard = await GuardrailsService.validateInput(userPrompt);
    if (!inputGuard.isValid) {
      throw {
        code: "VALIDATION_ERROR",
        message: inputGuard.reason || "Input validation failed",
        recoverable: false,
        agentName: this.name
      } satisfies AgentError;
    }

    await this.think("Consulting AI model for deeper reasoning...");
    
    // Server-side execution
    if (typeof window === 'undefined') {
      try {
        const provider = LLMFactory.getProvider("openai");
        const response = await provider.generate({
          messages: [
            { role: "system", content: this.systemPrompt },
            { role: "user", content: userPrompt }
          ],
          maxTokens,
          model: this.model,
        });
        
        const rawContent = response.content;
        const outputGuard = await GuardrailsService.validateOutput(rawContent);
        return outputGuard.modifiedContent || rawContent;
      } catch (error) {
        const err = error as Error;
        throw {
          code: "LLM_ERROR",
          message: err.message || "LLM generation failed",
          recoverable: true,
          agentName: this.name,
        } satisfies AgentError;
      }
    }

    // Client-side execution (legacy)
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("marketmind.api_keys");
      if (stored) {
        try {
          const settings = JSON.parse(stored);
          if (settings.openaiApiKey) {
            headers["x-openai-api-key"] = settings.openaiApiKey;
          }
        } catch (e) {
          // ignore
        }
      }
    }


    const response = await fetch("/api/llm", {
      method: "POST",
      headers,
      body: JSON.stringify({
        systemPrompt: this.systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        maxTokens,
        model: this.model,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      const message =
        payload?.error?.message ??
        payload?.message ??
        "LLM call failed";
      throw {
        code: "LLM_ERROR",
        message,
        recoverable: true,
        agentName: this.name,
      } satisfies AgentError;
    }

    const text =
      payload?.data?.choices?.[0]?.message?.content ??
      payload?.choices?.[0]?.message?.content ??
      payload?.content?.[0]?.text ??
      "";
    
    const rawText = text.trim();

    // --- 2. Guardrails: Output Validation ---
    const outputGuard = await GuardrailsService.validateOutput(rawText);
    return outputGuard.modifiedContent || rawText;
  }

  protected handleError(error: AgentError) {
    this.status = "error";
    this.error = error;
    this.emit("error", error);
  }

  abstract execute(input: TInput): Promise<TResult>;
}
