import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { hasLocale, locales } from "./dictionaries";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: {
    default: "SwissLearn — Learn Swiss German",
    template: "%s | SwissLearn",
  },
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const session = await auth();

  return (
    <html lang={lang} suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <SessionProvider session={session}>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
