"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { SiGithub, SiGoogle } from "react-icons/si";
import Link from "next/link";
import { useTheme } from "@/components/ui/theme-provider";
import { Sun, Moon } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Logo, SwissCrossMark } from "@/components/ui/logo";
import { MountainIllustration } from "@/components/landing/mountain-illustration";
import { EmojiIcon } from "@/components/ui/emoji-icon";

type Props = {
  dict: any;
  lang: string;
};

export default function SigninPageClient({ dict, lang }: Props) {
  const d = dict;
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar minimal */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] glass">
        <Logo href={`/${lang}`} size={32} />
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--surface-2)] text-[var(--fg-muted)] transition-colors"
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
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 relative overflow-hidden">
        <MountainIllustration className="absolute inset-x-0 bottom-0 h-48 w-full opacity-70 pointer-events-none" />
        <div
          aria-hidden
          className="absolute -top-20 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Swiss flag emblem */}
          <div className="mb-8 flex justify-center">
            <SwissCrossMark size={56} rounded={14} />
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-extrabold text-[var(--fg)]">
                {d.signin.title}{" "}
                <span className="gradient-text">{d.signin.titleAccent}</span>
              </h1>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">
                {d.signin.subtitle}
              </p>
            </div>

            <div className="space-y-3">
              {/* GitHub */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn("github", { callbackUrl: `/${lang}/dashboard` })}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold text-[var(--fg)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
              >
                <SiGithub size={18} />
                {d.signin.github}
              </motion.button>

              {/* Google — coming soon */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                disabled
                className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold text-[var(--fg-subtle)] cursor-not-allowed opacity-60"
              >
                <SiGoogle size={16} />
                {d.signin.google}
                <span className="ml-auto rounded-full bg-[var(--border)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-subtle)]">
                  {d.signin.comingSoon}
                </span>
              </motion.button>
            </div>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-xs text-[var(--fg-subtle)]">secure sign in</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2.5 rounded-xl bg-[var(--accent-muted)] p-3.5">
              <EmojiIcon emoji="🛡️" size={16} className="mt-0.5" />
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                We only read your public profile. We never post on your behalf.
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-[var(--fg-subtle)]">
            {d.signin.terms}{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-[var(--accent)]">
              {d.signin.termsLink}
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
