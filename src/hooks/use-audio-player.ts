"use client";

import { useEffect, useRef } from "react";

// Drives a single <audio> element: optionally autoplays once, and exposes a
// replay() that always restarts from the beginning.
export function useAudioPlayer(autoPlay = false) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoPlay) {
      audioRef.current?.play().catch(() => {});
    }
  }, [autoPlay]);

  function replay() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  return { audioRef, replay };
}
