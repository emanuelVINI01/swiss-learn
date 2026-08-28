import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { WORD_ENTRIES } from "./language/swiss/words";
import { PHRASE_ENTRIES } from "./language/swiss/phrases";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const SOURCE_LANG = "gsw";
const TARGET_LANGS = ["en", "pt", "de"] as const;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Row = { sourceText: string; category: string; difficulty: number; targetText: string };

// Same shape for both WordBase and PhraseBase: pick 3 wrong answers from
// the sibling rows in the same target language, excluding same-text answers.
function withDistractors(rows: Row[]) {
  return rows.map((row) => {
    const otherAnswers = rows
      .filter((r) => r.sourceText !== row.sourceText && r.targetText !== row.targetText)
      .map((r) => r.targetText);
    return { ...row, distractors: shuffle(otherAnswers).slice(0, 3) };
  });
}

async function main() {
  for (const targetLang of TARGET_LANGS) {
    const wordRows = withDistractors(
      WORD_ENTRIES.map((entry) => ({
        sourceText: entry.swiss,
        category: entry.category,
        difficulty: entry.difficulty,
        targetText: entry.meaning[targetLang],
      }))
    );

    for (const row of wordRows) {
      await prisma.wordBase.upsert({
        where: {
          sourceLang_targetLang_sourceText: {
            sourceLang: SOURCE_LANG,
            targetLang,
            sourceText: row.sourceText,
          },
        },
        update: {
          targetText: row.targetText,
          distractors: row.distractors,
          category: row.category,
          difficulty: row.difficulty,
        },
        create: { sourceLang: SOURCE_LANG, targetLang, ...row },
      });
    }

    console.log(`Seeded ${wordRows.length} words for gsw -> ${targetLang}`);

    const phraseRows = withDistractors(
      PHRASE_ENTRIES.map((entry) => ({
        sourceText: entry.swiss,
        category: entry.category,
        difficulty: entry.difficulty,
        targetText: entry.meaning[targetLang],
      }))
    );

    for (const row of phraseRows) {
      await prisma.phraseBase.upsert({
        where: {
          sourceLang_targetLang_sourceText: {
            sourceLang: SOURCE_LANG,
            targetLang,
            sourceText: row.sourceText,
          },
        },
        update: {
          targetText: row.targetText,
          distractors: row.distractors,
          category: row.category,
          difficulty: row.difficulty,
        },
        create: { sourceLang: SOURCE_LANG, targetLang, ...row },
      });
    }

    console.log(`Seeded ${phraseRows.length} phrases for gsw -> ${targetLang}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
