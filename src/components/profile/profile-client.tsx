"use client";

import { motion } from "framer-motion";
import { Zap, Trophy, Target, BookOpen } from "lucide-react";
import AppShell from "@/components/ui/app-shell";
import SkillsSection, { type SkillId, type SkillStats } from "@/components/dashboard/skills-section";
import StreakChart, { type StreakDay } from "@/components/dashboard/streak-chart";

type Props = {
  dict: any;
  lang: string;
  user: { name: string | null; image: string | null };
  xp: number;
  streak: number;
  stats: { totalQuizzes: number; accuracy: number };
  skills: Record<SkillId, SkillStats>;
  streakDays: StreakDay[];
};

export default function ProfileClient({ dict, lang, user, xp, streak, stats, skills, streakDays }: Props) {
  const d = dict.dashboard;

  const statCards = [
    { Icon: Zap, label: d.xp, value: xp },
    { Icon: Trophy, label: d.level, value: Math.floor(xp / 100) + 1 },
    { Icon: Target, label: d.accuracy, value: `${stats.accuracy}%` },
    { Icon: BookOpen, label: d.totalQuizzes, value: stats.totalQuizzes },
  ];

  return (
    <AppShell lang={lang} dict={dict}>
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex items-center gap-4"
          >
            {user.image && (
              <img
                src={user.image}
                alt={user.name ?? ""}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-[var(--border)]"
              />
            )}
            <div>
              <p className="text-sm text-[var(--fg-muted)]">{d.publicProfile}</p>
              <h1 className="text-2xl font-extrabold text-[var(--fg)]">{user.name ?? "—"}</h1>
            </div>
          </motion.div>

          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
                  <card.Icon size={20} className="text-[var(--accent)]" />
                </div>
                <p className="text-2xl font-extrabold text-[var(--fg)]">{card.value}</p>
                <p className="text-xs text-[var(--fg-muted)] mt-0.5">{card.label}</p>
              </motion.div>
            ))}
          </div>

          <StreakChart dict={dict} lang={lang} days={streakDays} streak={streak} />

          <SkillsSection dict={dict} skills={skills} />
        </div>
      </main>
    </AppShell>
  );
}
