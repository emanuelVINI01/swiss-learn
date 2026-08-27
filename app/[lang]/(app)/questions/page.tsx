import { getDictionary } from "@/app/[lang]/dictionaries";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import QuestionsClient from "@/components/questions/questions-client";
import { isTargetLang, listActiveQuizzes } from "@/lib/server/quiz";

export default async function QuestionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${lang}/signin`);

  const dict = await getDictionary(lang);
  const targetLang = isTargetLang(lang) ? lang : "en";
  const quizzes = await listActiveQuizzes(session.user.id, targetLang);

  return (
    <QuestionsClient
      dict={dict}
      lang={lang}
      targetLang={targetLang}
      initialQuizzes={quizzes}
    />
  );
}
