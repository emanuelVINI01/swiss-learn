"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";
import { playHover, playClick } from "@/lib/audio";
import { EmojiIcon } from "@/components/ui/emoji-icon";
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
    <main className="flex flex-1 overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl m-auto"
      >
        <div
          className="flex flex-col sm:flex-row items-center justify-between border-2 border-[var(--fg)] bg-[var(--surface)] p-5 sm:p-8 gap-6 sm:gap-8"
          style={{ boxShadow: "var(--shadow-editorial)" }}
        >
          {/* ── LEFT: Trophy, Title, Score, Actions ── */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 w-full sm:w-auto flex-1">
            {/* Trophy */}
            <div className="shrink-0 border-2 border-[var(--accent)] bg-[var(--accent-muted)] h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center">
              <EmojiIcon emoji="🏆" size={32} />
            </div>

            {/* Text & Actions */}
            <div className="flex flex-col justify-center">
              <h2 className="mb-1 font-[family-name:var(--font-display)] text-2xl sm:text-4xl font-extrabold tracking-tight leading-none text-[var(--fg)]">
                {d.results}
              </h2>
              <p className="mb-4 sm:mb-5 font-[family-name:var(--font-body)] text-sm text-[var(--fg-muted)]">
                {d.score}: <strong className="text-[var(--fg)] text-base">{result.score}</strong> {d.of}{" "}
                <strong className="text-[var(--fg)] text-base">{result.total}</strong>
              </p>

              <div className="flex flex-row flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  onMouseEnter={playHover}
                  onClick={onPlayAgain}
                  className="flex items-center gap-2 border-2 border-[var(--accent)] bg-[var(--accent)] px-4 py-2 font-[family-name:var(--font-display)] text-sm font-bold text-white hover:bg-transparent hover:text-[var(--accent)] transition-colors duration-100"
                >
                  <RotateCcw size={16} />
                  {d.playAgain}
                </button>
                <Link
                  href={`/${lang}/dashboard`}
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className="flex items-center gap-2 border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-2 font-[family-name:var(--font-body)] text-sm font-medium text-[var(--fg-muted)] hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors duration-100"
                >
                  <Home size={16} />
                  {d.backToDashboard}
                </Link>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Circle & XP ── */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shrink-0 w-full sm:w-auto border-t-2 sm:border-t-0 sm:border-l-2 border-[var(--border)] pt-5 sm:pt-0 sm:pl-8">
            <div className="relative h-24 w-24 sm:h-32 sm:w-32">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="6" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="6"
                  strokeLinecap="square"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 40 * (1 - Math.round((result.score / result.total) * 100) / 100),
                  }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-[family-name:var(--font-display)]  font-extrabold tracking-tight text-[var(--fg)] whitespace-nowrap">
                  {Math.round((result.score / result.total) * 100)}%
                </span>
              </div>
            </div>

            <AnimatePresence>
              {result.xpGained > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-1.5 sm:gap-2 border-2 border-[var(--accent)] bg-[var(--accent-muted)] px-2 py-1 sm:px-3 sm:py-1.5 font-[family-name:var(--font-display)] text-xs sm:text-sm font-bold text-[var(--accent)] whitespace-nowrap"
                >
                  <EmojiIcon emoji="⚡" size={14} />
                  +{result.xpGained} XP
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
