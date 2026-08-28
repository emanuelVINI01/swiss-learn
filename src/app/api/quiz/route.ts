import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseBody } from "@/lib/server/http";
import { isTargetLang, startQuiz } from "@/lib/server/quiz";
import z from "zod";

const startSchema = z.object({
  lang: z.string().refine(isTargetLang),
  mode: z.enum(["level", "random"]),
  type: z.enum(["word", "phraseFill", "phraseMeaning"]).optional(),
});

export async function POST(request: NextRequest) {
  const authed = await requireAuth();
  if (authed instanceof NextResponse) return authed;

  const parsed = await parseBody(request, startSchema);
  if (parsed instanceof NextResponse) return parsed;

  const quiz = await startQuiz(authed.userId, parsed.lang, parsed.mode, parsed.type);
  return NextResponse.json({ quiz });
}
