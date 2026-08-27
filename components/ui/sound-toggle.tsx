"use client";

import { useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, isMutedServerSnapshot, setMuted, subscribeMuted, playClick } from "@/lib/audio";

export function SoundToggle() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, isMutedServerSnapshot);

  function toggle() {
    const next = !muted;
    setMuted(next);
    if (!next) playClick();
  }

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
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
