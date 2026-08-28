import "server-only";
import { prisma } from "@/lib/prisma";

export type RankingCount = { ownerId: string; count: number };
export type UserSummary = { id: string; name: string | null; image: string | null };

export interface RankingRepository {
  countCompletedByOwnerSince(since: Date, limit: number): Promise<RankingCount[]>;
  findUsersByIds(ids: string[]): Promise<UserSummary[]>;
}

export class PrismaRankingRepository implements RankingRepository {
  async countCompletedByOwnerSince(since: Date, limit: number): Promise<RankingCount[]> {
    const grouped = await prisma.quiz.groupBy({
      by: ["ownerId"],
      where: { status: "completed", endedAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });
    return grouped.map((g) => ({ ownerId: g.ownerId, count: g._count.id }));
  }

  async findUsersByIds(ids: string[]): Promise<UserSummary[]> {
    return prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, image: true },
    });
  }
}

export const rankingRepository: RankingRepository = new PrismaRankingRepository();
