import type { Metadata } from "next";
import { getDictionary, hasLocale } from "./dictionaries";
import { auth } from "@/auth";
import LandingPage from "@/components/landing/landing-page";
import { OG_LOCALE, SITE_NAME, SITE_URL, hreflangAlternates } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const { title, description } = dict.seo;

  return {
    // .absolute bypasses the root layout's "%s | SwissLearn" template — dict.seo.title
    // already carries the full brand name, so the template would double it up.
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${lang}`,
      languages: hreflangAlternates(),
    },
    // openGraph/twitter here fully replace (not merge with) the root layout's defaults,
    // so shared fields like siteName/card must be repeated.
    openGraph: {
      title,
      description,
      url: `/${lang}`,
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const session = await auth();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SwissLearn",
    url: `${SITE_URL}/${lang}`,
    description: dict.seo.description,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    inLanguage: lang,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <LandingPage dict={dict} lang={lang} session={session} />
    </>
  );
}
