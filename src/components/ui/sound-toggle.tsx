"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { playClick } from "@/lib/audio";
import { useMuted } from "@/hooks/use-muted";

type Props = {
  muteLabel: string;
  unmuteLabel: string;
};

export function SoundToggle({ muteLabel, unmuteLabel }: Props) {
  const [muted, setMuted] = useMuted();

  function toggle() {
    const next = !muted;
    setMuted(next);
    if (!next) playClick();
  }

  return (
    <button
      onClick={toggle}
      aria-label={muted ? unmuteLabel : muteLabel}
      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--surface-2)] text-[var(--fg-muted)] transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={String(muted)}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
