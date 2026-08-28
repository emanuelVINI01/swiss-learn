import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/http";
import { getQuizForPlay } from "@/lib/server/quiz";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authed = await requireAuth();
  if (authed instanceof NextResponse) return authed;

  const { id } = await params;
  const quiz = await getQuizForPlay(authed.userId, id);
  if (!quiz) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ quiz });
}
