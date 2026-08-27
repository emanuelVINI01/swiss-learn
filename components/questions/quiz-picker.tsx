"use client";

import { motion } from "framer-motion";
import { BookOpen, Shuffle, Play } from "lucide-react";
import { playHover, playClick } from "@/lib/audio";
import type { QuizSummary } from "./types";

type Props = {
  dict: any;
  quizzes: QuizSummary[];
  shufflingId: string | null;
  onShuffle: (id: string) => void;
  onPlay: (id: string) => void;
};

export default function QuizPicker({ dict, quizzes, shufflingId, onShuffle, onPlay }: Props) {
  const d = dict.questions;

  return (
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
                  onClick={() => onShuffle(q.id)}
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
                onClick={() => { onPlay(q.id); playClick(); }}
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
  );
}
