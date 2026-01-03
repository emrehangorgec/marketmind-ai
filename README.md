# MarketMind AI

**MarketMind AI** is a sophisticated, multi-agent investment intelligence platform designed to democratize institutional-grade financial analysis. By orchestrating specialized AI agents, it provides real-time, comprehensive market insights, risk assessments, and actionable reports for stocks and cryptocurrencies.

## Live Demo

[View Live Demo](http://mymarketmind.net/)

## Key Features

- **Multi-Agent Architecture**: Utilizes a coordinated system of specialized agents (Fundamental, Technical, Sentiment, Risk, and Reporter) powered by **LangGraph**.
- **Real-Time Market Data**: Integrates live data for US Stocks, Borsa Istanbul (BIST), and Cryptocurrencies via \yahoo-finance2\.
- **Interactive Visualizations**: Beautiful, responsive charts using **Recharts** and dynamic UI components with **Framer Motion**.
- **Advanced Risk Analysis**: Calculates volatility, beta, drawdowns, and suggests stop-loss levels locally.
- **Smart Reporting**: Generates detailed, readable investment reports in Markdown and PDF formats.
- **Multi-Language Support**: Fully localized interface (English & Turkish).
- **Secure Authentication**: User management via **NextAuth.js**.

## Tech Stack

### Core

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### AI & Data

- **LLM Orchestration**: [LangGraph](https://langchain-ai.github.io/langgraph/) & [LangChain](https://js.langchain.com/)
- **AI Model**: OpenAI GPT-4o-mini
- **Market Data**: Yahoo Finance API

### Backend & Infrastructure

- **Database**: PostgreSQL (via [Prisma ORM](https://www.prisma.io/))

- **Auth**: NextAuth.js
- **Deployment**: Vercel

## Architecture

The application uses a **Graph-based Orchestrator** pattern where the \FinancialOrchestrator\ manages the state and flow between agents:

1. **Market Data Agent**: Fetches raw price, news, and fundamental data.
2. **Technical Agent**: Calculates indicators (RSI, MACD, SMA/EMA) and identifies patterns.
3. **Fundamental Agent**: Analyzes financial health, ratios (P/E, EPS), and growth metrics.
4. **Sentiment Agent**: Evaluates news headlines and market mood.
5. **Risk Agent**: Computes quantitative risk metrics and suggests mitigation strategies.
6. **Reporter Agent**: Synthesizes all findings into a cohesive final report.

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API Key
- PostgreSQL Database (local or cloud)

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/emrehangorgec/marketmind-ai.git
    cd marketmind-ai
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**

    Create a `.env` file in the root directory:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/marketmind"
    OPENAI_API_KEY="sk-..."
    NEXTAUTH_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4. **Initialize Database**

    ```bash
    npx prisma generate
    npx prisma db push
    ```

5. **Run the development server**

    ```bash
    npm run dev
    ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built by [Emrehan Gorgec](https://github.com/emrehangorgec)*
