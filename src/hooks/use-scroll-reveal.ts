"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

type InViewMargin = NonNullable<Parameters<typeof useInView>[1]>["margin"];

// Tracks whether an element has scrolled into view, once, so entrance
// animations only ever play the first time a section appears.
export function useScrollReveal(margin: InViewMargin = "-80px") {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin });
  return { ref, inView };
}
