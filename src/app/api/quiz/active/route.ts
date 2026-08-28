import { NextRequest, NextResponse } from "next/server";
import { useAuth } from "@/lib/server/http";
import { isTargetLang, findActiveQuiz } from "@/lib/server/quiz";

export async function GET(request: NextRequest) {
  return useAuth(request, async (authedRequest) => {
    const lang = authedRequest.nextUrl.searchParams.get("lang");
    if (!lang || !isTargetLang(lang)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const quiz = await findActiveQuiz(authedRequest.userId, lang);
    return NextResponse.json({ quiz });
  });
}
