"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { playHover, playClick } from "@/lib/audio";
import type { QuizResult } from "./types";

type Props = {
  dict: any;
  lang: string;
  result: QuizResult;
  onPlayAgain: () => void;
};

export default function QuizResults({ dict, lang, result, onPlayAgain }: Props) {
  const d = dict.questions;

  return (
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
              onClick={onPlayAgain}
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
  );
}
