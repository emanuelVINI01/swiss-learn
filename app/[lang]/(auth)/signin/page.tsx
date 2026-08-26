import { getDictionary } from "@/app/[lang]/dictionaries";
import SigninPageClient from "@/components/landing/signin-page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SigninPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth();
  if (session) redirect(`/${lang}/dashboard`);
  const dict = await getDictionary(lang);
  return <SigninPageClient dict={dict} lang={lang} />;
}
