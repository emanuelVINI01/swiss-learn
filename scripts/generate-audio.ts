// Standalone offline tool: generates one Swiss German pronunciation clip per
// distinct word/phrase via edge-tts, then stamps the matching WordBase /
// PhraseBase rows (one per target language) with the resulting audioUrl.
// Never runs as part of the app itself — run manually with `npm run generate:audio`.
import "dotenv/config";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { WORD_ENTRIES } from "../prisma/language/swiss/words";
import { PHRASE_ENTRIES } from "../prisma/language/swiss/phrases";
import { TtsService } from "./audio/tts-service";

const SOURCE_LANG = "gsw";

function slugify(text: string): string {
  return text
    .toLowerCase()
    // German-style transliteration first: NFD-stripping alone would collapse
    // distinct words like "Zäh" (ten) and "Zah" (tooth) onto the same slug.
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });
const tts = TtsService.getInstance();

async function generateBatch(
  entries: { swiss: string }[],
  outputDir: string,
  urlPrefix: string,
  stampAudioUrl: (sourceText: string, audioUrl: string) => Promise<unknown>
): Promise<{ generated: number; reused: number }> {
  await mkdir(outputDir, { recursive: true });

  const unique = [...new Map(entries.map((e) => [e.swiss, e])).values()];
  let generated = 0;
  let reused = 0;

  await Promise.all(
    unique.map(async (entry) => {
      const filename = `${slugify(entry.swiss)}.mp3`;
      const outputPath = path.join(outputDir, filename);
      const audioUrl = `${urlPrefix}/${filename}`;

      if (existsSync(outputPath)) {
        reused++;
      } else {
        await tts.generateAudio({ text: entry.swiss, outputPath });
        generated++;
        console.log(`Generated ${filename}`);
      }

      await stampAudioUrl(entry.swiss, audioUrl);
    })
  );

  return { generated, reused };
}

async function main() {
  const words = await generateBatch(
    WORD_ENTRIES,
    path.join(process.cwd(), "public", "audio", "words"),
    "/audio/words",
    (sourceText, audioUrl) =>
      prisma.wordBase.updateMany({ where: { sourceLang: SOURCE_LANG, sourceText }, data: { audioUrl } })
  );
  console.log(`Words done. Generated ${words.generated} new clip(s), reused ${words.reused} existing.`);

  const phrases = await generateBatch(
    PHRASE_ENTRIES,
    path.join(process.cwd(), "public", "audio", "phrases"),
    "/audio/phrases",
    (sourceText, audioUrl) =>
      prisma.phraseBase.updateMany({ where: { sourceLang: SOURCE_LANG, sourceText }, data: { audioUrl } })
  );
  console.log(`Phrases done. Generated ${phrases.generated} new clip(s), reused ${phrases.reused} existing.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
