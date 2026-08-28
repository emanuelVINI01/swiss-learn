import type { MetadataRoute } from "next";
import { locales } from "@/app/[lang]/dictionaries";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const languages = Object.fromEntries(
    locales.map((locale) => [locale, `${SITE_URL}/${locale}`])
  );
  languages["x-default"] = `${SITE_URL}/en`;

  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified,
    changeFrequency: "weekly",
    priority: locale === "en" ? 1 : 0.8,
    alternates: { languages },
  }));
}
