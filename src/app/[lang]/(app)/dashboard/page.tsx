import type { Metadata } from "next";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  getQuizStats,
  listQuizHistory,
  getStreakActivity,
  getCurrentStreak,
  getOrCreateProgress,
} from "@/lib/server/quiz";
import DashboardClient from "@/components/dashboard/dashboard-client";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return { title: dict.nav.dashboard, robots: { index: false, follow: false } };
}

export default async function DashboardPage({ params }: Props) {
  // Auth must be checked fresh per request, never served from a prerendered shell.
  await connection();
  const { lang } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${lang}/signin`);

  const dict = await getDictionary(lang);

  // Fetch quiz stats, recent history, progress, and the streak activity chart
  const [progress, { totalQuizzes, accuracy, skills }, history, streakDays] = await Promise.all([
    getOrCreateProgress(session.user.id),
    getQuizStats(session.user.id),
    listQuizHistory(session.user.id),
    getStreakActivity(session.user.id),
  ]);

  return (
    <DashboardClient
      dict={dict}
      lang={lang}
      user={session.user}
      progress={{
        xp: progress.xp,
        streak: getCurrentStreak(streakDays),
        lastStudy: progress.lastStudy,
      }}
      stats={{ totalQuizzes, accuracy }}
      skills={skills}
      streakDays={streakDays}
      history={history}
    />
  );
}
