import { getDictionary } from "@/app/[lang]/dictionaries";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getRanking } from "@/lib/server/ranking";
import RankingClient from "@/components/ranking/ranking-client";

export const dynamic = "force-dynamic";

export default async function RankingPage({ params }: { params: Promise<{ lang: string }> }) {
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
