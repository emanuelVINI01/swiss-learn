import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { answerQuestion } from "@/lib/server/quiz";
import z from "zod";

const answerSchema = z.object({
  questionId: z.string().min(1),
  selected: z.string().min(1),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id } = await params;
  try {
    const result = await answerQuestion(session.user.id, id, parsed.data.questionId, parsed.data.selected);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
