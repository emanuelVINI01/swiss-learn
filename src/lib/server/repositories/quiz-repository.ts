import "server-only";
import { prisma } from "@/lib/prisma";

export type NewQuestionInput = {
  position: number;
  questionType: string;
  wordBaseId?: string;
  phraseBaseId?: string;
  prompt: string;
  correctAnswer: string;
  difficulty: number;
  options: string[];
};

export type QuizPlayQuestion = {
  id: string;
  position: number;
  questionType: string;
  prompt: string;
  category: string;
  audioUrl: string | null;
  options: string[];
  selected: string | null;
  correct: boolean | null;
  correctAnswer: string;
};

export type QuizPlayRow = {
  id: string;
  ownerId: string;
  status: string;
  total: number;
  score: number | null;
  questions: QuizPlayQuestion[];
};

export type QuizQuestionRow = {
  id: string;
  position: number;
  questionType: string;
  selected: string | null;
  correct: boolean | null;
  correctAnswer: string;
  difficulty: number;
  options: string[];
};

export type ActiveQuizRow = {
  id: string;
  ownerId: string;
  status: string;
  total: number;
  targetLang: string;
  questions: QuizQuestionRow[];
};

// One historical answered question, enough to bucket it into skills — see
// calculateSkillLevel() in quiz-rules.ts for how these get turned into levels.
export type AnsweredQuestionRow = {
  questionType: string;
  correct: boolean | null;
  hasAudio: boolean;
};

export type QuizHistoryRow = {
  id: string;
  targetLang: string;
  total: number;
  score: number | null;
  xpGained: number | null;
  endedAt: Date | null;
  createdAt: Date;
};

export interface QuizRepository {
  create(input: {
    ownerId: string;
    sourceLang: string;
    targetLang: string;
    total: number;
    questions: NewQuestionInput[];
  }): Promise<{ id: string }>;
  findForPlay(quizId: string): Promise<QuizPlayRow | null>;
  findActiveWithQuestions(quizId: string): Promise<ActiveQuizRow | null>;
  recordAnswer(questionId: string, selected: string, correct: boolean): Promise<void>;
  completeAndAwardXp(input: {
    quizId: string;
    score: number;
    xpGained: number;
    userId: string;
    language: string;
  }): Promise<void>;
  findHistory(ownerId: string, limit: number): Promise<QuizHistoryRow[]>;
  countCompleted(ownerId: string): Promise<number>;
  findAnsweredForSkills(ownerId: string): Promise<AnsweredQuestionRow[]>;
  findActiveId(ownerId: string, targetLang: string): Promise<string | null>;
  markSkipped(quizId: string, ownerId: string): Promise<void>;
  findAnsweredDates(ownerId: string, since: Date): Promise<Date[]>;
}

export class PrismaQuizRepository implements QuizRepository {
  async create(input: {
    ownerId: string;
    sourceLang: string;
    targetLang: string;
    total: number;
    questions: NewQuestionInput[];
  }): Promise<{ id: string }> {
    return prisma.quiz.create({
      data: {
        ownerId: input.ownerId,
        sourceLang: input.sourceLang,
        targetLang: input.targetLang,
        total: input.total,
        status: "active",
        questions: { create: input.questions },
      },
      select: { id: true },
    });
  }

  async findForPlay(quizId: string): Promise<QuizPlayRow | null> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { position: "asc" },
          include: {
            wordBase: { select: { category: true, audioUrl: true } },
            phraseBase: { select: { category: true, audioUrl: true } },
          },
        },
      },
    });
    if (!quiz) return null;

    return {
      id: quiz.id,
      ownerId: quiz.ownerId,
      status: quiz.status,
      total: quiz.total,
      score: quiz.score,
      questions: quiz.questions.map((q) => {
        const source = q.wordBase ?? q.phraseBase;
        return {
          id: q.id,
          position: q.position,
          questionType: q.questionType,
          prompt: q.prompt,
          category: source?.category ?? "general",
          audioUrl: source?.audioUrl ?? null,
          options: q.options,
          selected: q.selected,
          correct: q.correct,
          correctAnswer: q.correctAnswer,
        };
      }),
    };
  }

  async findActiveWithQuestions(quizId: string): Promise<ActiveQuizRow | null> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) return null;

    return {
      id: quiz.id,
      ownerId: quiz.ownerId,
      status: quiz.status,
      total: quiz.total,
      targetLang: quiz.targetLang,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        position: q.position,
        questionType: q.questionType,
        selected: q.selected,
        correct: q.correct,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        options: q.options,
      })),
    };
  }

  async recordAnswer(questionId: string, selected: string, correct: boolean): Promise<void> {
    await prisma.quizQuestion.update({
      where: { id: questionId },
      data: { selected, correct, answeredAt: new Date() },
    });
  }

  async completeAndAwardXp(input: {
    quizId: string;
    score: number;
    xpGained: number;
    userId: string;
    language: string;
  }): Promise<void> {
    await prisma.$transaction([
      prisma.quiz.update({
        where: { id: input.quizId },
        data: { status: "completed", score: input.score, xpGained: input.xpGained, endedAt: new Date() },
      }),
      prisma.userProgress.upsert({
        where: { userId_language: { userId: input.userId, language: input.language } },
        update: { xp: { increment: input.xpGained }, lastStudy: new Date() },
        create: {
          userId: input.userId,
          language: input.language,
          xp: input.xpGained,
          streak: 1,
          lastStudy: new Date(),
        },
      }),
    ]);
  }

  async findHistory(ownerId: string, limit: number): Promise<QuizHistoryRow[]> {
    return prisma.quiz.findMany({
      where: { ownerId, status: "completed" },
      orderBy: { endedAt: "desc" },
      take: limit,
      select: {
        id: true,
        targetLang: true,
        total: true,
        score: true,
        xpGained: true,
        endedAt: true,
        createdAt: true,
      },
    });
  }

  async countCompleted(ownerId: string): Promise<number> {
    return prisma.quiz.count({ where: { ownerId, status: "completed" } });
  }

  async findAnsweredForSkills(ownerId: string): Promise<AnsweredQuestionRow[]> {
    const rows = await prisma.quizQuestion.findMany({
      where: { quiz: { ownerId }, selected: { not: null } },
      select: {
        questionType: true,
        correct: true,
        wordBase: { select: { audioUrl: true } },
        phraseBase: { select: { audioUrl: true } },
      },
    });
    return rows.map((r) => ({
      questionType: r.questionType,
      correct: r.correct,
      hasAudio: !!(r.wordBase?.audioUrl ?? r.phraseBase?.audioUrl),
    }));
  }

  async findActiveId(ownerId: string, targetLang: string): Promise<string | null> {
    const quiz = await prisma.quiz.findFirst({
      where: { ownerId, targetLang, status: "active" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    return quiz?.id ?? null;
  }

  async markSkipped(quizId: string, ownerId: string): Promise<void> {
    await prisma.quiz.updateMany({
      where: { id: quizId, ownerId, status: "active" },
      data: { status: "skipped" },
    });
  }

  async findAnsweredDates(ownerId: string, since: Date): Promise<Date[]> {
    const rows = await prisma.quizQuestion.findMany({
      where: { quiz: { ownerId }, answeredAt: { gte: since } },
      select: { answeredAt: true },
    });
    return rows.map((r) => r.answeredAt!);
  }
}

export const quizRepository: QuizRepository = new PrismaQuizRepository();
