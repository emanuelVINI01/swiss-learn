"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Medal } from "lucide-react";
import { playHover, playClick } from "@/lib/audio";

type RankingEntry = {
  userId: string;
  name: string | null;
  image: string | null;
  lessonsCount: number;
};

type Period = "day" | "week" | "month";

type Props = {
  dict: any;
  currentUserId: string | undefined;
  initialRanking: RankingEntry[];
};

const PERIODS: Period[] = ["day", "week", "month"];

export default function RankingSection({ dict, currentUserId, initialRanking }: Props) {
  const d = dict.dashboard;
  const [period, setPeriod] = useState<Period>("week");
  const [ranking, setRanking] = useState<RankingEntry[]>(initialRanking);
  const [loading, setLoading] = useState(false);

  const periodLabel: Record<Period, string> = {
    day: d.rankingDay,
    week: d.rankingWeek,
    month: d.rankingMonth,
  };

  async function changePeriod(next: Period) {
    playClick();
    setPeriod(next);
    setLoading(true);
    const res = await fetch(`/api/ranking?period=${next}`);
    if (res.ok) {
      const data = await res.json();
      setRanking(data.ranking ?? []);
    }
    setLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <div className="mb-4 flex justify-center">
        <div className="flex gap-1 rounded-xl bg-[var(--bg-secondary)] p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onMouseEnter={playHover}
              onClick={() => changePeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                period === p
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 text-center text-sm text-[var(--fg-muted)]"
          >
            {dict.questions.loading}
          </motion.div>
        ) : ranking.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 text-center text-sm text-[var(--fg-muted)]"
          >
            {d.noRanking}
          </motion.div>
        ) : (
          <motion.div
            key={period}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-1"
          >
            {ranking.map((entry, i) => {
              const isYou = entry.userId === currentUserId;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                    isYou ? "bg-[var(--accent-muted)]" : ""
                  }`}
                >
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-[var(--fg-subtle)]">
                    {i + 1}
                  </span>
                  {entry.image ? (
                    <img
                      src={entry.image}
                      alt={entry.name ?? ""}
                      className="h-8 w-8 shrink-0 rounded-full object-cover border border-[var(--border)]"
                    />
                  ) : (
                    <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--bg-secondary)]" />
                  )}
                  <span className="flex-1 truncate text-sm font-medium text-[var(--fg)]">
                    {isYou ? d.you : (entry.name ?? "—")}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--fg-muted)]">
                    <Medal size={12} className={i === 0 ? "text-[var(--warning)]" : ""} />
                    {entry.lessonsCount} {d.lessons}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
