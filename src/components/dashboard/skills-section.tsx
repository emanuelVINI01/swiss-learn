"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
      className="mb-4 sm:mb-8"
    >
      <div className="mb-2 flex items-center gap-2 sm:mb-4">
        <Sparkles size={16} className="text-[var(--fg-muted)]" />
        <p className="font-[family-name:var(--font-body)] text-xs font-medium uppercase tracking-[0.12em] text-[var(--fg-muted)]">
          {d.skills}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-[2px]">
        {SKILLS.map((skill, i) => {
          const stats = skills[skill.id];
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.08, duration: 0.4 }}
              className="border-2 border-[var(--border)] bg-[var(--surface)] p-2 hover:border-[var(--fg)] transition-colors sm:p-5"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              {/* Square letter indicator — replaces emoji */}
              <div className="mb-1.5 flex h-6 w-6 items-center justify-center border-2 border-[var(--fg)] font-[family-name:var(--font-display)] text-xs font-bold text-[var(--fg)] sm:mb-3 sm:h-8 sm:w-8">
                {skill.id.charAt(0).toUpperCase()}
              </div>
              <span className="font-[family-name:var(--font-display)] font-bold text-xs text-[var(--fg)] sm:text-sm">
                {d[skill.labelKey]}
              </span>
              <p className="font-[family-name:var(--font-display)] tracking-tight text-base font-extrabold text-[var(--fg)] mt-1 sm:text-2xl">
                {d.level} {stats.level}
              </p>
              {stats.answered > 0 ? (
                <p className="mt-0.5 font-[family-name:var(--font-body)] text-[10px] text-[var(--fg-muted)] sm:text-xs">
                  {stats.accuracy}% · {stats.correct}/{stats.answered} {d.skillAnswered}
                </p>
              ) : (
                <p className="mt-0.5 font-[family-name:var(--font-body)] text-[10px] text-[var(--fg-muted)] sm:text-xs">
                  {d.skillNoData}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
