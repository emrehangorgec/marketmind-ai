export type AgentName =
  | "marketData"
  | "technical"
  | "fundamental"
  | "sentiment"
  | "risk"
  | "reporter";

export type AgentStatus = "idle" | "working" | "completed" | "error";

export interface AgentError {
  code: string;
  message: string;
  recoverable: boolean;
  agentName: AgentName;
}

export interface HistoricalPriceBar {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export interface NewsHeadline {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment?: "positive" | "neutral" | "negative";
}

export interface FundamentalsSnapshot {
  marketCap?: number;
  peRatio?: number;
  eps?: number;
  pbRatio?: number;
  dividendYield?: number;
  revenuePerShare?: number;
  profitMargin?: number;
  sector?: string;
  roe?: number;
  debtToEquity?: number;
  beta?: number;
}

export interface MarketDataPayload {
  symbol: string;
  currentPrice: number;
  previousClose?: number;
  priceChange?: number;
  priceChangePercent?: number;
  historicalPrices: HistoricalPriceBar[];
  fundamentals: FundamentalsSnapshot;
  news: NewsHeadline[];
  fetchedAt: number;
}

export interface TechnicalIndicators {
  rsi: number | null;
  macd: { macd: number; signal: number; histogram: number } | null;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  bollingerBands: { upper: number; middle: number; lower: number } | null;
}

export interface TechnicalAnalysisPayload {
  indicators: TechnicalIndicators;
  trend: "bullish" | "bearish" | "neutral";
  trendStrength: "weak" | "moderate" | "strong";
  support: number[];
  resistance: number[];
  signals: string[];
  recommendation: "BUY" | "HOLD" | "SELL";
  confidence: number;
  reasoning: string;
  score: number;
}

export interface FundamentalAnalysisPayload {
  metrics: Record<string, number | undefined> & {
    peRatio?: number;
    pbRatio?: number;
    debtToEquity?: number;
    roe?: number;
    profitMargin?: number;
  };
  sectorComparison: Record<string, string | number> & {
    peSectorAvg?: number;
    peRelative?: string;
  };
  valuation: string;
  growthPotential: "low" | "medium" | "high";
  strengths: string[];
  weaknesses: string[];
  recommendation: "BUY" | "HOLD" | "SELL";
  confidence: number;
  reasoning: string;
  score: number;
}

export interface SentimentAnalysisPayload {
  overallSentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  keyThemes: string[];
  risks: string[];
  catalysts: string[];
  marketMood: "fearful" | "cautious" | "neutral" | "optimistic" | "greedy";
  newsCount: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  reasoning: string;
  score: number;
}

export interface RiskAnalysisPayload {
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  volatility: number;
  beta: number | null;
  maxDrawdownEstimate: string;
  recommendedPositionSize: string;
  stopLossLevel: number | null;
  keyRisks: string[];
  mitigationStrategies: string[];
  reasoning: string;
  score: number;
}

export interface ReportPayload {
  finalRecommendation: "BUY" | "HOLD" | "SELL";
  overallConfidence: number;
  compositeScore: number;
  executiveSummary: string;
  agentConsensus: {
    agreement: "low" | "medium" | "high";
    conflictingAgents: AgentName[];
    consensus: "BUY" | "HOLD" | "SELL";
  };
  keyInsights: string[];
  actionItems: string[];
  fullReport: string;
}

export interface AgentExecutionResult<TPayload> {
  agent: AgentName;
  status: AgentStatus;
  payload?: TPayload;
  error?: AgentError;
  durationMs?: number;
}

export interface AnalysisState {
  phase: "idle" | "initializing" | "data" | "analysis" | "risk" | "report" | "completed" | "error";
  progress: number;
  activeAgent: AgentName | null;
  startedAt?: number;
  completedAt?: number;
  results: Partial<{
    marketData: MarketDataPayload;
    technical: TechnicalAnalysisPayload;
    fundamental: FundamentalAnalysisPayload;
    sentiment: SentimentAnalysisPayload;
    risk: RiskAnalysisPayload;
    reporter: ReportPayload;
  }>;
  errors: AgentError[];
}

export interface AnalysisRecord {
  id: string;
  symbol: string;
  timestamp: number;
  finalRecommendation: "BUY" | "HOLD" | "SELL";
  overallConfidence: number;
  compositeScore: number;
  agentScores: {
    technical?: number;
    fundamental?: number;
    sentiment?: number;
    risk?: number;
  };
  fullData: AnalysisState["results"];
}
