import "server-only";
import { prisma } from "@/lib/prisma";

export interface UserProgressRepository {
  findXp(userId: string, language: string): Promise<number>;
}

export class PrismaUserProgressRepository implements UserProgressRepository {
  async findXp(userId: string, language: string): Promise<number> {
    const progress = await prisma.userProgress.findUnique({
      where: { userId_language: { userId, language } },
      select: { xp: true },
    });
    return progress?.xp ?? 0;
  }
}

export const userProgressRepository: UserProgressRepository = new PrismaUserProgressRepository();
