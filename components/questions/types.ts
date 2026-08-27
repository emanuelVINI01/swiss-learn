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
  options: string[];
  selected: string | null;
  correct: boolean | null;
  correctAnswer: string | null;
};

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
