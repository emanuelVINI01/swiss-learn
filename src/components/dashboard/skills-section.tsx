"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { EmojiIcon } from "@/components/ui/emoji-icon";

export type SkillStats = {
  level: number;
  correct: number;
  answered: number;
  accuracy: number;
};

export type SkillId = "listening" | "vocabulary" | "reading";

// Stable render order — mirrors ALL_SKILLS in lib/server/quiz-rules.ts.
const SKILLS: { id: SkillId; emoji: string; labelKey: string }[] = [
  { id: "listening", emoji: "🎧", labelKey: "skillListening" },
  { id: "vocabulary", emoji: "📖", labelKey: "skillVocabulary" },
  { id: "reading", emoji: "🔤", labelKey: "skillReading" },
];

type Props = {
  dict: any;
  skills: Record<SkillId, SkillStats>;
};

export default function SkillsSection({ dict, skills }: Props) {
  const d = dict.dashboard;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="mb-8"
    >
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={16} className="text-[var(--fg-muted)]" />
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          {d.skills}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SKILLS.map((skill, i) => {
          const stats = skills[skill.id];
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.08, duration: 0.4 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <EmojiIcon emoji={skill.emoji} size={22} />
                <span className="text-sm font-bold text-[var(--fg)]">{d[skill.labelKey]}</span>
              </div>
              <p className="text-2xl font-extrabold text-[var(--fg)]">
                {d.level} {stats.level}
              </p>
              {stats.answered > 0 ? (
                <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                  {stats.accuracy}% · {stats.correct}/{stats.answered} {d.skillAnswered}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{d.skillNoData}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
