import "server-only";
import { prisma } from "@/lib/prisma";

export const RANKING_PERIODS = ["day", "week", "month"] as const;
export type RankingPeriod = (typeof RANKING_PERIODS)[number];

export function isRankingPeriod(value: string): value is RankingPeriod {
  return (RANKING_PERIODS as readonly string[]).includes(value);
}

const RANKING_SIZE = 10;

function periodStart(period: RankingPeriod): Date {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "day") return start;
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);

  // week: back to the most recent Monday
  const dayOfWeek = start.getDay(); // 0 = Sunday
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  start.setDate(start.getDate() - diffToMonday);
  return start;
}

export type RankingEntry = {
  userId: string;
  name: string | null;
  image: string | null;
  lessonsCount: number;
};

// "Lessons" = completed quizzes. Ranked globally across all learning languages.
export async function getRanking(period: RankingPeriod): Promise<RankingEntry[]> {
  const since = periodStart(period);

  const grouped = await prisma.quiz.groupBy({
    by: ["ownerId"],
    where: { status: "completed", endedAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: RANKING_SIZE,
  });
  if (grouped.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.ownerId) } },
    select: { id: true, name: true, image: true },
  });
  const usersById = new Map(users.map((u) => [u.id, u]));

  return grouped.map((g) => ({
    userId: g.ownerId,
    name: usersById.get(g.ownerId)?.name ?? null,
    image: usersById.get(g.ownerId)?.image ?? null,
    lessonsCount: g._count.id,
  }));
}
