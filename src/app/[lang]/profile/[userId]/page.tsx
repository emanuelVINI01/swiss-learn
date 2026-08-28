import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { prisma } from "@/lib/prisma";
import { getQuizStats, getStreakActivity, getCurrentStreak, SOURCE_LANG } from "@/lib/server/quiz";
import ProfileClient from "@/components/profile/profile-client";

type Props = { params: Promise<{ lang: string; userId: string }> };

// Shared between generateMetadata and the page body so a shared profile
// link only ever does one lookup, not two.
const findUser = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, image: true },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, userId } = await params;
  const dict = await getDictionary(lang);
  const user = await findUser(userId);
  return {
    title: user ? `${user.name ?? dict.dashboard.publicProfile} · ${dict.seo.title}` : dict.dashboard.publicProfile,
    robots: { index: false, follow: false },
  };
}

// Public, unauthenticated — this is the "share your profile" link, so it
// must render for any visitor. It never creates a UserProgress row (unlike
// the private dashboard) since an anonymous visit shouldn't write to the DB.
export default async function PublicProfilePage({ params }: Props) {
  const { lang, userId } = await params;
  const user = await findUser(userId);
  if (!user) notFound();

  const dict = await getDictionary(lang);

  const [progress, stats, streakDays] = await Promise.all([
    prisma.userProgress.findUnique({ where: { userId_language: { userId, language: SOURCE_LANG } } }),
    getQuizStats(userId),
    getStreakActivity(userId),
  ]);

  return (
    <ProfileClient
      dict={dict}
      lang={lang}
      user={{ name: user.name, image: user.image }}
      xp={progress?.xp ?? 0}
      streak={getCurrentStreak(streakDays)}
      stats={{ totalQuizzes: stats.totalQuizzes, accuracy: stats.accuracy }}
      skills={stats.skills}
      streakDays={streakDays}
    />
  );
}
