import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isTargetLang, startQuiz } from "@/lib/server/quiz";
import z from "zod";

const startSchema = z.object({
  lang: z.string(),
  mode: z.enum(["level", "random"]),
  type: z.enum(["word", "phraseFill", "phraseMeaning"]).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = startSchema.safeParse(body);
  if (!parsed.success || !isTargetLang(parsed.data.lang)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const quiz = await startQuiz(session.user.id, parsed.data.lang, parsed.data.mode, parsed.data.type);
  return NextResponse.json({ quiz });
}
