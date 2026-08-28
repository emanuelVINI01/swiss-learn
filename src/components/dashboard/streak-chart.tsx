"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export type StreakDay = { date: string; count: number };

type Props = {
  dict: any;
  lang: string;
  days: StreakDay[];
  streak: number;
};

// Discrete intensity levels, GitHub-style: 0 = no activity, 1-4 scale with
// how many questions were answered that day.
function levelFor(count: number): number {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

const LEVEL_OPACITY = [0, 0.3, 0.55, 0.8, 1];

function cellStyle(count: number): React.CSSProperties {
  const level = levelFor(count);
  if (level === 0) return { backgroundColor: "var(--bg-secondary)" };
  return { backgroundColor: "var(--accent)", opacity: LEVEL_OPACITY[level] };
}

// Weekday label rows shown on the left, GitHub-style (only every other one).
const WEEKDAY_LABEL_ROWS = [1, 3, 5];

export default function StreakChart({ dict, lang, days, streak }: Props) {
  const d = dict.dashboard;

  const weeks = useMemo<(StreakDay | null)[][]>(() => {
    if (days.length === 0) return [];
    const leadingEmpty = new Date(`${days[0].date}T00:00:00`).getDay();
    const cells: (StreakDay | null)[] = [...Array.from({ length: leadingEmpty }, () => null), ...days];
    while (cells.length % 7 !== 0) cells.push(null);

    const result: (StreakDay | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) result.push(cells.slice(i, i + 7));
    return result;
  }, [days]);

  const monthLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(lang, { month: "short" });
    let lastMonth = -1;
    return weeks.map((week) => {
      const firstDay = week.find((day) => day !== null);
      if (!firstDay) return "";
      const month = new Date(`${firstDay.date}T00:00:00`).getMonth();
      if (month === lastMonth) return "";
      lastMonth = month;
      return formatter.format(new Date(`${firstDay.date}T00:00:00`));
    });
  }, [weeks, lang]);

  const weekdayFormatter = new Intl.DateTimeFormat(lang, { weekday: "short" });
  const weekdayLabel = (row: number) => {
    // Any date known to fall on the right weekday — 2024-01-07 was a Sunday.
    const reference = new Date(2024, 0, 7 + row);
    return weekdayFormatter.format(reference);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.42, duration: 0.4 }}
      className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-[var(--swiss-red)]" />
          <span className="font-bold text-[var(--fg)]">
            {streak} {d.streakDays}
          </span>
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          {d.streakChart}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          <div className="flex gap-1 pl-7">
            {weeks.map((_, i) => (
              <div key={i} className="w-3 shrink-0 text-left text-[10px] text-[var(--fg-muted)]">
                {monthLabels[i]}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <div className="flex w-6 shrink-0 flex-col gap-1">
              {Array.from({ length: 7 }, (_, row) => (
                <div key={row} className="h-3 text-[10px] leading-3 text-[var(--fg-muted)]">
                  {WEEKDAY_LABEL_ROWS.includes(row) ? weekdayLabel(row) : ""}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex shrink-0 flex-col gap-1">
                {week.map((day, di) =>
                  day ? (
                    <div
                      key={di}
                      title={`${day.count} ${d.streakActivities} · ${new Date(
                        `${day.date}T00:00:00`
                      ).toLocaleDateString(lang)}`}
                      className="h-3 w-3 rounded-sm"
                      style={cellStyle(day.count)}
                    />
                  ) : (
                    <div key={di} className="h-3 w-3" />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-[var(--fg-muted)]">
        <span>{d.streakLess}</span>
        {LEVEL_OPACITY.map((opacity, i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-sm"
            style={
              opacity === 0
                ? { backgroundColor: "var(--bg-secondary)" }
                : { backgroundColor: "var(--accent)", opacity }
            }
          />
        ))}
        <span>{d.streakMore}</span>
      </div>
    </motion.div>
  );
}
