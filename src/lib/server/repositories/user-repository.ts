import "server-only";
import { prisma } from "@/lib/prisma";

export type UserSummary = { id: string; name: string | null; image: string | null };

export interface UserRepository {
  findSummaryById(userId: string): Promise<UserSummary | null>;
}

export class PrismaUserRepository implements UserRepository {
  async findSummaryById(userId: string): Promise<UserSummary | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, image: true },
    });
  }
}

export const userRepository: UserRepository = new PrismaUserRepository();
