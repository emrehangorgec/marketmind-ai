/**
 * Retries fetch requests with exponential backoff to gracefully handle
 * transient network errors and upstream rate limiting.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit & { retryCount?: number; retryDelayMs?: number } = {}
) {
  const { retryCount = 3, retryDelayMs = 500, ...rest } = init;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const response = await fetch(input, rest);
      if (!response.ok) {
        if (response.status >= 500 && attempt < retryCount) {
          await delay(retryDelayMs * Math.pow(2, attempt));
          continue;
        }
      }
      return response;
    } catch (error) {
      if (attempt === retryCount) {
        throw error;
      }
      await delay(retryDelayMs * Math.pow(2, attempt));
    }
  }

  throw new Error("Failed to fetch after retries");
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
