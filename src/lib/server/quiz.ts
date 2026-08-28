import "server-only";
import { SOURCE_LANG, TARGET_LANGS, isTargetLang, shuffle, type TargetLang } from "./shared";
import { buildPhraseFillQuestion, buildPhraseMeaningQuestion } from "./phrases";
import {
  QUESTIONS_PER_QUIZ,
  pickQuestionType,
  pickRandomQuestionType,
  calculateXp,
  filterByDifficultyCeiling,
  calculateSkillLevel,
  type QuestionType,
  type QuizMode,
  type SkillId,
} from "./quiz-rules";
import {
  wordRepository,
  phraseRepository,
  quizRepository,
  userProgressRepository,
  userRepository,
} from "./repositories";
import type { NewQuestionInput, AnsweredQuestionRow, UserSummary } from "./repositories";

export {
  SOURCE_LANG,
  TARGET_LANGS,
  isTargetLang,
  type TargetLang,
  type QuestionType,
  type QuizMode,
  type SkillId,
};

const HISTORY_PAGE_SIZE = 20;

function sampleIds<T extends { id: string }>(pool: T[], count: number): string[] {
  return shuffle(pool)
    .slice(0, count)
    .map((entry) => entry.id);
}

// One question's type, per the player's chosen study mode:
// - a forced type ("choose the type") always wins
// - "random" ignores XP and picks uniformly
// - "level" weights by XP (see quiz-rules.ts)
// - no phrases seeded yet always falls back to "word"
function resolveSlotType(
  mode: QuizMode,
  forcedType: QuestionType | undefined,
  xp: number,
  phrasePoolAvailable: boolean
): QuestionType {
  if (forcedType) return forcedType;
  if (!phrasePoolAvailable) return "word";
  return mode === "random" ? pickRandomQuestionType() : pickQuestionType(xp);
}

async function createQuiz(
  ownerId: string,
  targetLang: TargetLang,
  mode: QuizMode,
  forcedType?: QuestionType
) {
  const [wordPool, phrasePool, xp] = await Promise.all([
    wordRepository.findPool(SOURCE_LANG, targetLang),
    phraseRepository.findPool(SOURCE_LANG, targetLang),
    mode === "level" ? userProgressRepository.findXp(ownerId, SOURCE_LANG) : Promise.resolve(0),
  ]);

  // "random" mode ignores XP entirely (see quiz-rules.ts); "level" mode
  // narrows both pools to the difficulty the player's XP has unlocked so far.
  const eligibleWordPool = mode === "level" ? filterByDifficultyCeiling(wordPool, xp) : wordPool;
  const eligiblePhrasePool = mode === "level" ? filterByDifficultyCeiling(phrasePool, xp) : phrasePool;

  const total = Math.min(QUESTIONS_PER_QUIZ, eligibleWordPool.length);
  const slotTypes: QuestionType[] = Array.from({ length: total }, () =>
    resolveSlotType(mode, forcedType, xp, eligiblePhrasePool.length > 0)
  );

  const sampledWordIds = sampleIds(eligibleWordPool, slotTypes.filter((t) => t === "word").length);
  const sampledPhraseIds = sampleIds(
    eligiblePhrasePool,
    Math.min(slotTypes.filter((t) => t !== "word").length, eligiblePhrasePool.length)
  );

  const [words, phrases, wordTextPool] = await Promise.all([
    wordRepository.findByIds(sampledWordIds),
    phraseRepository.findByIds(sampledPhraseIds),
    wordRepository.findSourceTextPool(SOURCE_LANG, targetLang),
  ]);
  const wordsById = new Map(words.map((w) => [w.id, w]));
  const phrasesById = new Map(phrases.map((p) => [p.id, p]));

  let wordCursor = 0;
  let phraseCursor = 0;
  const questions: NewQuestionInput[] = slotTypes.map((type, position) => {
    const phraseAvailable = type !== "word" && phraseCursor < sampledPhraseIds.length;

    if (!phraseAvailable) {
      const word = wordsById.get(sampledWordIds[wordCursor++])!;
      return {
        position,
        questionType: "word",
        wordBaseId: word.id,
        prompt: word.sourceText,
        correctAnswer: word.targetText,
        difficulty: word.difficulty,
        options: shuffle([word.targetText, ...word.distractors]),
      };
    }

    const phrase = phrasesById.get(sampledPhraseIds[phraseCursor++])!;
    const draft =
      (type === "phraseFill" ? buildPhraseFillQuestion(phrase, wordTextPool) : null) ??
      buildPhraseMeaningQuestion(phrase);

    return {
      position,
      questionType: draft.questionType,
      phraseBaseId: draft.phraseBaseId,
      prompt: draft.prompt,
      correctAnswer: draft.correctAnswer,
      difficulty: phrase.difficulty,
      options: draft.options,
    };
  });

  return quizRepository.create({
    ownerId,
    sourceLang: SOURCE_LANG,
    targetLang,
    total,
    questions,
  });
}

