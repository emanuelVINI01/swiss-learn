import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseBody } from "@/lib/server/http";
import { isTargetLang, shuffleQuiz } from "@/lib/server/quiz";
import z from "zod";

const shuffleSchema = z.object({ lang: z.string().refine(isTargetLang) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authed = await requireAuth();
  if (authed instanceof NextResponse) return authed;

  const parsed = await parseBody(request, shuffleSchema);
  if (parsed instanceof NextResponse) return parsed;

  const { id } = await params;
  try {
    const quiz = await shuffleQuiz(authed.userId, id, parsed.lang);
    return NextResponse.json({ quiz });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
