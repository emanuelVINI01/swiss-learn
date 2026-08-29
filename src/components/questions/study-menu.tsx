"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { playHover, playClick } from "@/lib/audio";
import type { QuestionType, QuizMode } from "./types";

type Props = {
  dict: any;
  onStart: (mode: QuizMode, type?: QuestionType) => void;
};

const MODES: { mode: QuizMode; emoji: string; labelKey: string; descKey: string }[] = [
  { mode: "level", emoji: "📈", labelKey: "modeLevel", descKey: "modeLevelDesc" },
  { mode: "random", emoji: "🎲", labelKey: "modeRandom", descKey: "modeRandomDesc" },
];

const TYPES: { type: QuestionType; emoji: string; labelKey: string; descKey: string }[] = [
  { type: "word", emoji: "📚", labelKey: "typeWord", descKey: "typeWordDesc" },
  { type: "phraseFill", emoji: "🧩", labelKey: "typePhraseFill", descKey: "typePhraseFillDesc" },
  { type: "phraseMeaning", emoji: "💬", labelKey: "typePhraseMeaning", descKey: "typePhraseMeaningDesc" },
];

type OptionCardProps = {
  index: number;
  emoji: string;
  label: string;
  description: string;
  onClick: () => void;
};

function OptionCard({ index, label, description, onClick }: OptionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={playHover}
      onClick={() => { onClick(); playClick(); }}
      style={{ boxShadow: "var(--shadow-sm)" }}
      className="flex flex-col items-center gap-1 sm:gap-2 border-2 border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6 text-center transition-colors hover:border-[var(--fg)]"
    >
      <div className="mb-1 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center border-2 border-[var(--fg)] font-[family-name:var(--font-display)] text-sm sm:text-base font-bold text-[var(--fg)] mx-auto">
        {label.charAt(0).toUpperCase()}
      </div>
      <span className="font-[family-name:var(--font-display)] font-bold text-[var(--fg)]">{label}</span>
      <span className="font-[family-name:var(--font-body)] text-xs text-[var(--fg-muted)]">{description}</span>
    </motion.button>
  );
}

export default function StudyMenu({ dict, onStart }: Props) {
  const d = dict.questions;
  const [choosingType, setChoosingType] = useState(false);

  return (
    <main className="flex flex-1 flex-col overflow-y-auto px-4 py-6 sm:py-10 sm:px-6">
      <div className="w-full max-w-2xl m-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 font-[family-name:var(--font-display)] tracking-tight leading-none text-2xl font-extrabold text-[var(--fg)] sm:text-4xl">
            {d.studyTitle}
          </h1>
          <p className="mx-auto max-w-lg font-[family-name:var(--font-body)] text-sm text-[var(--fg-muted)]">
            {d.studySubtitle}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!choosingType ? (
            <motion.div
              key="modes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-[2px] sm:grid-cols-3"
            >
              {MODES.map((m, i) => (
                <OptionCard
                  key={m.mode}
                  index={i}
                  emoji={m.emoji}
                  label={d[m.labelKey]}
                  description={d[m.descKey]}
                  onClick={() => onStart(m.mode)}
                />
              ))}
              <OptionCard
                index={MODES.length}
                emoji="🎯"
                label={d.modeChooseType}
                description={d.modeChooseTypeDesc}
                onClick={() => setChoosingType(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="types"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onMouseEnter={playHover}
                onClick={() => { setChoosingType(false); playClick(); }}
                className="mb-4 flex items-center gap-1.5 font-[family-name:var(--font-body)] text-xs uppercase tracking-[0.1em] font-medium text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors"
              >
                <ArrowLeft size={15} />
                {d.back}
              </button>
              <div className="grid grid-cols-1 gap-[2px] sm:grid-cols-3">
                {TYPES.map((t, i) => (
                  <OptionCard
                    key={t.type}
                    index={i}
                    emoji={t.emoji}
                    label={d[t.labelKey]}
                    description={d[t.descKey]}
                    onClick={() => onStart("random", t.type)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
