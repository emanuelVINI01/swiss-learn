import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import z from "zod";

const saveSchema = z.object({
  language: z.string().min(1).max(10),
  results: z.array(z.object({
    wordId: z.string(),
    correct: z.boolean(),
  })).min(1).max(50),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = saveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { language, results } = parsed.data;
  const userId = session.user.id;
  const correctCount = results.filter((r) => r.correct).length;
  const xpGained = correctCount * 10;

  // Save attempts
  await prisma.quizAttempt.createMany({
    data: results.map((r) => ({
      userId,
      language,
      wordId: r.wordId,
      correct: r.correct,
    })),
  });

  // Update or create progress
  await prisma.userProgress.upsert({
    where: { userId_language: { userId, language } },
    update: {
      xp: { increment: xpGained },
      lastStudy: new Date(),
    },
    create: {
      userId,
      language,
      xp: xpGained,
      streak: 1,
      lastStudy: new Date(),
    },
  });

  return NextResponse.json({ success: true, xpGained });
}
