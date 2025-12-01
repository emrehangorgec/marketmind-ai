import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { 
  AnalysisState, 
  MarketDataPayload, 
  TechnicalAnalysisPayload, 
  FundamentalAnalysisPayload, 
  SentimentAnalysisPayload, 
  RiskAnalysisPayload, 
  ReportPayload,
  AgentError
} from "@/lib/types/analysis";
import { MarketDataAgent } from "@/lib/agents/market-data-agent";
import { TechnicalAnalysisAgent } from "@/lib/agents/technical-analysis-agent";
import { FundamentalAnalysisAgent } from "@/lib/agents/fundamental-analysis-agent";
import { SentimentAnalysisAgent } from "@/lib/agents/sentiment-analysis-agent";
import { RiskManagerAgent } from "@/lib/agents/risk-manager-agent";
import { ReportGeneratorAgent } from "@/lib/agents/report-generator-agent";

// 1. State Definition with Annotation
// Modern LangGraph uses Annotation to define the state schema and reducers.
export const GraphAnnotation = Annotation.Root({
  symbol: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  marketData: Annotation<MarketDataPayload | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  technical: Annotation<TechnicalAnalysisPayload | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  fundamental: Annotation<FundamentalAnalysisPayload | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  sentiment: Annotation<SentimentAnalysisPayload | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  risk: Annotation<RiskAnalysisPayload | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  report: Annotation<ReportPayload | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  errors: Annotation<AgentError[]>({
    reducer: (x, y) => (x ?? []).concat(y ?? []),
    default: () => [],
  }),
});

// Export the type derived from the Annotation for use in other files
export type GraphState = typeof GraphAnnotation.State;

// 2. Node Definitions
const marketDataAgent = new MarketDataAgent();
const technicalAgent = new TechnicalAnalysisAgent();
const fundamentalAgent = new FundamentalAnalysisAgent();
const sentimentAgent = new SentimentAnalysisAgent();
const riskAgent = new RiskManagerAgent();
const reportAgent = new ReportGeneratorAgent();

async function marketDataNode(state: GraphState): Promise<Partial<GraphState>> {
  try {
    const result = await marketDataAgent.execute(state.symbol);
    return { marketData: result };
  } catch (error) {
    return { errors: [...(state.errors || []), error as AgentError] };
  }
}

async function technicalNode(state: GraphState): Promise<Partial<GraphState>> {
  if (!state.marketData) return {};
  try {
    const result = await technicalAgent.execute(state.marketData);
    return { technical: result };
  } catch (error) {
    return { errors: [...(state.errors || []), error as AgentError] };
  }
}

async function fundamentalNode(state: GraphState): Promise<Partial<GraphState>> {
  if (!state.marketData) return {};
  try {
    const result = await fundamentalAgent.execute(state.marketData);
    return { fundamental: result };
  } catch (error) {
    return { errors: [...(state.errors || []), error as AgentError] };
  }
}

async function sentimentNode(state: GraphState): Promise<Partial<GraphState>> {
  if (!state.marketData) return {};
  try {
    const result = await sentimentAgent.execute(state.marketData);
    return { sentiment: result };
  } catch (error) {
    return { errors: [...(state.errors || []), error as AgentError] };
  }
}

async function riskNode(state: GraphState): Promise<Partial<GraphState>> {
  if (!state.marketData || !state.technical || !state.sentiment) return {};
  try {
    const result = await riskAgent.execute({ 
      marketData: state.marketData,
      technical: state.technical,
      sentiment: state.sentiment
    });
    return { risk: result };
  } catch (error) {
    return { errors: [...(state.errors || []), error as AgentError] };
  }
}

async function reportNode(state: GraphState): Promise<Partial<GraphState>> {
  if (!state.marketData || !state.technical || !state.fundamental || !state.sentiment || !state.risk) return {};
  try {
    const result = await reportAgent.execute({ 
      marketData: state.marketData,
      technical: state.technical,
      fundamental: state.fundamental,
      sentiment: state.sentiment,
      risk: state.risk
    });
    return { report: result };
  } catch (error) {
    return { errors: [...(state.errors || []), error as AgentError] };
  }
}

// 3. Graph Construction
// Pass the Annotation directly to StateGraph
const workflow = new StateGraph(GraphAnnotation)
  .addNode("fetchMarketData", marketDataNode)
  .addNode("analyzeTechnical", technicalNode)
  .addNode("analyzeFundamental", fundamentalNode)
  .addNode("analyzeSentiment", sentimentNode)
  .addNode("assessRisk", riskNode)
  .addNode("generateReport", reportNode)

  // Define the flow
  .addEdge(START, "fetchMarketData")
  
  // Parallel Execution
  .addEdge("fetchMarketData", "analyzeTechnical")
  .addEdge("fetchMarketData", "analyzeFundamental")
  .addEdge("fetchMarketData", "analyzeSentiment")
  
  // Synchronization
  .addEdge("analyzeTechnical", "assessRisk")
  .addEdge("analyzeFundamental", "assessRisk")
  .addEdge("analyzeSentiment", "assessRisk")
  
  .addEdge("assessRisk", "generateReport")
  .addEdge("generateReport", END);

// Compile the graph
export const analysisGraph = workflow.compile();
