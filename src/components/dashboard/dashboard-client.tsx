"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { type User } from "next-auth";
import { BookOpen, ArrowRight, Calendar, Share2, Check, Zap, Flame, Target } from "lucide-react";
import AppShell from "@/components/ui/app-shell";
import { Flag } from "@/components/ui/flag";
import { EmojiIcon } from "@/components/ui/emoji-icon";
import { playHover, playClick } from "@/lib/audio";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import HistorySection from "./history-section";
import SkillsSection, { type SkillId, type SkillStats } from "./skills-section";
import StreakChart, { type StreakDay } from "./streak-chart";

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
  skills: Record<SkillId, SkillStats>;
  streakDays: StreakDay[];
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

export default function DashboardClient({
  dict,
  lang,
  user,
  progress,
  stats,
  skills,
  streakDays,
  history,
}: Props) {
  const d = dict.dashboard;
  const { copied, copy } = useCopyToClipboard();

  function handleShare() {
    playClick();
    copy(`${window.location.origin}/${lang}/profile/${user.id}`);
  }

  const statCards = [
    {
      Icon: Zap,
      label: dict.dashboard.xp,
      value: progress.xp,
      color: "var(--accent)",
    },
    {
      Icon: Flame,
      label: dict.dashboard.streak,
      value: `${progress.streak}`,
      color: "#B5520A",
    },
    {
      Icon: Target,
      label: dict.dashboard.accuracy,
      value: `${stats.accuracy}%`,
      color: "var(--success)",
    },
    {
      Icon: BookOpen,
      label: dict.dashboard.totalQuizzes,
      value: stats.totalQuizzes,
      color: "var(--swiss-red)",
    },
  ];

  return (
    <AppShell lang={lang} dict={dict}>
      <main className="flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          {/* Welcome header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name ?? ""}
                  className="h-10 w-10 rounded-sm object-cover border-2 border-[var(--border)] sm:h-14 sm:w-14"
                />
              )}
              <div>
                <p className="font-[family-name:var(--font-body)] text-xs text-[var(--fg-muted)] sm:text-sm">
                  {d.welcome},
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight text-[var(--fg)] sm:text-2xl">
                  {user.name ?? user.email?.split("@")[0]}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={playHover}
                onClick={handleShare}
                className="flex items-center gap-2 border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-100 font-[family-name:var(--font-body)] sm:px-4 sm:py-3"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={16} />
                      {d.shareProfileCopied}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="share"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <Share2 size={16} />
                      {d.shareProfile}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={`/${lang}/questions`}
                  className="group inline-flex items-center gap-2 border-2 border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:bg-transparent hover:text-[var(--accent)] transition-colors duration-100 font-[family-name:var(--font-display)] sm:px-5 sm:py-3"
                >
                  <BookOpen size={18} />
                  {d.startPractice}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Stat cards */}
          <div className="mb-4 sm:mb-8">
            <p className="mb-2 font-[family-name:var(--font-body)] text-xs uppercase tracking-[0.12em] text-[var(--fg-muted)] sm:mb-4">
              {d.stats}
            </p>
            <div className="grid grid-cols-2 gap-[2px] sm:grid-cols-4">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="border-2 border-[var(--border)] bg-[var(--surface)] p-3 shadow-offset-sm transition-colors hover:border-[var(--fg)] sm:p-4"
                >
                  <div className="mb-1.5 sm:mb-3">
                    <card.Icon size={18} style={{ color: card.color }} />
                  </div>
                  <p className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight text-[var(--fg)] sm:text-2xl">
                    {card.value}
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-xs text-[var(--fg-muted)] mt-0.5">
                    {card.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* XP Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mb-4 border border-[var(--border)] bg-[var(--surface)] p-3 sm:mb-8 sm:p-5"
            style={{ borderRadius: 0 }}
          >
            <div className="mb-2 flex items-center justify-between sm:mb-3">
              <div className="flex items-center gap-2">
                <EmojiIcon emoji="🏆" size={18} />
                <span className="font-[family-name:var(--font-display)] font-extrabold text-[var(--fg)]">
                  {d.level} {Math.floor(progress.xp / 100) + 1}
                </span>
              </div>
              <span className="font-[family-name:var(--font-body)] text-sm text-[var(--fg-muted)]">
                {progress.xp % 100} / 100 XP
              </span>
            </div>
            <div className="h-[3px] w-full overflow-hidden bg-[var(--bg-secondary)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.xp % 100}%` }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="h-full bg-[var(--accent)]"
              />
            </div>
          </motion.div>

          {/* Last study */}
          {progress.lastStudy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mb-3 flex items-center gap-2 font-[family-name:var(--font-body)] text-xs text-[var(--fg-muted)] sm:mb-0 sm:text-sm"
            >
              <Calendar size={14} />
              {d.lastStudy}: {new Date(progress.lastStudy).toLocaleDateString(lang)}
            </motion.div>
          )}

          <StreakChart dict={dict} lang={lang} days={streakDays} streak={progress.streak} />

          <SkillsSection dict={dict} skills={skills} />

          <HistorySection dict={dict} lang={lang} history={history} />

          {/* Start practice CTA if no quizzes yet */}
          {stats.totalQuizzes === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 border border-dashed border-[var(--border)] p-8 text-center"
              style={{ borderRadius: 0 }}
            >
              <EmojiIcon emoji="📚" size={40} className="mx-auto mb-3" />
              <p className="mb-4 font-[family-name:var(--font-body)] text-[var(--fg-muted)]">
                {d.noProgress}
              </p>
              <Link
                href={`/${lang}/questions`}
                className="inline-flex items-center gap-2 border-2 border-[var(--accent)] bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-transparent hover:text-[var(--accent)] transition-colors duration-100"
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
