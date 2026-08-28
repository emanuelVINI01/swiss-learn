// ─────────────────────────────────────────────────────────────────────────
// Quiz balance rules — the ONLY file you should need to touch to change how
// much XP anything is worth, how quickly harder question types show up, or
// how quickly harder words/phrases (by their `difficulty` field) unlock.
// Nothing else in the codebase should hardcode these numbers.
// ─────────────────────────────────────────────────────────────────────────

export type QuestionType = "word" | "phraseFill" | "phraseMeaning";

// How much XP one correct answer of each type is worth, before the
// difficulty scaling below. Harder question types pay out more — a single
// word match is easier than picking the right word inside a full sentence,
// which is easier than translating the whole sentence's meaning.
export const XP_RULES: Record<QuestionType, number> = {
  word: 10,
  phraseFill: 15,
  phraseMeaning: 20,
};

// Every word/phrase carries a `difficulty` from 0 (easiest) to 1000
// (hardest) — see prisma/language/swiss/{words,phrases}/types.ts. A correct
// answer's XP scales within this multiplier range: an easy word pays out
// MIN_DIFFICULTY_XP_MULTIPLIER × its base XP, the hardest pays
// MAX_DIFFICULTY_XP_MULTIPLIER × its base XP, linearly in between.
export const MIN_DIFFICULTY = 0;
export const MAX_DIFFICULTY = 1000;
export const MIN_DIFFICULTY_XP_MULTIPLIER = 0.6;
export const MAX_DIFFICULTY_XP_MULTIPLIER = 1.6;

// XP for one correct answer, given its question type and the source
// word/phrase's difficulty. This is the only place question XP is computed
// — quiz.ts just calls this per correct answer and sums the result.
export function calculateXp(type: QuestionType, difficulty: number): number {
  const clamped = Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, difficulty));
  const ratio = (clamped - MIN_DIFFICULTY) / (MAX_DIFFICULTY - MIN_DIFFICULTY);
  const multiplier =
    MIN_DIFFICULTY_XP_MULTIPLIER + ratio * (MAX_DIFFICULTY_XP_MULTIPLIER - MIN_DIFFICULTY_XP_MULTIPLIER);
  return Math.round(XP_RULES[type] * multiplier);
}

// Highest word/phrase `difficulty` a player is allowed to be quizzed on,
// based on their total XP. Ramps up as they level up, same shape as
// PHRASE_CHANCE_BY_XP below — beginners only see easy content until
// they've built a base. Add/edit steps freely; the lookup uses the highest
// step the player's XP has reached.
export const DIFFICULTY_CEILING_BY_XP: { minXp: number; maxDifficulty: number }[] = [
  { minXp: 0, maxDifficulty: 300 },
  { minXp: 100, maxDifficulty: 500 },
  { minXp: 300, maxDifficulty: 700 },
  { minXp: 600, maxDifficulty: 900 },
  { minXp: 1000, maxDifficulty: 1000 },
];

export function getDifficultyCeiling(xp: number): number {
  let ceiling = DIFFICULTY_CEILING_BY_XP[0].maxDifficulty;
  for (const step of DIFFICULTY_CEILING_BY_XP) {
    if (xp >= step.minXp) ceiling = step.maxDifficulty;
  }
  return ceiling;
}

// Narrows a difficulty-tagged pool down to what a player at `xp` is allowed
// to be quizzed on. Falls back to the full pool if that would otherwise
// filter out everything (e.g. a small seed dataset skewed toward hard
// content), so a quiz can always be built.
export function filterByDifficultyCeiling<T extends { difficulty: number }>(
  pool: T[],
  xp: number
): T[] {
  const ceiling = getDifficultyCeiling(xp);
  const eligible = pool.filter((entry) => entry.difficulty <= ceiling);
  return eligible.length > 0 ? eligible : pool;
}

// How many questions make up one quiz.
export const QUESTIONS_PER_QUIZ = 10;

// How the player asked to study: "level" weights question types by their
// current XP (see PHRASE_CHANCE_BY_XP below); "random" ignores XP entirely
// and picks uniformly from ALL_QUESTION_TYPES.
export type QuizMode = "level" | "random";

export const ALL_QUESTION_TYPES: QuestionType[] = ["word", "phraseFill", "phraseMeaning"];

export function pickRandomQuestionType(): QuestionType {
  return ALL_QUESTION_TYPES[Math.floor(Math.random() * ALL_QUESTION_TYPES.length)];
}

// Chance (0–1) that any given question is a phrase question instead of a
// plain word question, based on the player's total XP. Ramps up as they
// level up, so beginners only see single words until they've built a base.
// Add/edit steps freely — the lookup just uses the highest step the
// player's XP has reached.
export const PHRASE_CHANCE_BY_XP: { minXp: number; chance: number }[] = [
  { minXp: 0, chance: 0 },
  { minXp: 100, chance: 0.15 },
  { minXp: 300, chance: 0.3 },
  { minXp: 600, chance: 0.45 },
  { minXp: 1000, chance: 0.6 },
];

// Once a question has been decided to be a phrase question, this is the
// chance it's the harder "whole sentence meaning" type rather than the
// easier "fill in the blank word" type.
export const PHRASE_MEANING_CHANCE = 0.5;

export function getPhraseChance(xp: number): number {
  let chance = PHRASE_CHANCE_BY_XP[0].chance;
  for (const step of PHRASE_CHANCE_BY_XP) {
    if (xp >= step.minXp) chance = step.chance;
  }
  return chance;
}

// Rolls the dice once to decide one question's type for a player at `xp`.
export function pickQuestionType(xp: number): QuestionType {
  if (Math.random() >= getPhraseChance(xp)) return "word";
  return Math.random() < PHRASE_MEANING_CHANCE ? "phraseMeaning" : "phraseFill";
}

// Three skills computed from a player's answer history — see
// getQuizStats() in quiz.ts for how each is scoped:
// - "listening": answers on content that has an audio clip.
// - "vocabulary": answers on plain "word" questions.
// - "reading": answers on phrase questions that have no audio clip.
export type SkillId = "listening" | "vocabulary" | "reading";
export const ALL_SKILLS: SkillId[] = ["listening", "vocabulary", "reading"];

// How many correct answers within a skill it takes to gain one level in
// that skill. Skills level off raw correct-answer volume rather than XP,
// since the same answer can count toward more than one skill.
export const SKILL_LEVEL_STEP = 8;

export function calculateSkillLevel(correctCount: number): number {
  return Math.floor(correctCount / SKILL_LEVEL_STEP) + 1;
}
