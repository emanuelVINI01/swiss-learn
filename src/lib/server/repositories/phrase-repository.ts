import "server-only";
import { prisma } from "@/lib/prisma";

export type PhraseRow = {
  id: string;
  sourceText: string;
  targetText: string;
  distractors: string[];
  difficulty: number;
};

export type PhrasePoolEntry = { id: string; difficulty: number };

export interface PhraseRepository {
  findPool(sourceLang: string, targetLang: string): Promise<PhrasePoolEntry[]>;
  findByIds(ids: string[]): Promise<PhraseRow[]>;
}

const POOL_CACHE_TTL_MS = 60_000;

// Same pooled-id + sample-in-app-code pattern as WordRepository — cheap to
// list, expensive to `ORDER BY random()` at scale.
export class PrismaPhraseRepository implements PhraseRepository {
  private idPoolCache = new Map<string, { entries: PhrasePoolEntry[]; expiresAt: number }>();

  async findPool(sourceLang: string, targetLang: string): Promise<PhrasePoolEntry[]> {
    const key = `${sourceLang}:${targetLang}`;
    const cached = this.idPoolCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.entries;

    const entries = await prisma.phraseBase.findMany({
      where: { sourceLang, targetLang },
      select: { id: true, difficulty: true },
    });
    this.idPoolCache.set(key, { entries, expiresAt: Date.now() + POOL_CACHE_TTL_MS });
    return entries;
  }

  async findByIds(ids: string[]): Promise<PhraseRow[]> {
    return prisma.phraseBase.findMany({
      where: { id: { in: ids } },
      select: { id: true, sourceText: true, targetText: true, distractors: true, difficulty: true },
    });
  }
}

export const phraseRepository: PhraseRepository = new PrismaPhraseRepository();
