import "server-only";
import { shuffle } from "./shared";
import type { PhraseRow, WordTextEntry } from "./repositories";

export type PhraseQuestionDraft = {
  questionType: "phraseFill" | "phraseMeaning";
  phraseBaseId: string;
  prompt: string;
  correctAnswer: string;
  options: string[];
};

// "Fill the blank": hide one random word from the Swiss phrase; options are
// Swiss words — the real one plus distractors sampled from the wider word pool.
//
// Distractors are restricted to the same seeded `category` as the answer
// whenever the answer can be matched (case-insensitively) against a known
// word — e.g. a blanked verb only gets other verbs as wrong options, not
// random nouns from "food" or "objects". Phrases use inflected/conjugated
// forms that don't always match a WordBase entry exactly (Swiss German verbs
// conjugate heavily), so this only narrows the pool when a match is found;
// unmatched answers fall back to the full pool, same as before.
export function buildPhraseFillQuestion(
  phrase: PhraseRow,
  wordDistractorPool: WordTextEntry[]
): PhraseQuestionDraft | null {
  const words = phrase.sourceText.split(" ").filter(Boolean);
  if (words.length < 2) return null; // nothing to blank meaningfully

  const blankIndex = Math.floor(Math.random() * words.length);
  const answer = words[blankIndex].replace(/[.,!?;:]+$/, "");

  const answerLower = answer.toLowerCase();
  const matchedCategory = wordDistractorPool.find(
    (w) => w.sourceText.toLowerCase() === answerLower
  )?.category;

  const candidatePool = matchedCategory
    ? wordDistractorPool.filter((w) => w.category === matchedCategory)
    : wordDistractorPool;

  const distractorSource =
    candidatePool.length >= 4 ? candidatePool : wordDistractorPool; // not enough in-category candidates, fall back to the full pool

  const distractors = shuffle(
    distractorSource.map((w) => w.sourceText).filter((w) => w !== answer)
  ).slice(0, 3);
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
