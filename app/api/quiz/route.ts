import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isTargetLang, listActiveQuizzes } from "@/lib/server/quiz";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lang = request.nextUrl.searchParams.get("lang") ?? "";
  if (!isTargetLang(lang)) {
    return NextResponse.json({ error: "Invalid lang" }, { status: 400 });
  }

  const quizzes = await listActiveQuizzes(session.user.id, lang);
  return NextResponse.json({ quizzes });
}
