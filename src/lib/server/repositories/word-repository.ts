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

// Text + category for every seeded word — lets distractor generation stay
// within the same category as the correct answer (see phrases.ts) instead
// of sampling from every category regardless of grammatical fit.
export type WordTextEntry = { sourceText: string; category: string };

export interface WordRepository {
  findPool(sourceLang: string, targetLang: string): Promise<WordPoolEntry[]>;
  findSourceTextPool(sourceLang: string, targetLang: string): Promise<WordTextEntry[]>;
  findByIds(ids: string[]): Promise<WordRow[]>;
}

const POOL_CACHE_TTL_MS = 60_000;

// Word ids/texts are cheap to list and expensive to `ORDER BY random()` at
// scale, so each pool is cached briefly and sampled in application code.
export class PrismaWordRepository implements WordRepository {
  private idPoolCache = new Map<string, { entries: WordPoolEntry[]; expiresAt: number }>();
  private textPoolCache = new Map<string, { texts: WordTextEntry[]; expiresAt: number }>();

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

  async findSourceTextPool(sourceLang: string, targetLang: string): Promise<WordTextEntry[]> {
    const key = `${sourceLang}:${targetLang}`;
    const cached = this.textPoolCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.texts;

    const texts = await prisma.wordBase.findMany({
      where: { sourceLang, targetLang },
      select: { sourceText: true, category: true },
    });
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
