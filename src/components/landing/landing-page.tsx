"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type Session } from "next-auth";
import { ArrowRight } from "lucide-react";
import { SiGithub } from "react-icons/si";
import Navbar from "@/components/ui/navbar";
import { SwissCrossMark } from "@/components/ui/logo";
import { Flag } from "@/components/ui/flag";
import { MountainIllustration } from "@/components/landing/mountain-illustration";
import { playHover, playClick, playSuccess, playError } from "@/lib/audio";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

type Props = {
  dict: any;
  lang: string;
  session: Session | null;
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const VOCAB = [
  { swiss: "Grüezi", de: "Guten Tag", meaning: { en: "Hello", pt: "Olá", de: "Hallo" } },
  { swiss: "Merci", de: "Danke", meaning: { en: "Thank you", pt: "Obrigado", de: "Danke schön" } },
  { swiss: "Velo", de: "Fahrrad", meaning: { en: "Bicycle", pt: "Bicicleta", de: "Fahrrad" } },
  { swiss: "Znacht", de: "Abendessen", meaning: { en: "Dinner", pt: "Jantar", de: "Abendessen" } },
];

const COMMUNITY_FLAGS = ["br", "de", "gb", "us", "it", "fr"] as const;

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage({ dict, lang, session }: Props) {
  const d = dict;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar lang={lang} nav={d.nav} langDict={d.lang} themeDict={d.theme} soundDict={d.sound} />

      {/* ─── Hero ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 sm:py-32 overflow-hidden">
        {/* Mountain skyline */}
        <MountainIllustration className="absolute inset-x-0 bottom-0 h-56 w-full sm:h-72 pointer-events-none" />

        {/* Typographic background letter */}
        <span
          aria-hidden
          className="graphic-letter pointer-events-none select-none absolute right-0 top-0 translate-x-1/4 -translate-y-1/4"
        >
          G
        </span>

        <Section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12">

          {/* Text */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 border border-[var(--accent-muted)] bg-[var(--accent-muted)] px-4 py-1.5 text-xs font-[family-name:var(--font-body)] font-medium uppercase tracking-[0.1em] text-[var(--accent)]">
                {d.hero.badge}
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-6">
              <SwissCrossMark size={64} rounded={16} />
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl font-extrabold sm:text-5xl md:text-6xl text-[var(--fg)] font-[family-name:var(--font-display)] tracking-tight leading-none">
              {d.hero.title}{" "}
              <span className="gradient-text">{d.hero.titleAccent}</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg text-[var(--fg-muted)] sm:text-xl leading-relaxed font-[family-name:var(--font-body)]">
              {d.hero.subtitle}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center lg:items-start gap-3 sm:flex-row">
              {session ? (
                <Link
                  href={`/${lang}/dashboard`}
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className="group flex items-center gap-2 border-2 border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-sm font-bold font-[family-name:var(--font-display)] text-white hover:bg-transparent hover:text-[var(--accent)] transition-colors duration-100"
                >
                  {d.nav.dashboard}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <>
                  <Link
                    href={`/${lang}/signin`}
                    onMouseEnter={playHover}
                    onClick={playClick}
                    className="group flex items-center gap-2 border-2 border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-sm font-bold font-[family-name:var(--font-display)] text-white hover:bg-transparent hover:text-[var(--accent)] transition-colors duration-100"
                  >
                    <SiGithub size={18} />
                    {d.hero.ctaSignin}
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href={`/${lang}/signin`}
                    onMouseEnter={playHover}
                    onClick={playClick}
                    className="border-2 border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-[family-name:var(--font-body)] font-medium text-[var(--fg-muted)] hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors duration-100"
                  >
                    {d.hero.cta}
                  </Link>
                </>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center lg:items-start gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-subtle)]">
                {d.hero.community}
              </span>
              <div className="flex items-center gap-2.5">
                {COMMUNITY_FLAGS.map((code) => (
                  <Flag key={code} code={code} size={24} className="drop-shadow-sm" />
                ))}
              </div>
            </motion.div>
          </div>

        </Section>

        {/* Stats bar */}
        <Section className="relative z-10 mx-auto w-full max-w-5xl mt-16 px-4 pb-8">
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 border-2 border-[var(--border)] bg-[var(--surface)] p-8"
          >
            {[
              { value: "500+", label: d.hero.stats.words },
              { value: "98%", label: d.hero.stats.accuracy },
              { value: "1k+", label: d.hero.stats.learners },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1.5">
                <span className="text-3xl font-extrabold font-[family-name:var(--font-display)] text-[var(--fg)]">
                  {stat.value}
                </span>
                <span className="text-xs font-bold font-[family-name:var(--font-body)] text-[var(--fg-muted)] uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ─── Learning Section ─── */}
      <section className="relative px-4 py-20 sm:py-28 bg-[var(--bg-secondary)] overflow-hidden">
        <div className="relative z-10 mx-auto max-w-6xl">
          <Section className="grid grid-cols-1 items-center gap-12">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-2xl mx-auto lg:mx-0">
              <motion.div variants={fadeUp} className="mb-4">
                <span className="inline-flex items-center gap-2 border border-[var(--accent-muted)] bg-[var(--accent-muted)] px-3 py-1 text-xs font-semibold font-[family-name:var(--font-body)] uppercase tracking-[0.1em] text-[var(--accent)]">
                  {d.learningSection?.badge || "Pace Yourself"}
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="mb-6 text-3xl font-extrabold sm:text-4xl text-[var(--fg)] font-[family-name:var(--font-display)] tracking-tight leading-none">
                {d.learningSection?.title || "Learn at your own rhythm"}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[var(--fg-muted)] leading-relaxed font-[family-name:var(--font-body)]">
                {d.learningSection?.description || "Our interactive modules adapt to your learning speed. No rush, no pressure—just consistent progress tailored for your daily routine."}
              </motion.p>
            </div>
          </Section>
        </div>
      </section>

      {/* ─── Progress Section ─── */}
      <section className="relative px-4 py-20 sm:py-28 overflow-hidden">
        <div className="relative z-10 mx-auto max-w-6xl">
          <Section className="grid grid-cols-1 items-center gap-12">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-2xl mx-auto lg:mx-0">
              <motion.div variants={fadeUp} className="mb-4">
                <span className="inline-flex items-center gap-2 border border-[var(--accent-muted)] bg-[var(--accent-muted)] px-3 py-1 text-xs font-semibold font-[family-name:var(--font-body)] uppercase tracking-[0.1em] text-[var(--accent)]">
                  {d.progressSection?.badge || "Track Success"}
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="mb-6 text-3xl font-extrabold sm:text-4xl text-[var(--fg)] font-[family-name:var(--font-display)] tracking-tight leading-none">
                {d.progressSection?.title || "Celebrate your victories"}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[var(--fg-muted)] leading-relaxed font-[family-name:var(--font-body)]">
                {d.progressSection?.description || "Visualize your journey as you master new vocabulary. Every word learned brings you one step closer to fluency and confidence."}
              </motion.p>
            </div>
          </Section>
        </div>
      </section>

      {/* ─── Demo quiz preview ─── */}
      <section className="px-4 py-20 sm:py-28 bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-6xl">
          <Section className="flex flex-col lg:flex-row gap-12 items-center">
            <motion.div variants={fadeUp} className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
                {d.demo?.livePreview || "Live Preview"}
              </p>
              <h2 className="text-3xl font-extrabold sm:text-4xl text-[var(--fg)] mb-4 flex items-center gap-3">
                <Flag code="ch" size={30} /> {d.demo?.greeting || "Grüezi!"}
              </h2>
              <p className="text-[var(--fg-muted)] leading-relaxed mb-6">
                {d.demo?.description || "Swiss German (Schweizerdeutsch) is not just German with an accent — it's a whole different spoken dialect. We make it approachable."}
              </p>
              <div className="flex flex-col gap-2.5">
                {VOCAB.map((item) => (
                  <div key={item.swiss} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="flex items-center gap-1.5 font-semibold text-[var(--fg)]">
                      <Flag code="ch" size={14} /> {item.swiss}
                    </span>
                    <ArrowRight size={12} className="text-[var(--fg-subtle)]" />
                    <span className="flex items-center gap-1.5 text-[var(--fg-muted)]">
                      <Flag code="de" size={14} /> {item.de}
                    </span>
                    <span className="text-[var(--fg-subtle)]">
                      — {item.meaning[lang as keyof typeof item.meaning] ?? item.meaning.en}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mini quiz card */}
            <motion.div
              variants={fadeUp}
              className="flex-1 w-full border-2 border-[var(--fg)] bg-[var(--surface)] p-6"
              style={{ boxShadow: "var(--shadow-editorial)" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                  {d.demo?.exampleQuestion || "Example Question"}
                </span>
                <span className="bg-[var(--accent-muted)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                  1 / 10
                </span>
              </div>
              <div className="mb-6 border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-center">
                <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--fg-muted)] mb-1">
                  <Flag code="ch" size={12} /> Swiss German
                </p>
                <p className="text-3xl font-extrabold font-[family-name:var(--font-display)] text-[var(--fg)]">Grüezi</p>
              </div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                {d.questions.choose}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: d.demo?.options?.hello || "Good day / Hello", correct: true },
                  { text: d.demo?.options?.goodbye || "Goodbye", correct: false },
                  { text: d.demo?.options?.thanks || "Thank you", correct: false },
                  { text: d.demo?.options?.bicycle || "Bicycle", correct: false },
                ].map((opt) => (
                  <motion.button
                    key={opt.text}
                    whileTap={{ scale: 0.97 }}
                    onMouseEnter={playHover}
                    onClick={() => { if (opt.correct) playSuccess(); else playError(); }}
                    className={`border-2 px-3 py-2.5 text-left text-sm font-medium transition-all ${
                      opt.correct
                        ? "border-[var(--success)] bg-[var(--surface)] text-[var(--success)] font-[family-name:var(--font-body)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] hover:border-[var(--fg)] hover:text-[var(--fg)] font-[family-name:var(--font-body)]"
                    }`}
                  >
                    {opt.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <Section>
            <motion.div
              variants={fadeUp}
              className="border-2 border-[var(--fg)] bg-[var(--surface)] p-10 lg:p-16 relative overflow-hidden"
              style={{ boxShadow: "var(--shadow-editorial)" }}
            >
              <div className="relative z-10 grid grid-cols-1 items-center gap-12">
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  <div className="mb-6 flex justify-center lg:justify-start">
                    <SwissCrossMark size={56} rounded={14} />
                  </div>
                  <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl text-[var(--fg)] font-[family-name:var(--font-display)] tracking-tight leading-none">
                    {d.ctaBanner?.title || "Ready to learn Swiss German?"}
                  </h2>
                  <p className="mb-8 text-lg text-[var(--fg-muted)] font-[family-name:var(--font-body)]">
                    {d.ctaBanner?.subtitle || "Join thousands of learners. Sign in with GitHub and start your journey today."}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
                    {session ? (
                      <Link
                        href={`/${lang}/dashboard`}
                        onMouseEnter={playHover}
                        onClick={playClick}
                        className="group inline-flex items-center gap-2 border-2 border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-sm font-bold font-[family-name:var(--font-display)] text-white hover:bg-transparent hover:text-[var(--accent)] transition-colors duration-100"
                      >
                        {d.nav.dashboard}
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    ) : (
                      <Link
                        href={`/${lang}/signin`}
                        onMouseEnter={playHover}
                        onClick={playClick}
                        className="group inline-flex items-center gap-2 border-2 border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-sm font-bold font-[family-name:var(--font-display)] text-white hover:bg-transparent hover:text-[var(--accent)] transition-colors duration-100"
                      >
                        <SiGithub size={18} />
                        {d.signin?.github || "Continue with GitHub"}
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t-2 border-[var(--border)] px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-[family-name:var(--font-body)] text-xs text-[var(--fg-muted)] sm:flex-row">
          <div className="flex items-center gap-2">
            <SwissCrossMark size={24} rounded={6} />
            <span className="font-semibold text-[var(--fg)]">SwissLearn</span>
            <span>—</span>
            <span>{d.footer.tagline}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Flag code="gb" size={14} />
              <Flag code="br" size={14} />
              <Flag code="de" size={14} />
            </div>
            <p>© {new Date().getFullYear()} {d.footer.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
