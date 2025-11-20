export function cleanAndParseJSON<T>(text: string): T {
  let cleaned = text.trim();

  // 1. Try to match markdown code blocks
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = cleaned.match(codeBlockRegex);

  if (match) {
    cleaned = match[1].trim();
  }

  // 2. Fallback: If the string still starts with ```, manually strip it
  // This handles cases where the regex might fail due to formatting quirks
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?/, "").replace(/```$/, "");
  }

  // 3. Fallback: Find the first '{' and last '}' to extract the JSON object
  // This handles cases with extra text before/after the JSON
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const potentialJson = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(potentialJson);
    } catch {
      // If extraction fails, proceed to try parsing the original cleaned string
    }
  }

  return JSON.parse(cleaned);
}
