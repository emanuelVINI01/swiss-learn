import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseBody } from "@/lib/server/http";
import { answerQuestion } from "@/lib/server/quiz";
import z from "zod";

const answerSchema = z.object({
  questionId: z.string().min(1),
  selected: z.string().min(1),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireAuth(request, async (authedRequest) => {
    const parsed = await parseBody(authedRequest, answerSchema);
    if (parsed instanceof NextResponse) return parsed;

    const { id } = await params;
    try {
      const result = await answerQuestion(authedRequest.userId, id, parsed.questionId, parsed.selected);
      return NextResponse.json(result);
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
    }
  });
}
