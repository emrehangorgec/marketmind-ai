# MarketMind

Multi-agent investment intelligence platform built with Next.js 14, OpenRouter-hosted Gemini Flash EXP, and free-tier market data APIs.

## Features

- **Agent orchestrator** – `FinancialOrchestrator` coordinates six agents (market data, technical, fundamental, sentiment, risk, report) with streaming status updates.
- **Data providers** – Serverless routes proxy Alpha Vantage, Finnhub, and Brave Search with retry logic, error classification, and normalized schemas.
- **LLM analysis** – Agents call `/api/llm` (OpenRouter → `google/gemini-2.0-flash-exp:free`) using deterministic JSON prompts plus heuristics when parsing fails. OpenAI is no longer required—the proxy throttles, retries, and logs directly against OpenRouter’s free tier.
- **Risk discipline** – Local calculations for volatility, drawdown, beta, and stop levels produce actionable mitigation guidance.
- **Interactive dashboard** – Tailwind + Recharts UI visualizes agent progress, indicators, sentiment feeds, markdown reports, and historical results from `localStorage`.

## Project Structure

```text
app/
   api/llm                    # OpenRouter Gemini proxy route
  api/market-data            # Price, fundamentals, news routes
  analyze/[symbol]/          # Analysis dashboard
  page.tsx                   # Landing page + search
components/                  # UI pieces, charts, scorecards
hooks/                       # Orchestrator + storage hooks
lib/agents                   # BaseAgent + specialized agents
lib/orchestrator             # FinancialOrchestrator
lib/utils                    # Indicators, storage, HTTP helpers
```

## Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create `.env.local`**

   ```bash
   OPENROUTER_API_KEY=your_openrouter_key
   OPENROUTER_DEFAULT_MODEL=google/gemini-2.0-flash-exp:free # change if you prefer another OpenRouter model
   OPENROUTER_MAX_RETRIES=2 # retry budget when the free tier rate-limits
   OPENROUTER_RETRY_DELAY_MS=1500 # backoff base (ms)
   OPENROUTER_MIN_INTERVAL_MS=6000 # serialize outbound calls to respect free tier limits
   OPENROUTER_RATE_LIMIT_COOLDOWN_MS=15000 # extra wait after a 429 before retrying
   OPENROUTER_MAX_QUEUE=4 # max concurrent queued tasks before returning 429 to the client
   ALPHA_VANTAGE_KEY=your_alpha_vantage_key
   FINNHUB_KEY=your_finnhub_key
   BRAVE_SEARCH_KEY=your_brave_search_key
   OPENROUTER_SITE_URL=http://localhost:3000 # optional but recommended by OpenRouter
   OPENROUTER_APP_TITLE=MarketMind # optional request attribution
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

4. Open <http://localhost:3000>, search for a ticker (e.g., `AAPL`), and monitor the analysis dashboard.

## Deployment Checklist

- [ ] Configure the OpenRouter + market data environment variables in Vercel Project Settings
- [ ] Run `npm run lint` and `npm run build`
- [ ] Hit `/api/market-data/*` endpoints locally to confirm free-tier quotas are respected
- [ ] Validate loading and error states for bad symbols and rate limits
- [ ] Keep the disclaimer banner visible on every page

## Agent Prompts & Fallbacks

- Each agent inherits `BaseAgent`, which tracks `status`, `thinking` logs, and LLM retries.
- Technical, fundamental, sentiment, and reporter agents enforce strict JSON prompts; failures trigger heuristic fallbacks so the pipeline continues.
- Risk and report agents ingest upstream outputs to produce composite recommendations and mitigation strategies.

## License

Released under the Apache License, Version 2.0. See [`LICENSE`](./LICENSE) for details.
