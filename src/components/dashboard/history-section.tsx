"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Flag, LOCALE_FLAG, type FlagCode } from "@/components/ui/flag";
import { EmojiIcon } from "@/components/ui/emoji-icon";

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
  history: HistoryEntry[];
};

export default function HistorySection({ dict, lang, history }: Props) {
  const d = dict.dashboard;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="mb-8"
    >
      <div className="mb-4 flex items-center gap-2">
        <Clock size={16} className="text-[var(--fg-muted)]" />
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          {d.history}
        </p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--fg-muted)]">
          {d.noHistory}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          {history.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between gap-3 px-4 py-3 ${
                i !== history.length - 1 ? "border-b border-[var(--border)]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Flag code={(LOCALE_FLAG[entry.targetLang] ?? "us") as FlagCode} size={20} />
                <div>
                  <p className="text-sm font-semibold text-[var(--fg)]">
                    {entry.score}/{entry.total} · {entry.accuracy}%
                  </p>
                  <p className="text-xs text-[var(--fg-muted)]">
                    {new Date(entry.endedAt).toLocaleDateString(lang)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                <EmojiIcon emoji="🏆" size={14} />
                +{entry.xpGained} XP
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
