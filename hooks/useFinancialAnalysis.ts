"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FinancialOrchestrator } from "@/lib/orchestrator/financial-orchestrator";
import {
  AgentError,
  AnalysisRecord,
  AnalysisState,
} from "@/lib/types/analysis";
import { saveAnalysis } from "@/lib/utils/storage";

const DEFAULT_STATE: AnalysisState = {
  phase: "idle",
  progress: 0,
  activeAgent: null,
  results: {},
  errors: [],
};

export function useFinancialAnalysis(symbol: string) {
  const orchestratorRef = useRef<FinancialOrchestrator | null>(null);
  const [state, setState] = useState<AnalysisState>(DEFAULT_STATE);
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [error, setError] = useState<AgentError | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const orchestrator = new FinancialOrchestrator();
    orchestratorRef.current = orchestrator;
    orchestrator.on("state", (next) => setState({ ...next }));
    orchestrator.on("error", (err) => setError(err));

    return () => {
      orchestrator.removeAllListeners();
    };
  }, []);

  const analyze = useCallback(async () => {
    if (!symbol) return;
    setIsRunning(true);
    setError(null);
    setRecord(null);
    try {
      const orchestrator = orchestratorRef.current;
      if (!orchestrator) throw new Error("Orchestrator unavailable");
      const analysisRecord = await orchestrator.analyzeStock(symbol);
      setRecord(analysisRecord);
      saveAnalysis(analysisRecord);
    } catch (err) {
      setError(err as AgentError);
    } finally {
      setIsRunning(false);
    }
  }, [symbol]);

  useEffect(() => {
    analyze();
  }, [analyze]);

  const statusText = useMemo(() => {
    switch (state.phase) {
      case "data":
        return "Gathering market data";
      case "analysis":
        return "Running technical, fundamental, and sentiment checks";
      case "risk":
        return "Assessing risk profile";
      case "report":
        return "Compiling executive report";
      case "completed":
        return "Analysis ready";
      case "error":
        return "Analysis failed";
      default:
        return "Initializing";
    }
  }, [state.phase]);

  return {
    state,
    record,
    error,
    statusText,
    isRunning,
    analyze,
  };
}
