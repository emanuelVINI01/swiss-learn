import "server-only";
import { prisma } from "@/lib/prisma";

export const SOURCE_LANG = "gsw";
export const TARGET_LANGS = ["en", "pt", "de"] as const;
export type TargetLang = (typeof TARGET_LANGS)[number];

const ACTIVE_POOL_SIZE = 3;
const QUESTIONS_PER_QUIZ = 10;
const POOL_CACHE_TTL_MS = 60_000;

export function isTargetLang(value: string): value is TargetLang {
  return (TARGET_LANGS as readonly string[]).includes(value);
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sampleIds(pool: string[], count: number): string[] {
  return shuffle(pool).slice(0, count);
}

// Word ids are cheap to list and expensive to `ORDER BY random()` at scale, so
// we keep a short-lived in-memory pool of ids per target language and do the
// actual random sampling in application code, then fetch only the sampled
// rows by primary key.
const poolCache = new Map<string, { ids: string[]; expiresAt: number }>();

async function getPoolIds(targetLang: TargetLang): Promise<string[]> {
  const cached = poolCache.get(targetLang);
  if (cached && cached.expiresAt > Date.now()) return cached.ids;

  const rows = await prisma.wordBase.findMany({
    where: { sourceLang: SOURCE_LANG, targetLang },
    select: { id: true },
  });
  const ids = rows.map((r) => r.id);
  poolCache.set(targetLang, { ids, expiresAt: Date.now() + POOL_CACHE_TTL_MS });
  return ids;
}

async function createQuiz(ownerId: string, targetLang: TargetLang) {
  const poolIds = await getPoolIds(targetLang);
  const total = Math.min(QUESTIONS_PER_QUIZ, poolIds.length);
  const sampledIds = sampleIds(poolIds, total);

  const words = await prisma.wordBase.findMany({ where: { id: { in: sampledIds } } });
  const wordsById = new Map(words.map((w) => [w.id, w]));

  const questions = sampledIds.map((id, position) => {
    const word = wordsById.get(id)!;
    return {
      position,
      wordBaseId: word.id,
      prompt: word.sourceText,
      correctAnswer: word.targetText,
      options: shuffle([word.targetText, ...word.distractors]),
    };
  });

  return prisma.quiz.create({
    data: {
      ownerId,
      targetLang,
      sourceLang: SOURCE_LANG,
      total,
      status: "active",
      questions: { create: questions },
    },
  });
}

export async function ensureActiveQuizzes(ownerId: string, targetLang: TargetLang) {
  const activeCount = await prisma.quiz.count({
    where: { ownerId, targetLang, status: "active" },
  });
  const missing = ACTIVE_POOL_SIZE - activeCount;
  for (let i = 0; i < missing; i++) {
    await createQuiz(ownerId, targetLang);
  }
}

export type QuizSummary = {
  id: string;
  total: number;
  answered: number;
  createdAt: string;
};

export async function listActiveQuizzes(ownerId: string, targetLang: TargetLang): Promise<QuizSummary[]> {
  await ensureActiveQuizzes(ownerId, targetLang);

  const quizzes = await prisma.quiz.findMany({
    where: { ownerId, targetLang, status: "active" },
    orderBy: { createdAt: "asc" },
    include: { questions: { select: { selected: true } } },
  });

  return quizzes.map((q) => ({
    id: q.id,
    total: q.total,
    answered: q.questions.filter((qq) => qq.selected !== null).length,
    createdAt: q.createdAt.toISOString(),
  }));
}

export type QuizForPlay = {
  id: string;
  status: string;
  total: number;
  score: number | null;
  questions: {
    id: string;
    position: number;
    prompt: string;
    category: string;
    options: string[];
    selected: string | null;
    correct: boolean | null;
    correctAnswer: string | null;
  }[];
};

export async function getQuizForPlay(ownerId: string, quizId: string): Promise<QuizForPlay | null> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { position: "asc" },
        include: { wordBase: { select: { category: true } } },
      },
    },
  });
  if (!quiz || quiz.ownerId !== ownerId) return null;

  return {
    id: quiz.id,
    status: quiz.status,
    total: quiz.total,
    score: quiz.score,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      position: q.position,
      prompt: q.prompt,
      category: q.wordBase.category,
      options: q.options,
      selected: q.selected,
      correct: q.correct,
      // Only reveal the correct answer once the question has been answered.
      correctAnswer: q.selected !== null ? q.correctAnswer : null,
    })),
  };
}

export async function answerQuestion(
  ownerId: string,
  quizId: string,
  questionId: string,
  selected: string
) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz || quiz.ownerId !== ownerId) throw new Error("Quiz not found");
  if (quiz.status !== "active") throw new Error("Quiz is not active");

  const question = quiz.questions.find((q) => q.id === questionId);
  if (!question) throw new Error("Question not found");
  if (question.selected !== null) throw new Error("Question already answered");
  if (!question.options.includes(selected)) throw new Error("Invalid option");

  const correct = selected === question.correctAnswer;
  await prisma.quizQuestion.update({
    where: { id: questionId },
    data: { selected, correct, answeredAt: new Date() },
  });

  return { correct, correctAnswer: question.correctAnswer };
}

export async function finishQuiz(ownerId: string, quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz || quiz.ownerId !== ownerId) throw new Error("Quiz not found");
  if (quiz.status !== "active") throw new Error("Quiz is not active");

  const answeredCount = quiz.questions.filter((q) => q.selected !== null).length;
  if (answeredCount < quiz.total) throw new Error("Quiz is not fully answered yet");

  const score = quiz.questions.filter((q) => q.correct).length;
  const xpGained = score * 10;

  await prisma.$transaction([
    prisma.quiz.update({
      where: { id: quizId },
      data: { status: "completed", score, endedAt: new Date() },
    }),
    prisma.userProgress.upsert({
      where: { userId_language: { userId: ownerId, language: SOURCE_LANG } },
      update: { xp: { increment: xpGained }, lastStudy: new Date() },
      create: { userId: ownerId, language: SOURCE_LANG, xp: xpGained, streak: 1, lastStudy: new Date() },
    }),
  ]);

  await ensureActiveQuizzes(ownerId, quiz.targetLang as TargetLang);

  return { score, total: quiz.total, xpGained };
}

export async function shuffleQuiz(ownerId: string, quizId: string): Promise<QuizSummary[]> {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz || quiz.ownerId !== ownerId) throw new Error("Quiz not found");
  if (quiz.status !== "active") throw new Error("Quiz is not active");

  await prisma.quiz.update({
    where: { id: quizId },
    data: { status: "skipped", endedAt: new Date() },
  });

  return listActiveQuizzes(ownerId, quiz.targetLang as TargetLang);
}

export async function getQuizStats(ownerId: string) {
  const [totalQuizzes, answeredQuestions] = await Promise.all([
    prisma.quiz.count({ where: { ownerId, status: "completed" } }),
    prisma.quizQuestion.findMany({
      where: { quiz: { ownerId }, selected: { not: null } },
      select: { correct: true },
    }),
  ]);

  const answered = answeredQuestions.length;
  const correct = answeredQuestions.filter((q) => q.correct).length;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return { totalQuizzes, accuracy };
}
