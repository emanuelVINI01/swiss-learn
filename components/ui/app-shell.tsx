"use client";

import Navbar from "./navbar";
import BottomNav from "./bottom-nav";

type Props = {
  lang: string;
  dict: any;
  children: React.ReactNode;
};

// Shared chrome for authenticated app screens (dashboard, questions)
export default function AppShell({ lang, dict, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar lang={lang} nav={dict.nav} langDict={dict.lang} />
      <div className="flex flex-1 flex-col pb-24 md:pb-0">{children}</div>
      <BottomNav lang={lang} nav={dict.nav} />
    </div>
  );
}