// Creates one quiz on demand for the study menu's chosen mode/type and
// returns just enough to hand off to getQuizForPlay.
export async function startQuiz(
  ownerId: string,
  targetLang: TargetLang,
  mode: QuizMode,
  forcedType?: QuestionType
): Promise<{ id: string }> {
  return createQuiz(ownerId, targetLang, mode, forcedType);
}

// The player's still-active (unfinished, not abandoned) quiz for this
// language, if any — lets the practice screen resume exactly where the
// player left off instead of starting a new quiz on every page load.
export async function findActiveQuiz(
  ownerId: string,
  targetLang: TargetLang
): Promise<{ id: string } | null> {
  const id = await quizRepository.findActiveId(ownerId, targetLang);
  return id ? { id } : null;
}

// Discards the current in-progress quiz (marks it "skipped", never
// resumed again) and starts a fresh "level" quiz — the deliberate "shuffle"
// action, as opposed to just reloading the page (which resumes the same
// quiz via findActiveQuiz/getQuizForPlay).
export async function shuffleQuiz(
  ownerId: string,
  quizId: string,
  targetLang: TargetLang
): Promise<{ id: string }> {
  await quizRepository.markSkipped(quizId, ownerId);
  return createQuiz(ownerId, targetLang, "level");
}

export type QuizForPlay = {
  id: string;
  status: string;
  total: number;
  score: number | null;
  questions: {
    id: string;
    position: number;
    questionType: QuestionType;
    prompt: string;
    category: string;
    audioUrl: string | null;
    options: string[];
    selected: string | null;
    correct: boolean | null;
    correctAnswer: string | null;
  }[];
};

