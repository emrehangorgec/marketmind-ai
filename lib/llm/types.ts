export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface LLMRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  model?: string;
  requestId?: string;
  apiKey?: string; // Optional: override key per request
}

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
}

export interface LLMResponse {
  content: string;
  usage?: LLMUsage;
  provider: string;
  model: string;
}

export interface LLMProvider {
  name: string;
  generate(request: LLMRequest): Promise<LLMResponse>;
}

export class LLMError extends Error {
  constructor(
    public code: string,
    message: string,
    public recoverable: boolean = true,
    public provider?: string
  ) {
    super(message);
    this.name = "LLMError";
  }
}
