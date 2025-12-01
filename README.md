# MarketMind

Multi-agent investment intelligence platform built with Next.js 14, OpenAI (`gpt-4o-mini`), and free-tier market data APIs.

## Features

- **Agent orchestrator** – `FinancialOrchestrator` coordinates six agents (market data, technical, fundamental, sentiment, risk, report) with streaming status updates.
- **Data providers** – Serverless routes proxy Yahoo Finance (`yahoo-finance2`) for price, fundamentals, and news data. No external API keys required for market data.
- **LLM analysis** – Agents call `/api/llm` (OpenAI → `gpt-4o-mini`) using deterministic JSON prompts plus heuristics when parsing fails.
- **Risk discipline** – Local calculations for volatility, drawdown, beta, and stop levels produce actionable mitigation guidance.
- **Interactive dashboard** – Tailwind + Recharts UI visualizes agent progress, indicators, sentiment feeds, markdown reports, and historical results from `localStorage`.

## Project Structure

```text
app/
  api/llm                    # OpenAI proxy route
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
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

4. Open <http://localhost:3000>, search for a ticker (e.g., `AAPL`), and monitor the analysis dashboard.

## Deployment Checklist

- [ ] Configure the `OPENAI_API_KEY` environment variable in Vercel Project Settings
- [ ] Run `npm run lint` and `npm run build`
- [ ] Hit `/api/market-data/*` endpoints locally to confirm Yahoo Finance integration works
- [ ] Validate loading and error states for bad symbols and rate limits
- [ ] Keep the disclaimer banner visible on every page

## Agent Prompts & Fallbacks

- Each agent inherits `BaseAgent`, which tracks `status`, `thinking` logs, and LLM retries.
- Technical, fundamental, sentiment, and reporter agents enforce strict JSON prompts; failures trigger heuristic fallbacks so the pipeline continues.
- Risk and report agents ingest upstream outputs to produce composite recommendations and mitigation strategies.

## License

Released under the Apache License, Version 2.0. See [`LICENSE`](./LICENSE) for details.
