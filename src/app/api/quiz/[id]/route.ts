import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/http";
import { getQuizForPlay } from "@/lib/server/quiz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return requireAuth(request, async (authedRequest) => {
    const { id } = await params;
    const quiz = await getQuizForPlay(authedRequest.userId, id);
    if (!quiz) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ quiz });
  });
}
