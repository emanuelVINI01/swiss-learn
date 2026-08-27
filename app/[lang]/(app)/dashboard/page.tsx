import { getDictionary } from "@/app/[lang]/dictionaries";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getQuizStats } from "@/lib/server/quiz";
import DashboardClient from "@/components/dashboard/dashboard-client";

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${lang}/signin`);

  const dict = await getDictionary(lang);

  // Fetch user progress
  let progress = await prisma.userProgress.findUnique({
    where: { userId_language: { userId: session.user.id, language: "gsw" } },
  });

  // Create initial progress if doesn't exist
  if (!progress) {
    progress = await prisma.userProgress.create({
      data: { userId: session.user.id, language: "gsw", xp: 0, streak: 0 },
    });
  }

  // Fetch quiz stats
  const { totalQuizzes, accuracy } = await getQuizStats(session.user.id);

  return (
    <DashboardClient
      dict={dict}
      lang={lang}
      user={session.user}
      progress={{
        xp: progress.xp,
        streak: progress.streak,
        lastStudy: progress.lastStudy?.toISOString() ?? null,
      }}
      stats={{ totalQuizzes, accuracy }}
    />
  );
}
