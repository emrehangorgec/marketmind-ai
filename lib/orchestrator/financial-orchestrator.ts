import EventEmitter from "eventemitter3";
import { v4 as uuid } from "uuid";
import { MarketDataAgent } from "@/lib/agents/market-data-agent";
import { TechnicalAnalysisAgent } from "@/lib/agents/technical-analysis-agent";
import { FundamentalAnalysisAgent } from "@/lib/agents/fundamental-analysis-agent";
import { SentimentAnalysisAgent } from "@/lib/agents/sentiment-analysis-agent";
import { RiskManagerAgent } from "@/lib/agents/risk-manager-agent";
import { ReportGeneratorAgent } from "@/lib/agents/report-generator-agent";
import {
  AgentError,
  AgentName,
  AgentStatus,
  AnalysisRecord,
  AnalysisState,
  FundamentalAnalysisPayload,
  MarketDataPayload,
  SentimentAnalysisPayload,
  TechnicalAnalysisPayload,
} from "@/lib/types/analysis";

type ParallelAgentName = Extract<AgentName, "technical" | "fundamental" | "sentiment">;
type ParallelAgentResultMap = {
  technical: TechnicalAnalysisPayload;
  fundamental: FundamentalAnalysisPayload;
  sentiment: SentimentAnalysisPayload;
};

interface OrchestratorEvents {
  state: AnalysisState;
  agent: { name: AgentName; status: AgentStatus };
  error: AgentError;
}

export class FinancialOrchestrator extends EventEmitter<OrchestratorEvents> {
  private marketDataAgent = new MarketDataAgent();

  private technicalAgent = new TechnicalAnalysisAgent();

  private fundamentalAgent = new FundamentalAnalysisAgent();

  private sentimentAgent = new SentimentAnalysisAgent();

  private riskAgent = new RiskManagerAgent();

  private reportAgent = new ReportGeneratorAgent();

  private state: AnalysisState = {
    phase: "idle",
    progress: 0,
    activeAgent: null,
    results: {},
    errors: [],
  };

  constructor() {
    super();
    this.registerAgentListeners();
  }

  get snapshot() {
    return this.state;
  }

  async analyzeStock(symbol: string) {
    this.resetState();
    this.updateState({ phase: "initializing", activeAgent: null, startedAt: Date.now() });
    try {
      // Phase 1 - Market Data
      this.updateState({ phase: "data", activeAgent: "marketData", progress: 0.15 });
      const marketData = await this.marketDataAgent.execute(symbol);
      this.updateState({
        results: { ...this.state.results, marketData },
        progress: 0.25,
      });

      // Phase 2 - Parallel agents
      this.updateState({ phase: "analysis", activeAgent: null });
      const [technical, fundamental, sentiment] = (await Promise.all([
        this.runAgent("technical", marketData),
        this.runAgent("fundamental", marketData),
        this.runAgent("sentiment", marketData),
      ])) as [
        TechnicalAnalysisPayload,
        FundamentalAnalysisPayload,
        SentimentAnalysisPayload,
      ];
      this.updateState({
        results: {
          ...this.state.results,
          technical,
          fundamental,
          sentiment,
        },
        progress: 0.65,
      });

      // Phase 3 - Risk
      this.updateState({ phase: "risk", activeAgent: "risk", progress: 0.75 });
      const risk = await this.riskAgent.execute({
        marketData,
        technical,
        sentiment,
      });
      this.updateState({
        results: { ...this.state.results, risk },
        progress: 0.85,
      });

      // Phase 4 - Report
      this.updateState({ phase: "report", activeAgent: "reporter" });
      const reporter = await this.reportAgent.execute({
        marketData,
        technical,
        fundamental,
        sentiment,
        risk,
      });
      this.updateState({
        results: { ...this.state.results, reporter },
        phase: "completed",
        progress: 1,
        activeAgent: null,
        completedAt: Date.now(),
      });

      return this.buildRecord(symbol, reporter);
    } catch (error) {
      const agentError: AgentError = (error as AgentError) ?? {
        code: "ORCHESTRATOR_ERROR",
        message: (error as Error)?.message ?? "Analysis failed",
        recoverable: false,
        agentName: this.state.activeAgent ?? "marketData",
      };
      this.updateState({ phase: "error", activeAgent: null });
      this.state.errors.push(agentError);
      this.emit("error", agentError);
      throw agentError;
    }
  }

  private async runAgent<TAgent extends ParallelAgentName>(
    agent: TAgent,
    marketData: MarketDataPayload
  ): Promise<ParallelAgentResultMap[TAgent]> {
    this.updateState({ activeAgent: agent });
    switch (agent) {
      case "technical":
        return this.technicalAgent.execute(marketData) as Promise<ParallelAgentResultMap[TAgent]>;
      case "fundamental":
        return this.fundamentalAgent.execute(marketData) as Promise<ParallelAgentResultMap[TAgent]>;
      case "sentiment":
        return this.sentimentAgent.execute(marketData) as Promise<ParallelAgentResultMap[TAgent]>;
      default:
        throw new Error(`Unsupported agent: ${agent}`);
    }
  }

  private resetState() {
    this.state = {
      phase: "idle",
      progress: 0,
      activeAgent: null,
      results: {},
      errors: [],
    };
  }

  private updateState(patch: Partial<AnalysisState>) {
    this.state = { ...this.state, ...patch, results: { ...this.state.results, ...(patch.results ?? {}) } };
    this.emit("state", this.state);
  }

  private buildRecord(symbol: string, reporter: Required<AnalysisState["results"]>["reporter"]): AnalysisRecord {
    return {
      id: uuid(),
      symbol,
      timestamp: Date.now(),
      finalRecommendation: reporter.finalRecommendation,
      overallConfidence: reporter.overallConfidence,
      compositeScore: reporter.compositeScore,
      agentScores: {
        technical: this.state.results.technical?.score,
        fundamental: this.state.results.fundamental?.score,
        sentiment: this.state.results.sentiment?.score,
        risk: this.state.results.risk?.score,
      },
      fullData: this.state.results,
    };
  }

  private registerAgentListeners() {
    const agents = [
      this.marketDataAgent,
      this.technicalAgent,
      this.fundamentalAgent,
      this.sentimentAgent,
      this.riskAgent,
      this.reportAgent,
    ];
    agents.forEach((agent) => {
      agent.on("status", (status) => this.emit("agent", { name: agent.name, status }));
      agent.on("error", (error) => {
        this.state.errors.push(error);
        this.emit("error", error);
      });
    });
  }
}
