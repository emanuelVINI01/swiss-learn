import "server-only";
import { rankingRepository } from "./repositories";

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

  const counts = await rankingRepository.countCompletedByOwnerSince(since, RANKING_SIZE);
  if (counts.length === 0) return [];

  const users = await rankingRepository.findUsersByIds(counts.map((c) => c.ownerId));
  const usersById = new Map(users.map((u) => [u.id, u]));

  return counts.map((c) => ({
    userId: c.ownerId,
    name: usersById.get(c.ownerId)?.name ?? null,
    image: usersById.get(c.ownerId)?.image ?? null,
    lessonsCount: c.count,
  }));
}
