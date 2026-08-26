import "server-only";
import { notFound } from "next/navigation";

const dictionaries = {
  en: () =>
    import("./dictionaries/en.json").then((m) => m.default),
  pt: () =>
    import("./dictionaries/pt.json").then((m) => m.default),
  de: () =>
    import("./dictionaries/de.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;

export const locales: Locale[] = ["en", "pt", "de"];

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = async (locale: string) => {
  if (!hasLocale(locale)) notFound();
  return dictionaries[locale]();
};

export const getDictionaryByLocale = async (locale: string) => {
  if (!hasLocale(locale)) notFound();
  return dictionaries[locale]();
};
