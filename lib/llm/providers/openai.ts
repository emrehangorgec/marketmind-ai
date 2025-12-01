import OpenAI from "openai";
import { BaseLLMProvider } from "./base";
import { LLMRequest, LLMResponse, LLMError } from "../types";

// GPT-4o-mini pricing (approximate)
const PRICING = {
  input: 0.15 / 1_000_000,
  output: 0.60 / 1_000_000
};

export class OpenAIProvider extends BaseLLMProvider {
  name = "openai";
  private defaultModel = "gpt-4o-mini";

  async generate(request: LLMRequest): Promise<LLMResponse> {
    try {
      const apiKey = request.apiKey || process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new LLMError("MISSING_API_KEY", "OpenAI API Key is not configured.", false, this.name);
      }

      const openai = new OpenAI({ apiKey });
      const model = request.model || this.defaultModel;

      const completion = await openai.chat.completions.create({
        model: model,
        messages: request.messages,
        max_tokens: request.maxTokens || 500,
        temperature: request.temperature || 0.2,
      });

      const choice = completion.choices[0];
      const content = choice.message.content || "";
      const usage = completion.usage;

      let cost = 0;
      if (usage) {
        cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens, PRICING);
      }

      return {
        content,
        provider: this.name,
        model: model,
        usage: usage ? {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          cost
        } : undefined
      };

    } catch (error: any) {
      console.error("[OpenAIProvider] Error:", error);
      
      if (error instanceof LLMError) throw error;

      throw new LLMError(
        "PROVIDER_ERROR",
        error.message || "Unknown error from OpenAI",
        true,
        this.name
      );
    }
  }
}
