import "server-only";
import { prisma } from "@/lib/prisma";

export type WordRow = {
  id: string;
  sourceText: string;
  targetText: string;
  distractors: string[];
  difficulty: number;
};

export type WordPoolEntry = { id: string; difficulty: number };

export interface WordRepository {
  findPool(sourceLang: string, targetLang: string): Promise<WordPoolEntry[]>;
  findSourceTextPool(sourceLang: string, targetLang: string): Promise<string[]>;
  findByIds(ids: string[]): Promise<WordRow[]>;
}

const POOL_CACHE_TTL_MS = 60_000;

// Word ids/texts are cheap to list and expensive to `ORDER BY random()` at
// scale, so each pool is cached briefly and sampled in application code.
export class PrismaWordRepository implements WordRepository {
  private idPoolCache = new Map<string, { entries: WordPoolEntry[]; expiresAt: number }>();
  private textPoolCache = new Map<string, { texts: string[]; expiresAt: number }>();

  async findPool(sourceLang: string, targetLang: string): Promise<WordPoolEntry[]> {
    const key = `${sourceLang}:${targetLang}`;
    const cached = this.idPoolCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.entries;

    const entries = await prisma.wordBase.findMany({
      where: { sourceLang, targetLang },
      select: { id: true, difficulty: true },
    });
    this.idPoolCache.set(key, { entries, expiresAt: Date.now() + POOL_CACHE_TTL_MS });
    return entries;
  }

  async findSourceTextPool(sourceLang: string, targetLang: string): Promise<string[]> {
    const key = `${sourceLang}:${targetLang}`;
    const cached = this.textPoolCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.texts;

    const rows = await prisma.wordBase.findMany({
      where: { sourceLang, targetLang },
      select: { sourceText: true },
    });
    const texts = rows.map((r) => r.sourceText);
    this.textPoolCache.set(key, { texts, expiresAt: Date.now() + POOL_CACHE_TTL_MS });
    return texts;
  }

  async findByIds(ids: string[]): Promise<WordRow[]> {
    return prisma.wordBase.findMany({
      where: { id: { in: ids } },
      select: { id: true, sourceText: true, targetText: true, distractors: true, difficulty: true },
    });
  }
}

export const wordRepository: WordRepository = new PrismaWordRepository();
