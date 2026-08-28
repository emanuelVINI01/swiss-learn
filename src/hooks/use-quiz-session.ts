"use client";

import { useEffect, useRef, useState } from "react";
import { playClick, playSuccess, playError } from "@/lib/audio";
import type {
  TargetLang,
  QuizDetail,
  QuizResult,
  PromptMode,
  QuizMode,
  QuestionType,
} from "@/components/questions/types";

export type QuizView = "menu" | "loading" | "playing" | "finished";

// Every question type (word, phraseFill, phraseMeaning) that has a generated
// clip gets the same three-way roll: read only, listen only, or both at once.
const PROMPT_MODES: ("text" | "audio" | "both")[] = ["text", "audio", "both"];

function pickPromptMode(hasAudio: boolean): "text" | "audio" | "both" {
  if (!hasAudio) return "text";
  return PROMPT_MODES[Math.floor(Math.random() * PROMPT_MODES.length)];
}

// Owns the whole quiz lifecycle: resuming an in-progress quiz on mount,
// starting/shuffling new ones, answering questions, and finishing up.
export function useQuizSession(targetLang: TargetLang) {
  // Landing on /questions jumps straight into a "by level" quiz — see
  // startStudy(). The StudyMenu (other modes/types) stays one click away
  // via the "other options" link shown while that first quiz loads.
  const [view, setView] = useState<QuizView>("loading");
  const autoStarted = useRef(false);

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [promptModes, setPromptModes] = useState<PromptMode[]>([]);
  const [current, setCurrent] = useState(0);
  const [answering, setAnswering] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [shuffling, setShuffling] = useState(false);

  useEffect(() => {
    if (autoStarted.current) return;
    autoStarted.current = true;
    resumeOrStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reloading the page must resume whatever quiz is already in progress —
  // every answer is saved the moment it's picked (see handleSelect), so the
  // only thing that was ever missing was finding that quiz again. Only when
  // there's nothing to resume do we start a fresh "by level" quiz.
  async function resumeOrStart() {
    setView("loading");
    const res = await fetch(`/api/quiz/active?lang=${targetLang}`);
    if (res.ok) {
      const { quiz: active } = await res.json();
      if (active) {
        await openQuiz(active.id);
        return;
      }
    }
    await startStudy("level", undefined, true);
  }

  function showOtherOptions() {
    playClick();
    setView("menu");
  }

  async function openQuiz(id: string) {
    const res = await fetch(`/api/quiz/${id}`);
    if (!res.ok) {
      setView("menu");
      return;
    }
    const data = await res.json();
    const detail: QuizDetail = data.quiz;
    setQuiz(detail);
    // Each question's presentation is rolled once per quiz load — only
    // questions with a generated clip can go audio/both.
    setPromptModes(detail.questions.map((q) => pickPromptMode(!!q.audioUrl)));
    // Resume at the first unanswered question instead of always index 0 —
    // this is what makes reopening an in-progress quiz pick up where it left off.
    const firstUnanswered = detail.questions.findIndex((q) => q.selected === null);
    setCurrent(firstUnanswered === -1 ? Math.max(detail.questions.length - 1, 0) : firstUnanswered);
    setShowCategory(false);
    setView("playing");
  }

  // Deliberately discards the in-progress quiz for a fresh set of words —
  // unlike a plain page reload (which resumes via resumeOrStart), this only
  // ever happens when the player clicks the shuffle button.
  async function handleShuffle() {
    if (!quiz || shuffling || finishing) return;
    setShuffling(true);
    playClick();
    const res = await fetch(`/api/quiz/${quiz.id}/shuffle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: targetLang }),
    });
    if (res.ok) {
      const { quiz: created } = await res.json();
      await openQuiz(created.id);
    }
    setShuffling(false);
  }

  async function startStudy(mode: QuizMode, type?: QuestionType, silent = false) {
    setView("loading");
    if (!silent) playClick();
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: targetLang, mode, type }),
    });
    if (!res.ok) {
      setView("menu");
      return;
    }
    const { quiz: created } = await res.json();
    await openQuiz(created.id);
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

  function toggleCategory() {
    setShowCategory((s) => !s);
  }

  function backToMenu() {
    playClick();
    setQuiz(null);
    setResult(null);
    setView("menu");
  }

  return {
    view,
    quiz,
    promptModes,
    current,
    answering,
    finishing,
    showCategory,
    result,
    shuffling,
    showOtherOptions,
    startStudy,
    handleShuffle,
    handleSelect,
    handleNext,
    toggleCategory,
    backToMenu,
  };
}
