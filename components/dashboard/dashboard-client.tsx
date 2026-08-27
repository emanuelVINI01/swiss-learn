"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type User } from "next-auth";
import { BookOpen, ArrowRight, Calendar } from "lucide-react";
import AppShell from "@/components/ui/app-shell";
import { Flag } from "@/components/ui/flag";
import { EmojiIcon } from "@/components/ui/emoji-icon";
import HistorySection from "./history-section";

type HistoryEntry = {
  id: string;
  targetLang: string;
  total: number;
  score: number;
  accuracy: number;
  xpGained: number;
  endedAt: string;
};

type Props = {
  dict: any;
  lang: string;
  user: User;
  progress: {
    xp: number;
    streak: number;
    lastStudy: string | null;
  };
  stats: {
    totalQuizzes: number;
    accuracy: number;
  };
  history: HistoryEntry[];
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function DashboardClient({ dict, lang, user, progress, stats, history }: Props) {
  const d = dict.dashboard;

  const statCards = [
    {
      emoji: "⚡",
      label: dict.dashboard.xp,
      value: progress.xp,
      bg: "var(--accent-muted)",
    },
    {
      emoji: "🔥",
      label: dict.dashboard.streak,
      value: `${progress.streak}`,
      bg: "rgba(249, 115, 22, 0.12)",
    },
    {
      emoji: "🎯",
      label: dict.dashboard.accuracy,
      value: `${stats.accuracy}%`,
      bg: "var(--success-muted)",
    },
    {
      emoji: "📚",
      label: dict.dashboard.totalQuizzes,
      value: stats.totalQuizzes,
      bg: "var(--swiss-red-muted)",
    },
  ];

  return (
    <AppShell lang={lang} dict={dict}>
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {/* Welcome header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name ?? ""}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-[var(--border)]"
                />
              )}
              <div>
                <p className="text-sm text-[var(--fg-muted)]">{d.welcome},</p>
                <h1 className="text-2xl font-extrabold text-[var(--fg)]">
                  {user.name ?? user.email?.split("@")[0]}
                </h1>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={`/${lang}/questions`}
                className="group inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--accent-hover)] transition-all shadow-lg"
              >
                <BookOpen size={18} />
                {d.startPractice}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Language selector */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-6"
          >
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                {d.chooseLanguage}
              </p>
              <button className="flex items-center gap-3 rounded-xl border-2 border-[var(--accent)] bg-[var(--accent-muted)] px-4 py-3 transition-all">
                <Flag code="ch" size={28} className="flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-bold text-[var(--fg)]">{d.swissGerman}</p>
                  <p className="text-xs text-[var(--fg-muted)]">Schweizerdeutsch (gsw)</p>
                </div>
                <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Stat cards */}
          <div className="mb-8">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              {d.stats}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--accent)]"
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: card.bg }}
                  >
                    <EmojiIcon emoji={card.emoji} size={20} />
                  </div>
                  <p className="text-2xl font-extrabold text-[var(--fg)]">{card.value}</p>
                  <p className="text-xs text-[var(--fg-muted)] mt-0.5">{card.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* XP Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EmojiIcon emoji="🏆" size={18} />
                <span className="font-bold text-[var(--fg)]">Level {Math.floor(progress.xp / 100) + 1}</span>
              </div>
              <span className="text-sm text-[var(--fg-muted)]">
                {progress.xp % 100} / 100 XP
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.xp % 100}%` }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--accent), var(--swiss-red))" }}
              />
            </div>
          </motion.div>

          {/* Last study */}
          {progress.lastStudy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex items-center gap-2 text-sm text-[var(--fg-muted)]"
            >
              <Calendar size={14} />
              Last study: {new Date(progress.lastStudy).toLocaleDateString()}
            </motion.div>
          )}

          <HistorySection dict={dict} history={history} />

          {/* Start practice CTA if no quizzes yet */}
          {stats.totalQuizzes === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center"
            >
              <EmojiIcon emoji="📚" size={40} className="mx-auto mb-3" />
              <p className="mb-4 text-[var(--fg-muted)]">{d.noProgress}</p>
              <Link
                href={`/${lang}/questions`}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-hover)] transition-all"
              >
                {d.startPractice}
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
