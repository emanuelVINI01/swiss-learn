import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isTargetLang, findActiveQuiz } from "@/lib/server/quiz";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lang = request.nextUrl.searchParams.get("lang");
  if (!lang || !isTargetLang(lang)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const quiz = await findActiveQuiz(session.user.id, lang);
  return NextResponse.json({ quiz });
}
