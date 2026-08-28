import type { Metadata } from "next";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import QuestionsClient from "@/components/questions/questions-client";
import { isTargetLang } from "@/lib/server/quiz";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return { title: dict.nav.questions, robots: { index: false, follow: false } };
}

export default async function QuestionsPage({ params }: Props) {
  // Auth must be checked fresh per request, never served from a prerendered shell.
  await connection();
  const { lang } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${lang}/signin`);

  const dict = await getDictionary(lang);
  const targetLang = isTargetLang(lang) ? lang : "en";

  return <QuestionsClient dict={dict} lang={lang} targetLang={targetLang} />;
}
