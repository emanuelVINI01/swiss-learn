import { locales, type Locale } from "@/app/[lang]/dictionaries";

export const SITE_NAME = "SwissLearn";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/** Trailing slash stripped so callers can safely do `${SITE_URL}/${path}`. */
export const SITE_URL = rawSiteUrl.replace(/\/$/, "");

/** Swiss German is only spoken in Switzerland, so `de` maps to the Swiss locale, not `de_DE`. */
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  de: "de_CH",
  pt: "pt_BR",
};

/** hreflang map for a given path (e.g. "" for the root, "/signin"), keyed by locale + x-default. Values are relative — callers rely on `metadataBase` to resolve them. */
export function hreflangAlternates(path = ""): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[locale] = `/${locale}${path}`;
  languages["x-default"] = `/en${path}`;
  return languages;
}
