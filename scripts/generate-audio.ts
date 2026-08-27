// Standalone offline tool: generates one Swiss German pronunciation clip per
// distinct word in WORD_ENTRIES via edge-tts, then stamps every matching
// WordBase row (one per target language) with the resulting audioUrl.
// Never runs as part of the app itself — run manually with `npm run generate:audio`.
import "dotenv/config";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { WORD_ENTRIES } from "../prisma/word-data";
import { TtsService } from "./audio/tts-service";

const SOURCE_LANG = "gsw";
const OUTPUT_DIR = path.join(process.cwd(), "public", "audio", "words");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });
const tts = TtsService.getInstance();

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const uniqueWords = [...new Map(WORD_ENTRIES.map((entry) => [entry.swiss, entry])).values()];

  let generated = 0;
  let reused = 0;

  await Promise.all(
    uniqueWords.map(async (word) => {
      const filename = `${slugify(word.swiss)}.mp3`;
      const outputPath = path.join(OUTPUT_DIR, filename);
      const audioUrl = `/audio/words/${filename}`;

      if (existsSync(outputPath)) {
        reused++;
      } else {
        await tts.generateAudio({ text: word.swiss, outputPath });
        generated++;
        console.log(`Generated ${filename}`);
      }

      await prisma.wordBase.updateMany({
        where: { sourceLang: SOURCE_LANG, sourceText: word.swiss },
        data: { audioUrl },
      });
    })
  );

  console.log(`Done. Generated ${generated} new clip(s), reused ${reused} existing.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
