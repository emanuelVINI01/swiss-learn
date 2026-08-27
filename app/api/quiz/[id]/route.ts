import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getQuizForPlay } from "@/lib/server/quiz";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quiz = await getQuizForPlay(session.user.id, id);
  if (!quiz) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ quiz });
}
