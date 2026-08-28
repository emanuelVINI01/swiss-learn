import { NextResponse } from "next/server";
import { useAuth } from "@/lib/server/http";
import { finishQuiz } from "@/lib/server/quiz";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return useAuth(request, async (authedRequest) => {
    const { id } = await params;
    try {
      const result = await finishQuiz(authedRequest.userId, id);
      return NextResponse.json(result);
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
    }
  });
}
