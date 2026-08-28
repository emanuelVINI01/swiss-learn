import "server-only";
import { prisma } from "@/lib/prisma";

export type UserProgressRow = { xp: number; lastStudy: Date | null };

export interface UserProgressRepository {
  findXp(userId: string, language: string): Promise<number>;
  find(userId: string, language: string): Promise<UserProgressRow | null>;
  findOrCreate(userId: string, language: string): Promise<UserProgressRow>;
}

export class PrismaUserProgressRepository implements UserProgressRepository {
  async findXp(userId: string, language: string): Promise<number> {
    const progress = await prisma.userProgress.findUnique({
      where: { userId_language: { userId, language } },
      select: { xp: true },
    });
    return progress?.xp ?? 0;
  }

  async find(userId: string, language: string): Promise<UserProgressRow | null> {
    return prisma.userProgress.findUnique({
      where: { userId_language: { userId, language } },
      select: { xp: true, lastStudy: true },
    });
  }

  // Private dashboard only — a visit there implies the player wants a
  // progress row to exist so the next completed quiz has somewhere to write
  // XP. Never call this for an anonymous/public-profile lookup (see find()).
  async findOrCreate(userId: string, language: string): Promise<UserProgressRow> {
    const existing = await this.find(userId, language);
    if (existing) return existing;
    return prisma.userProgress.create({
      data: { userId, language, xp: 0, streak: 0 },
      select: { xp: true, lastStudy: true },
    });
  }
}

export const userProgressRepository: UserProgressRepository = new PrismaUserProgressRepository();
