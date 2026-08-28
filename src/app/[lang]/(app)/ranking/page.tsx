import type { Metadata } from "next";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getRanking } from "@/lib/server/ranking";
import RankingClient from "@/components/ranking/ranking-client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return { title: dict.nav.ranking, robots: { index: false, follow: false } };
}

export default async function RankingPage({ params }: Props) {
  // Auth must be checked fresh per request, never served from a prerendered shell.
  await connection();
  const { lang } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${lang}/signin`);

  const dict = await getDictionary(lang);
  const ranking = await getRanking("week");

  return (
    <RankingClient
      dict={dict}
      lang={lang}
      currentUserId={session.user.id}
      initialRanking={ranking}
    />
  );
}
