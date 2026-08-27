import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { WORD_ENTRIES } from "./word-data";

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

async function main() {
  for (const targetLang of TARGET_LANGS) {
    const rows = WORD_ENTRIES.map((entry) => ({
      sourceText: entry.swiss,
      category: entry.category,
      targetText: entry.meaning[targetLang],
    }));

    for (const row of rows) {
      const otherAnswers = rows
        .filter((r) => r.sourceText !== row.sourceText && r.targetText !== row.targetText)
        .map((r) => r.targetText);
      const distractors = shuffle(otherAnswers).slice(0, 3);

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
          distractors,
          category: row.category,
        },
        create: {
          sourceLang: SOURCE_LANG,
          targetLang,
          sourceText: row.sourceText,
          targetText: row.targetText,
          distractors,
          category: row.category,
        },
      });
    }

    console.log(`Seeded ${rows.length} words for gsw -> ${targetLang}`);
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
