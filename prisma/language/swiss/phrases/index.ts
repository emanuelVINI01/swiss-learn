// Swiss German (gsw) full-sentence phrases, split by category. See index.ts for PHRASE_ENTRIES.
import type { PhraseEntry } from "./types";
import { DAILY_LIFE } from "./daily-life";
import { FOOD } from "./food";
import { NATURE } from "./nature";
import { QUESTIONS } from "./questions";
import { FEELINGS } from "./feelings";
import { FAMILY } from "./family";
import { BASICS } from "./basics";

export type { PhraseEntry };

export const PHRASE_ENTRIES: PhraseEntry[] = [
  ...DAILY_LIFE,
  ...FOOD,
  ...NATURE,
  ...QUESTIONS,
  ...FEELINGS,
  ...FAMILY,
  ...BASICS,
];
