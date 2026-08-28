import { NextResponse } from "next/server";
import { useAuth } from "@/lib/server/http";
import { getQuizForPlay } from "@/lib/server/quiz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return useAuth(request, async (authedRequest) => {
    const { id } = await params;
    const quiz = await getQuizForPlay(authedRequest.userId, id);
    if (!quiz) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ quiz });
  });
}
