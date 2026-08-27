export type TargetLang = "en" | "pt" | "de";

export type QuizSummary = {
  id: string;
  total: number;
  answered: number;
  createdAt: string;
};

export type QuizQuestion = {
  id: string;
  position: number;
  prompt: string;
  category: string;
  audioUrl: string | null;
  options: string[];
  selected: string | null;
  correct: boolean | null;
  correctAnswer: string | null;
};

// Whether a question is presented as text-to-read or audio-to-listen-to.
export type PromptMode = "text" | "audio";

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
