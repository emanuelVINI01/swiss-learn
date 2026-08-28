import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseBody } from "@/lib/server/http";
import { isTargetLang, shuffleQuiz } from "@/lib/server/quiz";
import z from "zod";

const shuffleSchema = z.object({ lang: z.string().refine(isTargetLang) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireAuth(request, async (authedRequest) => {
    const parsed = await parseBody(authedRequest, shuffleSchema);
    if (parsed instanceof NextResponse) return parsed;

    const { id } = await params;
    try {
      const quiz = await shuffleQuiz(authedRequest.userId, id, parsed.lang);
      return NextResponse.json({ quiz });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
    }
  });
}
