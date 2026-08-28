import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/http";
import { finishQuiz } from "@/lib/server/quiz";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authed = await requireAuth();
  if (authed instanceof NextResponse) return authed;

  const { id } = await params;
  try {
    const result = await finishQuiz(authed.userId, id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
