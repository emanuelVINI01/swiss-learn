import type { Metadata } from "next";
import { getDictionary } from "@/app/[lang]/dictionaries";
import SigninPageClient from "@/components/landing/signin-page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return { title: dict.nav.signin, robots: { index: false, follow: true } };
}

export default async function SigninPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const { callbackUrl } = await searchParams;
  const session = await auth();
  if (session) redirect(callbackUrl ?? `/${lang}/dashboard`);
  const dict = await getDictionary(lang);
  return <SigninPageClient dict={dict} lang={lang} callbackUrl={callbackUrl} />;
}
