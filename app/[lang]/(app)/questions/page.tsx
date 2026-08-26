import { getDictionary } from "@/app/[lang]/dictionaries";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import QuestionsClient from "@/components/questions/questions-client";

export default async function QuestionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${lang}/signin`);

  const dict = await getDictionary(lang);

  return <QuestionsClient dict={dict} lang={lang} userId={session.user.id!} />;
}
