import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/http";
import {
  getOrCreateProgress,
  getQuizStats,
  listQuizHistory,
  getStreakActivity,
  getCurrentStreak,
} from "@/lib/server/quiz";

// JSON mirror of what src/app/[lang]/(app)/dashboard/page.tsx already
// computes server-side for the React Server Component — same functions,
// same Promise.all shape, just serialized instead of passed as props.
export async function GET(request: Request) {
  return requireAuth(request, async (authedRequest) => {
    const [progress, { totalQuizzes, accuracy, skills }, history, streakDays] = await Promise.all([
      getOrCreateProgress(authedRequest.userId),
      getQuizStats(authedRequest.userId),
      listQuizHistory(authedRequest.userId),
      getStreakActivity(authedRequest.userId),
    ]);

    return NextResponse.json({
      progress: {
        xp: progress.xp,
        streak: getCurrentStreak(streakDays),
        lastStudy: progress.lastStudy,
      },
      stats: { totalQuizzes, accuracy },
      skills,
      streakDays,
      history,
    });
  });
}
