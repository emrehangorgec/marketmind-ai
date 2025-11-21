import { LLMProvider, LLMRequest, LLMResponse } from "../types";

export abstract class BaseLLMProvider implements LLMProvider {
  abstract name: string;
  
  abstract generate(request: LLMRequest): Promise<LLMResponse>;

  protected calculateCost(promptTokens: number, completionTokens: number, pricing: { input: number; output: number }): number {
    return (promptTokens * pricing.input) + (completionTokens * pricing.output);
  }
}
