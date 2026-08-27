"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2, XCircle, ArrowRight, RotateCcw, Home, BookOpen, Trophy,
  Eye, Shuffle, Play, ArrowLeft
} from "lucide-react";
import Navbar from "@/components/ui/navbar";
import { playHover, playClick, playSuccess, playError } from "@/lib/audio";

type TargetLang = "en" | "pt" | "de";

type QuizSummary = {
  id: string;
  total: number;
  answered: number;
  createdAt: string;
};

type QuizQuestion = {
  id: string;
  position: number;
  prompt: string;
  category: string;
  options: string[];
  selected: string | null;
  correct: boolean | null;
  correctAnswer: string | null;
};

type QuizDetail = {
  id: string;
  status: string;
  total: number;
  score: number | null;
  questions: QuizQuestion[];
};

type Props = {
  dict: any;
  lang: string;
  targetLang: TargetLang;
  initialQuizzes: QuizSummary[];
};

type View = "picker" | "loading" | "playing" | "finished";

export default function QuestionsClient({ dict, lang, targetLang, initialQuizzes }: Props) {
  const d = dict.questions;
  const [view, setView] = useState<View>("picker");
  const [quizzes, setQuizzes] = useState<QuizSummary[]>(initialQuizzes);
  const [shufflingId, setShufflingId] = useState<string | null>(null);

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [current, setCurrent] = useState(0);
  const [answering, setAnswering] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; xpGained: number } | null>(null);

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

  const question = quiz?.questions[current];
  const isAnswered = question ? question.selected !== null : false;
  const progress = quiz && quiz.questions.length > 0 ? (current / quiz.questions.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar lang={lang} nav={dict.nav} langDict={dict.lang} />

      {/* ─── Picker screen ─── */}
      {view === "picker" && (
        <main className="flex-1 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 text-center"
            >
              <h1 className="mb-2 text-2xl font-extrabold text-[var(--fg)] sm:text-3xl">{d.pickQuiz}</h1>
              <p className="mx-auto max-w-lg text-sm text-[var(--fg-muted)]">{d.pickQuizSubtitle}</p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {quizzes.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileHover={{ y: -3 }}
                  className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
                      <BookOpen size={20} />
                    </div>
                    <button
                      onMouseEnter={playHover}
                      onClick={() => handleShuffle(q.id)}
                      disabled={shufflingId === q.id}
                      title={d.newWords}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--fg-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
                    >
                      <Shuffle size={16} className={shufflingId === q.id ? "animate-spin" : ""} />
                    </button>
                  </div>

                  <h3 className="mb-1 font-bold text-[var(--fg)]">
                    {d.wordQuiz} {i + 1}
                  </h3>
                  <p className="mb-4 text-xs text-[var(--fg-muted)]">
                    {q.answered > 0 ? `${q.answered}/${q.total} ${d.inProgress}` : d.readyToPlay}
                  </p>

                  <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(q.answered / q.total) * 100}%`,
                        background: "linear-gradient(90deg, var(--accent), var(--secondary))",
                      }}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onMouseEnter={playHover}
                    onClick={() => { openQuiz(q.id); playClick(); }}
                    className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-hover)] transition-all"
                  >
                    <Play size={16} />
                    {d.play}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ─── Loading ─── */}
      {view === "loading" && (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 text-[var(--fg-muted)]">
            <BookOpen size={20} className="animate-pulse" />
            <span>{d.loading}</span>
          </div>
        </div>
      )}

      {/* ─── Results screen ─── */}
      {view === "finished" && result && (
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-2xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mb-6 flex justify-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
                  <Trophy size={40} className="text-[var(--accent)]" />
                </div>
              </motion.div>

              <h2 className="mb-1 text-2xl font-extrabold text-[var(--fg)]">{d.results}</h2>
              <p className="mb-6 text-[var(--fg-muted)]">
                {d.score}: <strong className="text-[var(--fg)]">{result.score}</strong> {d.of}{" "}
                <strong className="text-[var(--fg)]">{result.total}</strong>
              </p>

              <div className="mb-6 flex justify-center">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="absolute" viewBox="0 0 100 100" width="96" height="96">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{
                        strokeDashoffset:
                          2 * Math.PI * 40 * (1 - Math.round((result.score / result.total) * 100) / 100),
                      }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <span className="text-xl font-extrabold text-[var(--fg)]">
                    {Math.round((result.score / result.total) * 100)}%
                  </span>
                </div>
              </div>

              {result.xpGained > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-muted)] p-3 text-sm font-semibold text-[var(--accent)]"
                >
                  <Trophy size={16} />
                  +{result.xpGained} XP
                </motion.div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onMouseEnter={playHover}
                  onClick={backToQuizzes}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--accent-hover)] transition-all"
                >
                  <RotateCcw size={16} />
                  {d.playAgain}
                </button>
                <Link
                  href={`/${lang}/dashboard`}
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-5 py-3 text-sm font-semibold text-[var(--fg-muted)] hover:bg-[var(--bg-secondary)] transition-all"
                >
                  <Home size={16} />
                  {d.backToDashboard}
                </Link>
              </div>
            </div>
          </motion.div>
        </main>
      )}

      {/* ─── Playing screen ─── */}
      {view === "playing" && quiz && question && (
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg">
            <div className="mb-4 flex items-center justify-between">
              <button
                onMouseEnter={playHover}
                onClick={backToQuizzes}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors"
              >
                <ArrowLeft size={15} />
                {d.backToQuizzes}
              </button>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm text-[var(--fg-muted)]">
                <span>{d.title}</span>
                <span>{current + 1} / {quiz.questions.length}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--accent), var(--swiss-red))" }}
                  animate={{ width: `${progress + (1 / quiz.questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    {dict.dashboard.swissGerman}
                  </p>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <motion.p
                      key={question.prompt}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl font-extrabold text-[var(--fg)] mb-2"
                    >
                      {question.prompt}
                    </motion.p>
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onMouseEnter={playHover}
                        onClick={() => { setShowCategory(!showCategory); playClick(); }}
                        className="flex items-center gap-1 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--accent-hover)] transition-all"
                      >
                        <Eye size={16} />
                        {showCategory ? d.hideCategory : d.showCategory}
                      </button>
                      <p className={`text-sm text-[var(--fg-muted)] ${showCategory ? "visible" : "invisible"}`}>
                        [{question.category}]
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    {d.choose}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {question.options.map((opt, i) => {
                    const isSelected = question.selected === opt;
                    const isCorrectOption = isAnswered && question.correctAnswer === opt;
                    let style = "border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]";
                    if (isAnswered) {
                      if (isCorrectOption) {
                        style = "border-[var(--success)] bg-[var(--success-muted)] text-[var(--success)]";
                      } else if (isSelected) {
                        style = "border-[var(--error)] bg-[var(--error-muted)] text-[var(--error)]";
                      } else {
                        style = "border-[var(--border)] bg-[var(--surface)] text-[var(--fg-subtle)] opacity-60";
                      }
                    }

                    return (
                      <motion.button
                        key={`${opt}-${i}`}
                        whileHover={!isAnswered ? { scale: 1.02 } : {}}
                        whileTap={!isAnswered ? { scale: 0.97 } : {}}
                        onMouseEnter={() => !isAnswered && playHover()}
                        onClick={() => handleSelect(opt)}
                        disabled={isAnswered || answering}
                        className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed ${style}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrectOption && <CheckCircle2 size={18} className="shrink-0" />}
                        {isAnswered && isSelected && !isCorrectOption && <XCircle size={18} className="shrink-0" />}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center justify-between gap-3"
                    >
                      <div className={`flex items-center gap-2 text-sm font-semibold ${question.correct ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                        {question.correct
                          ? <><CheckCircle2 size={16} /> {d.correct}</>
                          : <><XCircle size={16} /> {d.wrong} — {question.correctAnswer}</>
                        }
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onMouseEnter={playHover}
                        onClick={handleNext}
                        disabled={finishing}
                        className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-hover)] transition-all disabled:opacity-60"
                      >
                        {current < quiz.questions.length - 1 ? d.next : d.finish}
                        <ArrowRight size={16} />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      )}
    </div>
  );
}
