import "server-only";
import { shuffle } from "./shared";
import type { PhraseRow } from "./repositories";

export type PhraseQuestionDraft = {
  questionType: "phraseFill" | "phraseMeaning";
  phraseBaseId: string;
  prompt: string;
  correctAnswer: string;
  options: string[];
};

// "Fill the blank": hide one random word from the Swiss phrase; options are
// Swiss words — the real one plus distractors sampled from the wider word pool.
export function buildPhraseFillQuestion(
  phrase: PhraseRow,
  wordDistractorPool: string[]
): PhraseQuestionDraft | null {
  const words = phrase.sourceText.split(" ").filter(Boolean);
  if (words.length < 2) return null; // nothing to blank meaningfully

  const blankIndex = Math.floor(Math.random() * words.length);
  const answer = words[blankIndex].replace(/[.,!?;:]+$/, "");

  const distractors = shuffle(wordDistractorPool.filter((w) => w !== answer)).slice(0, 3);
  if (distractors.length < 3) return null; // pool too small, fall back to meaning question

  const promptWords = [...words];
  promptWords[blankIndex] = "____";

  return {
    questionType: "phraseFill",
    phraseBaseId: phrase.id,
    prompt: promptWords.join(" "),
    correctAnswer: answer,
    options: shuffle([answer, ...distractors]),
  };
}

// "Whole meaning": show the full Swiss phrase, options are candidate
// translations — the real one plus the distractors precomputed at seed time.
export function buildPhraseMeaningQuestion(phrase: PhraseRow): PhraseQuestionDraft {
  return {
    questionType: "phraseMeaning",
    phraseBaseId: phrase.id,
    prompt: phrase.sourceText,
    correctAnswer: phrase.targetText,
    options: shuffle([phrase.targetText, ...phrase.distractors]),
  };
}
