// Swiss German (gsw) single-word vocabulary, split by category. See index.ts for WORD_ENTRIES.
import type { WordEntry } from "./types";
import { GREETINGS } from "./greetings";
import { NUMBERS } from "./numbers";
import { FOOD } from "./food";
import { OBJECTS } from "./objects";
import { TRANSPORT } from "./transport";
import { BASICS } from "./basics";
import { TIME } from "./time";
import { FAMILY } from "./family";
import { NATURE } from "./nature";
import { COLORS } from "./colors";
import { BODY } from "./body";
import { ANIMALS } from "./animals";
import { CLOTHING } from "./clothing";
import { VERBS } from "./verbs";
import { PLACES } from "./places";

export type { WordEntry };

export const WORD_ENTRIES: WordEntry[] = [
  ...GREETINGS,
  ...NUMBERS,
  ...FOOD,
  ...OBJECTS,
  ...TRANSPORT,
  ...BASICS,
  ...TIME,
  ...FAMILY,
  ...NATURE,
  ...COLORS,
  ...BODY,
  ...ANIMALS,
  ...CLOTHING,
  ...VERBS,
  ...PLACES,
];
