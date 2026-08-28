-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_wordBaseId_fkey";

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "xpGained" INTEGER;

-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "phraseBaseId" TEXT,
ADD COLUMN     "questionType" TEXT NOT NULL DEFAULT 'word',
ALTER COLUMN "wordBaseId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PhraseBase" (
    "id" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "targetText" TEXT NOT NULL,
    "distractors" TEXT[],
    "category" TEXT NOT NULL DEFAULT 'general',
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhraseBase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhraseBase_sourceLang_targetLang_idx" ON "PhraseBase"("sourceLang", "targetLang");

-- CreateIndex
CREATE UNIQUE INDEX "PhraseBase_sourceLang_targetLang_sourceText_key" ON "PhraseBase"("sourceLang", "targetLang", "sourceText");

-- CreateIndex
CREATE INDEX "QuizQuestion_phraseBaseId_idx" ON "QuizQuestion"("phraseBaseId");

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_wordBaseId_fkey" FOREIGN KEY ("wordBaseId") REFERENCES "WordBase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_phraseBaseId_fkey" FOREIGN KEY ("phraseBaseId") REFERENCES "PhraseBase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
