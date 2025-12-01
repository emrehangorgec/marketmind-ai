import { NextRequest, NextResponse } from "next/server";
import { analysisGraph } from "@/lib/orchestrator/graph";

export const runtime = "nodejs"; // Force Node.js runtime for LangGraph/AsyncHooks

export async function POST(req: NextRequest) {
  try {
    const { symbol } = await req.json();
    
    if (!symbol) {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const graphStream = await analysisGraph.stream({ symbol });
          
          for await (const event of graphStream) {
            // event is { [nodeName]: Partial<GraphState> }
            const chunk = JSON.stringify(event) + "\n";
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error("Graph execution error:", error);
          const errChunk = JSON.stringify({ error: (error as Error).message }) + "\n";
          controller.enqueue(encoder.encode(errChunk));
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
