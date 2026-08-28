-- AlterTable
ALTER TABLE "PhraseBase" ADD COLUMN     "difficulty" INTEGER NOT NULL DEFAULT 500;

-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "difficulty" INTEGER NOT NULL DEFAULT 500;

-- AlterTable
ALTER TABLE "WordBase" ADD COLUMN     "difficulty" INTEGER NOT NULL DEFAULT 500;
