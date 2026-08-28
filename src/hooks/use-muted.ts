"use client";

import { useSyncExternalStore } from "react";
import { isMuted, isMutedServerSnapshot, setMuted, subscribeMuted } from "@/lib/audio";

// useSyncExternalStore keeps this in sync with the module-level mute flag
// in lib/audio.ts without a setState-in-effect dance.
export function useMuted() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, isMutedServerSnapshot);
  return [muted, setMuted] as const;
}
