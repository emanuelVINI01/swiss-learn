"use client";

import { useState } from "react";

// Copies text to the clipboard and flips `copied` back off after resetDelay,
// so callers can drive a "Copied!" confirmation state.
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — nothing to fall back to.
    }
  }

  return { copied, copy };
}
