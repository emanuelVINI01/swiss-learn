-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_userId_fkey";

-- DropTable
DROP TABLE "QuizAttempt";

-- CreateTable
CREATE TABLE "WordBase" (
    "id" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "targetText" TEXT NOT NULL,
    "distractors" TEXT[],
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'word',
    "sourceLang" TEXT NOT NULL DEFAULT 'gsw',
    "targetLang" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "total" INTEGER NOT NULL,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "wordBaseId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "options" TEXT[],
    "selected" TEXT,
    "correct" BOOLEAN,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WordBase_sourceLang_targetLang_idx" ON "WordBase"("sourceLang", "targetLang");

-- CreateIndex
CREATE INDEX "Quiz_ownerId_targetLang_status_idx" ON "Quiz"("ownerId", "targetLang", "status");

-- CreateIndex
CREATE INDEX "QuizQuestion_wordBaseId_idx" ON "QuizQuestion"("wordBaseId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestion_quizId_position_key" ON "QuizQuestion"("quizId", "position");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_wordBaseId_fkey" FOREIGN KEY ("wordBaseId") REFERENCES "WordBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

