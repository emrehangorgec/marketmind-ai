"use client";

import { useEffect, useState } from "react";
import { AnalysisRecord } from "@/lib/types/analysis";
import { getStoredAnalyses } from "@/lib/utils/storage";

export function useLocalAnalyses() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    setAnalyses(getStoredAnalyses());
    
    const handleWindow = () => setAnalyses(getStoredAnalyses());
    window.addEventListener("storage", handleWindow);
    return () => window.removeEventListener("storage", handleWindow);
  }, []);

  return analyses;
}
