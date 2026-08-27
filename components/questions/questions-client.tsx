"use client";

import { useState } from "react";
import AppShell from "@/components/ui/app-shell";
import { playClick, playSuccess, playError } from "@/lib/audio";
import QuizPicker from "./quiz-picker";
import QuizLoading from "./quiz-loading";
import QuizResults from "./quiz-results";
import QuizPlaying from "./quiz-playing";
import type { TargetLang, QuizSummary, QuizDetail, QuizResult } from "./types";

type Props = {
  dict: any;
  lang: string;
  targetLang: TargetLang;
  initialQuizzes: QuizSummary[];
};

type View = "picker" | "loading" | "playing" | "finished";

export default function QuestionsClient({ dict, lang, targetLang, initialQuizzes }: Props) {
  const [view, setView] = useState<View>("picker");
  const [quizzes, setQuizzes] = useState<QuizSummary[]>(initialQuizzes);
  const [shufflingId, setShufflingId] = useState<string | null>(null);

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [current, setCurrent] = useState(0);
  const [answering, setAnswering] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  async function refreshQuizzes() {
    const res = await fetch(`/api/quiz?lang=${targetLang}`);
    if (res.ok) {
      const data = await res.json();
      setQuizzes(data.quizzes ?? []);
    }
  }

  async function openQuiz(id: string) {
    setView("loading");
    const res = await fetch(`/api/quiz/${id}`);
    if (!res.ok) {
      setView("picker");
      return;
    }
    const data = await res.json();
    const detail: QuizDetail = data.quiz;
    const firstUnanswered = detail.questions.findIndex((q) => q.selected === null);
    setQuiz(detail);
    setCurrent(firstUnanswered === -1 ? 0 : firstUnanswered);
    setShowCategory(false);
    setView("playing");
  }

  async function handleShuffle(id: string) {
    setShufflingId(id);
    playClick();
    const res = await fetch(`/api/quiz/${id}/shuffle`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setQuizzes(data.quizzes ?? []);
    }
    setShufflingId(null);
  }

  async function handleSelect(option: string) {
    if (!quiz) return;
    const question = quiz.questions[current];
    if (question.selected !== null || answering) return;

    setAnswering(true);
    const res = await fetch(`/api/quiz/${quiz.id}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, selected: option }),
    });
    setAnswering(false);
    if (!res.ok) return;

    const { correct, correctAnswer } = await res.json();
    if (correct) playSuccess(); else playError();
    setShowCategory(false);

    setQuiz((prev) => {
      if (!prev) return prev;
      const nextQuestions = [...prev.questions];
      nextQuestions[current] = { ...question, selected: option, correct, correctAnswer };
      return { ...prev, questions: nextQuestions };
    });
  }

  async function handleNext() {
    if (!quiz) return;
    playClick();
    if (current < quiz.questions.length - 1) {
      setCurrent((c) => c + 1);
      return;
    }

    setFinishing(true);
    const res = await fetch(`/api/quiz/${quiz.id}/finish`, { method: "POST" });
    setFinishing(false);
    if (res.ok) {
      const data = await res.json();
      setResult(data);
    } else {
      setResult({ score: quiz.questions.filter((q) => q.correct).length, total: quiz.total, xpGained: 0 });
    }
    setView("finished");
  }

  async function backToQuizzes() {
    playClick();
    setQuiz(null);
    setResult(null);
    setView("picker");
    await refreshQuizzes();
  }

  return (
    <AppShell lang={lang} dict={dict}>
      {view === "picker" && (
        <QuizPicker
          dict={dict}
          quizzes={quizzes}
          shufflingId={shufflingId}
          onShuffle={handleShuffle}
          onPlay={openQuiz}
        />
      )}

      {view === "loading" && <QuizLoading label={dict.questions.loading} />}

      {view === "finished" && result && (
        <QuizResults dict={dict} lang={lang} result={result} onPlayAgain={backToQuizzes} />
      )}

      {view === "playing" && quiz && quiz.questions[current] && (
        <QuizPlaying
          dict={dict}
          quiz={quiz}
          current={current}
          answering={answering}
          finishing={finishing}
          showCategory={showCategory}
          onBack={backToQuizzes}
          onToggleCategory={() => setShowCategory((s) => !s)}
          onSelect={handleSelect}
          onNext={handleNext}
        />
      )}
    </AppShell>
  );
}