export async function getQuizForPlay(ownerId: string, quizId: string): Promise<QuizForPlay | null> {
  const quiz = await quizRepository.findForPlay(quizId);
  if (!quiz || quiz.ownerId !== ownerId) return null;

  return {
    id: quiz.id,
    status: quiz.status,
    total: quiz.total,
    score: quiz.score,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      position: q.position,
      questionType: q.questionType as QuestionType,
      prompt: q.prompt,
      category: q.category,
      audioUrl: q.audioUrl,
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
  const quiz = await quizRepository.findActiveWithQuestions(quizId);
  if (!quiz || quiz.ownerId !== ownerId) throw new Error("Quiz not found");
  if (quiz.status !== "active") throw new Error("Quiz is not active");

  const question = quiz.questions.find((q) => q.id === questionId);
  if (!question) throw new Error("Question not found");
  if (question.selected !== null) throw new Error("Question already answered");
  if (!question.options.includes(selected)) throw new Error("Invalid option");

  const correct = selected === question.correctAnswer;
  await quizRepository.recordAnswer(questionId, selected, correct);

  return { correct, correctAnswer: question.correctAnswer };
}

export async function finishQuiz(ownerId: string, quizId: string) {
  const quiz = await quizRepository.findActiveWithQuestions(quizId);
  if (!quiz || quiz.ownerId !== ownerId) throw new Error("Quiz not found");
  if (quiz.status !== "active") throw new Error("Quiz is not active");

  const answeredCount = quiz.questions.filter((q) => q.selected !== null).length;
  if (answeredCount < quiz.total) throw new Error("Quiz is not fully answered yet");

  const correctQuestions = quiz.questions.filter((q) => q.correct);
  const score = correctQuestions.length;
  // XP scales by question type and the source word/phrase's difficulty
  // snapshot — see lib/server/quiz-rules.ts.
  const xpGained = correctQuestions.reduce(
    (sum, q) => sum + calculateXp(q.questionType as QuestionType, q.difficulty),
    0
  );

  await quizRepository.completeAndAwardXp({
    quizId,
    score,
    xpGained,
    userId: ownerId,
    language: SOURCE_LANG,
  });

  return { score, total: quiz.total, xpGained };
}

export type QuizHistoryEntry = {
  id: string;
  targetLang: string;
  total: number;
  score: number;
  accuracy: number;
  xpGained: number;
  endedAt: string;
};

export async function listQuizHistory(ownerId: string): Promise<QuizHistoryEntry[]> {
  const quizzes = await quizRepository.findHistory(ownerId, HISTORY_PAGE_SIZE);

  return quizzes.map((q) => {
    const score = q.score ?? 0;
    return {
      id: q.id,
      targetLang: q.targetLang,
      total: q.total,
      score,
      accuracy: q.total > 0 ? Math.round((score / q.total) * 100) : 0,
      // Persisted at finish time, so a later quiz-rules.ts tweak never
      // rewrites what a completed quiz actually paid out.
      xpGained: q.xpGained ?? 0,
      endedAt: (q.endedAt ?? q.createdAt).toISOString(),
    };
  });
}

export type ProgressSummary = { xp: number; lastStudy: string | null };

// Private dashboard only — ensures a UserProgress row exists so the next
// completed quiz has somewhere to write XP into. Never use for a public
// profile lookup (see getXp below), which must stay read-only.
export async function getOrCreateProgress(ownerId: string): Promise<ProgressSummary> {
  const progress = await userProgressRepository.findOrCreate(ownerId, SOURCE_LANG);
  return { xp: progress.xp, lastStudy: progress.lastStudy?.toISOString() ?? null };
}

// Public profile pages: read-only XP lookup that never creates a row for an
// anonymous visitor.
export async function getXp(userId: string): Promise<number> {
  return userProgressRepository.findXp(userId, SOURCE_LANG);
}

export async function getUserSummary(userId: string): Promise<UserSummary | null> {
  return userRepository.findSummaryById(userId);
}

export type SkillStats = {
  level: number;
  correct: number;
  answered: number;
  accuracy: number;
};

function summarizeSkill(rows: AnsweredQuestionRow[]): SkillStats {
  const answered = rows.length;
  const correct = rows.filter((r) => r.correct).length;
  return {
    level: calculateSkillLevel(correct),
    correct,
    answered,
    accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
  };
}

// Buckets a player's answer history into the three skills defined in
// quiz-rules.ts: "listening" is anything answered on content that has an
// audio clip, "vocabulary" is plain word-matching, and "reading" is phrase
// questions with no audio to lean on. A word question with audio counts
// toward both listening and vocabulary — these are overlapping skill
// measurements, not a strict partition of the history.
function summarizeSkills(rows: AnsweredQuestionRow[]): Record<SkillId, SkillStats> {
  return {
    listening: summarizeSkill(rows.filter((r) => r.hasAudio)),
    vocabulary: summarizeSkill(rows.filter((r) => r.questionType === "word")),
    reading: summarizeSkill(rows.filter((r) => r.questionType !== "word" && !r.hasAudio)),
  };
}

export async function getQuizStats(ownerId: string) {
  const [totalQuizzes, answered] = await Promise.all([
    quizRepository.countCompleted(ownerId),
    quizRepository.findAnsweredForSkills(ownerId),
  ]);

  const correct = answered.filter((r) => r.correct).length;
  const accuracy = answered.length > 0 ? Math.round((correct / answered.length) * 100) : 0;

  return { totalQuizzes, accuracy, skills: summarizeSkills(answered) };
}

export type StreakDay = { date: string; count: number };

// How many days the streak chart covers — 53 weeks, same span as GitHub's
// contribution graph.
const STREAK_WINDOW_DAYS = 371;

// One entry per day in the window (oldest first), even days with zero
// activity — the chart needs a dense grid, not just the active days.
export async function getStreakActivity(ownerId: string): Promise<StreakDay[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since = new Date(today);
  since.setDate(since.getDate() - (STREAK_WINDOW_DAYS - 1));

  const answeredDates = await quizRepository.findAnsweredDates(ownerId, since);

  const counts = new Map<string, number>();
  for (const date of answeredDates) {
    const key = date.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const days: StreakDay[] = [];
  const cursor = new Date(since);
  for (let i = 0; i < STREAK_WINDOW_DAYS; i++) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({ date: key, count: counts.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

// Consecutive active days counting back from today (the last entry in
// `days`, oldest-first). Today itself is allowed to still be empty without
// breaking the streak — the player just hasn't studied yet today.
export function getCurrentStreak(days: StreakDay[]): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      streak++;
      continue;
    }
    if (i === days.length - 1) continue;
    break;
  }
  return streak;
}
