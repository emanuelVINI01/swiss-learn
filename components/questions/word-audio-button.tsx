"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { playHover, playClick } from "@/lib/audio";

type Props = {
  audioUrl: string;
  label: string;
  autoPlay?: boolean;
  size?: "sm" | "lg";
};

// Plays (and replays) one word's pronunciation clip. Used both as the
// primary control in "audio" quiz questions and as an optional "listen"
// button alongside the text prompt in "text" ones.
export default function WordAudioButton({ audioUrl, label, autoPlay = false, size = "sm" }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoPlay) {
      audioRef.current?.play().catch(() => {});
    }
  }, [autoPlay]);

  function replay() {
    playClick();
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  const dimension = size === "lg" ? "h-16 w-16" : "h-9 w-9";
  const iconSize = size === "lg" ? 28 : 16;

  return (
    <>
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={playHover}
        onClick={replay}
        aria-label={label}
        title={label}
        className={`flex ${dimension} shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-colors hover:bg-[var(--accent-hover)]`}
      >
        <Volume2 size={iconSize} />
      </motion.button>
    </>
  );
}
