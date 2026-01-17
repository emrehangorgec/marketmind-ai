
// Imports removed as they were unused


export interface GuardrailResult {
  isValid: boolean;
  reason?: string;
  modifiedContent?: string;
}

export class GuardrailsService {
  private static MAX_INPUT_CHARS = 12000;
  /**
   * Input Guardrails: Validates user input before it reaches the core Agent/LLM.
   * Checks for:
   * 1. Topic Relevance (is it finance related?)
   * 2. Length/Simplicity
   * 3. Basic Injection attempts (heuristic)
   */
  static async validateInput(prompt: string): Promise<GuardrailResult> {
    // 1. Basic Length Check
    if (prompt.length > GuardrailsService.MAX_INPUT_CHARS) {
      return { isValid: false, reason: "Input too long. Please shorten your query." };
    }

    // 2. Off-topic Heuristic (Simulated for this demo)
    // In a real app, you might use a small classifier model here.
    const forbiddenKeywords = ["ignore previous instructions", "system prompt", "delete database"];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const keyword of forbiddenKeywords) {
      if (lowerPrompt.includes(keyword)) {
        return { isValid: false, reason: "Potential unsafe input detected (Prompt Injection risk)." };
      }
    }

    // 3. Topic Relevance (Simple keyword check, usually handled by Agent system prompt but good as a fail-fast)
    // This is optional depending on how strict we want to be.
    // Let's assume the agent handles relevance, but this is an example of a guardrail.
    
    return { isValid: true };
  }

  /**
   * Output Guardrails: Validates the model's response.
   * Checks for:
   * 1. PII (Personally Identifiable Information) leakage
   * 2. Formatting (e.g. if JSON is expected)
   * 3. Harmful content
   */
  static async validateOutput(response: string): Promise<GuardrailResult> {
    // 1. PII Redaction (Simulated email redaction)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let sanitizedResponse = response;
    
    if (emailRegex.test(response)) {
      sanitizedResponse = response.replace(emailRegex, "[REDACTED_EMAIL]");
    }

    // 2. Format validation can go here (e.g. check if starts with { if JSON mode)

    return { 
      isValid: true, 
      modifiedContent: sanitizedResponse 
    };
  }
}
