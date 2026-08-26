import { getDictionary } from "./dictionaries";
import { auth } from "@/auth";
import LandingPage from "@/components/landing/landing-page";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const session = await auth();

  return <LandingPage dict={dict} lang={lang} session={session} />;
}
