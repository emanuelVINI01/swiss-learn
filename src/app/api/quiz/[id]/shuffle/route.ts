import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isTargetLang, shuffleQuiz } from "@/lib/server/quiz";
import z from "zod";

const shuffleSchema = z.object({ lang: z.string() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = shuffleSchema.safeParse(body);
  if (!parsed.success || !isTargetLang(parsed.data.lang)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id } = await params;
  try {
    const quiz = await shuffleQuiz(session.user.id, id, parsed.data.lang);
    return NextResponse.json({ quiz });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
