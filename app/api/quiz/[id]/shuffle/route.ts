import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { shuffleQuiz } from "@/lib/server/quiz";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const quizzes = await shuffleQuiz(session.user.id, id);
    return NextResponse.json({ quizzes });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
