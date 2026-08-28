import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/http";
import { isTargetLang, findActiveQuiz } from "@/lib/server/quiz";

export async function GET(request: NextRequest) {
  const authed = await requireAuth();
  if (authed instanceof NextResponse) return authed;

  const lang = request.nextUrl.searchParams.get("lang");
  if (!lang || !isTargetLang(lang)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const quiz = await findActiveQuiz(authed.userId, lang);
  return NextResponse.json({ quiz });
}
