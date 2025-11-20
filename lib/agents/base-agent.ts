import EventEmitter from "eventemitter3";
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
    protected readonly systemPrompt: string
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
    await this.think("Consulting GPT-4o-mini for deeper reasoning...");
    const response = await fetch("/api/llm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: this.systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        maxTokens,
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
    return text.trim();
  }

  protected handleError(error: AgentError) {
    this.status = "error";
    this.error = error;
    this.emit("error", error);
  }

  abstract execute(input: TInput): Promise<TResult>;
}
