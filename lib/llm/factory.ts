import { LLMProvider } from "./types";
import { OpenAIProvider } from "./providers/openai";

export type ProviderType = "openai"; // Add "anthropic" | "local" later

export class LLMFactory {
  private static providers: Map<string, LLMProvider> = new Map();

  static getProvider(type: ProviderType = "openai"): LLMProvider {
    if (!this.providers.has(type)) {
      switch (type) {
        case "openai":
          this.providers.set(type, new OpenAIProvider());
          break;
        default:
          throw new Error(`Provider ${type} not supported`);
      }
    }
    return this.providers.get(type)!;
  }
}
