"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2, XCircle, ArrowRight, RotateCcw, Home, BookOpen, Trophy,
  Eye
} from "lucide-react";
import Navbar from "@/components/ui/navbar";
import {
  swissGermanWords, getRandomWords, getWrongOptions, type Word
} from "@/lib/words";

type Props = {
  dict: any;
  lang: string;
  userId: string;
};

type QuizQuestion = {
  word: Word;
  options: Word[];
};

type Result = {
  wordId: string;
  correct: boolean;
};

function buildQuestions(words: Word[]): QuizQuestion[] {
  return words.map((word) => {
    const wrong = getWrongOptions(word, swissGermanWords, 3);
    const options = [...wrong, word].sort(() => Math.random() - 0.5);
    return { word, options };
  });
}

type QuizState = "playing" | "answered" | "finished";

const TOTAL_QUESTIONS = 10;

export default function QuestionsClient({ dict, lang, userId }: Props) {
  const d = dict.questions;
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [quizState, setQuizState] = useState<QuizState>("playing");
  const [saving, setSaving] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    const words = getRandomWords(TOTAL_QUESTIONS);
    setQuestions(buildQuestions(words));
  }, []);

  const question = questions[current];
  const [showCategory, setShowCategory] = useState(false)
  const isAnswered = quizState === "answered";
  const progress = questions.length > 0 ? ((current) / questions.length) * 100 : 0;
  const score = results.filter((r) => r.correct).length;

  function handleSelect(optionId: string) {
    if (isAnswered) return;
    const correct = optionId === question.word.id;
    setSelected(optionId);
    setResults((prev) => [...prev, { wordId: question.word.id, correct }]);
    setQuizState("answered");
  }

  async function handleNext() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setQuizState("playing");
    } else {
      // Finished
      setQuizState("finished");
      setSaving(true);
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: "gsw",
            results: [...results, { wordId: question.word.id, correct: selected === question.word.id }],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setXpGained(data.xpGained ?? 0);
        }
      } finally {
        setSaving(false);
      }
    }
  }

  function restart() {
    const words = getRandomWords(TOTAL_QUESTIONS);
    setQuestions(buildQuestions(words));
    setCurrent(0);
    setSelected(null);
    setResults([]);
    setQuizState("playing");
    setXpGained(0);
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar lang={lang} nav={dict.nav} langDict={dict.lang} />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 text-[var(--fg-muted)]">
            <BookOpen size={20} className="animate-pulse" />
            <span>{d.loading}</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Results screen ───
  if (quizState === "finished") {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)]">
        <Navbar lang={lang} nav={dict.nav} langDict={dict.lang} />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-2xl">
              {/* Trophy */}
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
                {d.score}: <strong className="text-[var(--fg)]">{score}</strong> {d.of}{" "}
                <strong className="text-[var(--fg)]">{questions.length}</strong>
              </p>

              {/* Percentage ring */}
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
                      animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - percentage / 100) }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <span className="text-xl font-extrabold text-[var(--fg)]">{percentage}%</span>
                </div>
              </div>

              {/* XP gained */}
              {xpGained > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-muted)] p-3 text-sm font-semibold text-[var(--accent)]"
                >
                  <Trophy size={16} />
                  +{xpGained} XP {d.score === "Score" ? "earned" : "ganho"}!
                </motion.div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={restart}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--accent-hover)] transition-all"
                >
                  <RotateCcw size={16} />
                  {d.playAgain}
                </button>
                <Link
                  href={`/${lang}/dashboard`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-5 py-3 text-sm font-semibold text-[var(--fg-muted)] hover:bg-[var(--bg-secondary)] transition-all"
                >
                  <Home size={16} />
                  {d.backToDashboard}
                </Link>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ─── Playing screen ───
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar lang={lang} nav={dict.nav} langDict={dict.lang} />

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm text-[var(--fg-muted)]">
              <span>{d.title}</span>
              <span>{current + 1} / {questions.length}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--accent), var(--swiss-red))" }}
                animate={{ width: `${progress + (1 / questions.length) * 100}%` }}
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
              {/* Question card */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                  Swiss German
                </p>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <motion.p
                    key={question?.word.swiss}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-extrabold text-[var(--fg)] mb-2"
                  >
                    {question?.word.swiss}
                  </motion.p>
                  <div className="flex flex-col gap-2 items-center">
                    <button
                      onClick={() => setShowCategory(!showCategory)}
                      className="flex items-center gap-1 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--accent-hover)] transition-all"
                    >
                      <Eye size={16} />
                      {showCategory ? d.hideCategory : d.showCategory}
                    </button>
                    <p className={`text-sm text-[var(--fg-muted)] ${showCategory ? "visible" : "invisible"}`}                    >
                      [{question?.word.category}]
                    </p>
                  </div>
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                  {d.choose}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {question?.options.map((opt) => {
                  const isSelected = selected === opt.id;
                  const isCorrect = opt.id === question.word.id;
                  let style = "border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]";
                  if (isAnswered) {
                    if (isCorrect) {
                      style = "border-[var(--success)] bg-[var(--success-muted)] text-[var(--success)]";
                    } else if (isSelected && !isCorrect) {
                      style = "border-[var(--error)] bg-[var(--error-muted)] text-[var(--error)]";
                    } else {
                      style = "border-[var(--border)] bg-[var(--surface)] text-[var(--fg-subtle)] opacity-60";
                    }
                  }

                  return (
                    <motion.button
                      key={opt.id}
                      whileHover={!isAnswered ? { scale: 1.02 } : {}}
                      whileTap={!isAnswered ? { scale: 0.97 } : {}}
                      onClick={() => handleSelect(opt.id)}
                      disabled={isAnswered}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed ${style}`}
                    >
                      <span>{lang === "pt" ? opt.portuguese : opt.english}</span>
                      {isAnswered && isCorrect && <CheckCircle2 size={18} className="shrink-0" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle size={18} className="shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback + Next */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-between gap-3"
                  >
                    <div className={`flex items-center gap-2 text-sm font-semibold ${results[results.length - 1]?.correct ? "text-[var(--success)]" : "text-[var(--error)]"
                      }`}>
                      {results[results.length - 1]?.correct
                        ? <><CheckCircle2 size={16} /> {d.correct}</>
                        : <><XCircle size={16} /> {d.wrong} — {lang === "pt" ? question.word.portuguese : question.word.english}</>
                      }
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNext}
                      className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-hover)] transition-all"
                    >
                      {current < questions.length - 1 ? d.next : d.finish}
                      <ArrowRight size={16} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
