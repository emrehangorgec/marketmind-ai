import EventEmitter from "eventemitter3";
import { v4 as uuid } from "uuid";
import {
  AgentError,
  AgentName,
  AgentStatus,
  AnalysisRecord,
  AnalysisState,
} from "@/lib/types/analysis";

interface OrchestratorEvents {
  state: AnalysisState;
  agent: { name: AgentName; status: AgentStatus };
  error: AgentError;
}

export class FinancialOrchestrator extends EventEmitter<OrchestratorEvents> {
  private state: AnalysisState = {
    phase: "idle",
    progress: 0,
    activeAgent: null,
    results: {},
    errors: [],
  };

  constructor() {
    super();
  }

  get snapshot() {
    return this.state;
  }

  async analyzeStock(symbol: string): Promise<AnalysisRecord | null> {
    this.resetState();
    this.updateState({ phase: "initializing", activeAgent: null, startedAt: Date.now() });

    try {
      const response = await fetch("/api/analyze/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      if (!response.ok) throw new Error("Analysis request failed");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.error) throw new Error(event.error);
            this.processGraphEvent(event);
          } catch (e) {
            console.error("Error parsing stream chunk", e);
          }
        }
      }

      // Check for errors in the final state
      if (this.state.errors.length > 0) {
        this.updateState({ phase: "error", progress: 0 });
        this.emit("error", this.state.errors[0]);
        return null;
      }

      // Construct the final record
      const finalResults = this.state.results;
      if (!finalResults.reporter) {
        throw new Error("Report generation failed or missing");
      }

      const record: AnalysisRecord = {
        id: uuid(),
        symbol: symbol,
        timestamp: Date.now(),
        finalRecommendation: finalResults.reporter.finalRecommendation,
        overallConfidence: finalResults.reporter.overallConfidence,
        compositeScore: finalResults.reporter.compositeScore,
        agentScores: {
          technical: finalResults.technical?.score,
          fundamental: finalResults.fundamental?.score,
          sentiment: finalResults.sentiment?.score,
          risk: finalResults.risk?.score,
        },
        fullData: finalResults,
      };

      this.updateState({
        phase: "completed",
        progress: 1,
        completedAt: Date.now(),
      });

      return record;

    } catch (error) {
      const agentError: AgentError = {
        code: "ORCHESTRATOR_ERROR",
        message: (error as Error).message,
        recoverable: false,
        agentName: "reporter",
      };
      this.updateState({ phase: "error", errors: [agentError] });
      this.emit("error", agentError);
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private processGraphEvent(event: any) {
    const nodeName = Object.keys(event)[0];
    const data = event[nodeName];

    // Extract errors if any
    if (data.errors) {
      this.state.errors.push(...data.errors);
    }

    // Map GraphState to AnalysisState results
    const { report, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultsUpdate: any = { ...rest };
    
    if (report) {
      resultsUpdate.reporter = report;
    }

    // Merge results
    this.state.results = {
      ...this.state.results,
      ...resultsUpdate
    };

    // Update UI state based on the node that just finished
    switch (nodeName) {
      case "fetchMarketData":
        this.updateState({ 
          phase: "data", 
          activeAgent: "marketData", 
          progress: 0.25 
        });
        break;
      
      case "analyzeTechnical":
      case "analyzeFundamental":
      case "analyzeSentiment":
        this.updateState({ 
          phase: "analysis", 
          activeAgent: null,
          progress: 0.5 
        });
        break;

      case "assessRisk":
        this.updateState({ 
          phase: "risk", 
          activeAgent: "risk", 
          progress: 0.75 
        });
        break;

      case "generateReport":
        this.updateState({ 
          phase: "report", 
          activeAgent: "reporter", 
          progress: 0.9 
        });
        break;
    }
  }

  private updateState(update: Partial<AnalysisState>) {
    this.state = { ...this.state, ...update };
    this.emit("state", this.state);
  }

  private resetState() {
    this.state = {
      phase: "idle",
      progress: 0,
      activeAgent: null,
      results: {},
      errors: [],
    };
    this.emit("state", this.state);
  }
}