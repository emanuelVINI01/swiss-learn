export type TargetLang = "en" | "pt" | "de";

// "word": match one Swiss German word to its meaning.
// "phraseFill": pick the missing word inside a Swiss German sentence.
// "phraseMeaning": pick the correct translation of a whole sentence.
export type QuestionType = "word" | "phraseFill" | "phraseMeaning";

// "level": question mix weighted by the player's XP. "random": ignores XP.
export type QuizMode = "level" | "random";

export type QuizQuestion = {
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
};

// How a question's prompt is presented:
// "text": read only, no audio played automatically (a manual replay button
//   still shows if a clip exists).
// "audio": listen only — the prompt text/phrase is hidden, must answer by ear.
// "both": listen AND read at the same time (audio autoplays alongside the text).
export type PromptMode = "text" | "audio" | "both";

export type QuizDetail = {
  id: string;
  status: string;
  total: number;
  score: number | null;
  questions: QuizQuestion[];
};

export type QuizResult = {
  score: number;
  total: number;
  xpGained: number;
};
