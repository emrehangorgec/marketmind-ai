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
        let closed = false;
        let iterator: AsyncIterator<unknown> | null = null;

        const safeClose = () => {
          if (!closed) {
            closed = true;
            controller.close();
          }
        };

        const safeCancel = async () => {
          if (iterator?.return) {
            try {
              await iterator.return();
            } catch {
              // ignore
            }
          }
        };

        req.signal.addEventListener("abort", () => {
          safeCancel();
          safeClose();
        });

        try {
          const graphStream = await analysisGraph.stream({ symbol });
          iterator = graphStream[Symbol.asyncIterator]();

          while (true) {
            const { value, done } = await iterator.next();
            if (closed || done) break;
            const chunk = JSON.stringify(value) + "\n";
            controller.enqueue(encoder.encode(chunk));
          }
          safeClose();
        } catch (error) {
          console.error("Graph execution error:", error);
          if (!closed) {
            const errChunk = JSON.stringify({ error: (error as Error).message }) + "\n";
            controller.enqueue(encoder.encode(errChunk));
          }
          await safeCancel();
          safeClose();
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
  } catch (error) {
    console.error("Analyze stream error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
