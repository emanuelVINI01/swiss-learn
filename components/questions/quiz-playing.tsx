"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Eye } from "lucide-react";
import { playHover, playClick } from "@/lib/audio";
import type { QuizDetail } from "./types";

type Props = {
  dict: any;
  quiz: QuizDetail;
  current: number;
  answering: boolean;
  finishing: boolean;
  showCategory: boolean;
  onBack: () => void;
  onToggleCategory: () => void;
  onSelect: (option: string) => void;
  onNext: () => void;
};

export default function QuizPlaying({
  dict,
  quiz,
  current,
  answering,
  finishing,
  showCategory,
  onBack,
  onToggleCategory,
  onSelect,
  onNext,
}: Props) {
  const d = dict.questions;
  const question = quiz.questions[current];
  const isAnswered = question.selected !== null;
  const progress = quiz.questions.length > 0 ? (current / quiz.questions.length) * 100 : 0;

  return (
    <main className="flex-1 px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <button
            onMouseEnter={playHover}
            onClick={onBack}
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
                    onClick={() => { onToggleCategory(); playClick(); }}
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
                    onClick={() => onSelect(opt)}
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
                    onClick={onNext}
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
  );
}
