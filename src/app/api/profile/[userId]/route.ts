import { NextResponse } from "next/server";
import { getUserSummary, getXp, getQuizStats, getStreakActivity, getCurrentStreak } from "@/lib/server/quiz";

// JSON mirror of src/app/[lang]/profile/[userId]/page.tsx — public,
// unauthenticated, read-only. Uses getXp (never getOrCreateProgress) so an
// anonymous visit never creates a UserProgress row, same as the web page.
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await getUserSummary(userId);
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [xp, stats, streakDays] = await Promise.all([
    getXp(userId),
    getQuizStats(userId),
    getStreakActivity(userId),
  ]);

  return NextResponse.json({
    user: { name: user.name, image: user.image },
    xp,
    streak: getCurrentStreak(streakDays),
    stats: { totalQuizzes: stats.totalQuizzes, accuracy: stats.accuracy },
    skills: stats.skills,
    streakDays,
  });
}
