import "server-only";

export const SOURCE_LANG = "gsw";
export const TARGET_LANGS = ["en", "pt", "de"] as const;
export type TargetLang = (typeof TARGET_LANGS)[number];

export function isTargetLang(value: string): value is TargetLang {
  return (TARGET_LANGS as readonly string[]).includes(value);
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
