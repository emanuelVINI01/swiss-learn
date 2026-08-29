"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { Sun, Moon, LogOut } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Logo } from "./logo";
import { Flag, LOCALE_FLAG } from "./flag";
import { SoundToggle } from "./sound-toggle";
import { playHover, playClick } from "@/lib/audio";

type NavDict = {
  home: string;
  signin: string;
  dashboard: string;
  questions: string;
  ranking: string;
  signout: string;
};

type LangDict = {
  switch: string;
  en: string;
  pt: string;
  de: string;
};

type ThemeDict = {
  toggle: string;
};

type SoundDict = {
  mute: string;
  unmute: string;
};

type Props = {
  lang: string;
  nav: NavDict;
  langDict: LangDict;
  themeDict: ThemeDict;
  soundDict: SoundDict;
};

const LOCALES = ["en", "pt", "de"] as const;

export default function Navbar({ lang, nav, langDict, themeDict, soundDict }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);

  function switchLang(locale: string) {
    // Replace the current locale prefix
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  }

  const links = session
    ? [
        { href: `/${lang}/dashboard`, label: nav.dashboard },
        { href: `/${lang}/questions`, label: nav.questions },
        { href: `/${lang}/ranking`, label: nav.ranking },
      ]
    : [];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50"
    >
      {/* No glass, no backdrop-blur — structural border */}
      <div className="bg-[var(--surface)] border-b-2 border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-2 sm:px-6 py-3">
          <Logo href={`/${lang}`} size={24} textSize="text-sm sm:text-lg" />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={playHover}
                onClick={playClick}
                className={`font-[family-name:var(--font-body)] text-xs uppercase tracking-[0.1em] font-medium transition-colors hover:text-[var(--accent)] border-b-2 pb-0.5 ${
                  pathname === l.href
                    ? "text-[var(--fg)] border-[var(--fg)]"
                    : "text-[var(--fg-muted)] border-transparent"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Lang switcher */}
            <div className="relative">
              <button
                onMouseEnter={playHover}
                onClick={() => { setLangOpen((o) => !o); playClick(); }}
                className="flex h-8 w-8 items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
                aria-label={langDict.switch}
              >
                <Flag code={LOCALE_FLAG[lang] ?? "us"} size={18} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-max min-w-[140px] border-2 border-[var(--border)] bg-[var(--surface)] p-1 z-50"
                    style={{ boxShadow: "var(--shadow-md)" }}
                  >
                    {LOCALES.map((locale) => (
                      <Link
                        key={locale}
                        href={switchLang(locale)}
                        onMouseEnter={playHover}
                        onClick={() => { setLangOpen(false); playClick(); }}
                        className={`flex w-full whitespace-nowrap items-center gap-2 px-3 py-2 font-[family-name:var(--font-body)] text-sm transition-colors hover:bg-[var(--accent-muted)] ${
                          locale === lang ? "text-[var(--accent)] font-semibold" : "text-[var(--fg-muted)]"
                        }`}
                      >
                        <Flag code={LOCALE_FLAG[locale]} size={16} />
                        {langDict[locale as keyof typeof langDict]}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <button
              onMouseEnter={playHover}
              onClick={() => { toggleTheme(); playClick(); }}
              className="flex h-8 w-8 items-center justify-center hover:bg-[var(--surface-2)] text-[var(--fg-muted)] transition-colors"
              aria-label={themeDict.toggle}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </motion.span>
              </AnimatePresence>
            </button>

            <SoundToggle muteLabel={soundDict.mute} unmuteLabel={soundDict.unmute} />

            {/* Auth button */}
            {session ? (
              <div className="flex items-center gap-2">
                <img
                  src={session.user?.image ?? ""}
                  alt={session.user?.name ?? ""}
                  className="h-8 w-8 rounded-none object-cover border border-[var(--border)]"
                />
                <button
                  onMouseEnter={playHover}
                  onClick={() => { signOut(); playClick(); }}
                  className="hidden font-[family-name:var(--font-body)] text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--error)] transition-colors md:block"
                >
                  {nav.signout}
                </button>
                <button
                  onMouseEnter={playHover}
                  onClick={() => { signOut(); playClick(); }}
                  aria-label={nav.signout}
                  className="flex h-8 w-8 items-center justify-center hover:bg-[var(--error-muted)] text-[var(--fg-muted)] hover:text-[var(--error)] transition-colors md:hidden"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                href={`/${lang}/signin`}
                onMouseEnter={playHover}
                onClick={playClick}
                className="border-2 border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 font-[family-name:var(--font-body)] text-sm font-bold text-white hover:bg-transparent hover:text-[var(--accent)] transition-colors duration-100"
              >
                {nav.signin}
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
