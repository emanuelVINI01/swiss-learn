"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { type Session } from "next-auth";
import {
  BookOpen, ArrowRight, Zap, Star, Users
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import Navbar from "@/components/ui/navbar";
import { SwissCrossMark } from "@/components/ui/logo";
import { Flag } from "@/components/ui/flag";
import { MountainIllustration } from "@/components/landing/mountain-illustration";
import { playHover, playClick, playSuccess, playError } from "@/lib/audio";

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
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
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
      <Navbar lang={lang} nav={d.nav} langDict={d.lang} />

      {/* ─── Hero ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 sm:py-32 overflow-hidden">
        {/* Mountain skyline with vivid colors */}
        <MountainIllustration className="absolute inset-x-0 bottom-0 h-56 w-full sm:h-72 pointer-events-none" />
        
        <div
          aria-hidden
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full opacity-[0.1] blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
        />

        <Section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          
          {/* Left Text */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-muted)] bg-[var(--accent-muted)] px-4 py-1.5 text-sm font-medium text-[var(--accent)]">
                <Zap size={14} />
                {d.hero.badge}
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-6 animate-float">
              <SwissCrossMark size={64} rounded={16} />
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl font-extrabold sm:text-5xl md:text-6xl text-[var(--fg)] leading-tight">
              {d.hero.title}{" "}
              <span className="gradient-text">{d.hero.titleAccent}</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg text-[var(--fg-muted)] sm:text-xl leading-relaxed">
              {d.hero.subtitle}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center lg:items-start gap-3 sm:flex-row">
              {session ? (
                <Link
                  href={`/${lang}/dashboard`}
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className="group flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-bold text-white hover:bg-[var(--accent-hover)] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--accent-muted)]"
                >
                  {d.nav.dashboard}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <>
                  <button
                    onMouseEnter={playHover}
                    onClick={() => { signIn("github"); playClick(); }}
                    className="group flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-bold text-white hover:bg-[var(--accent-hover)] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--accent-muted)]"
                  >
                    <SiGithub size={18} />
                    {d.hero.ctaSignin}
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                  <Link
                    href={`/${lang}/signin`}
                    onMouseEnter={playHover}
                    onClick={playClick}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-base font-semibold text-[var(--fg-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)] transition-all"
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

          {/* Right UnDraw Illustration */}
          <motion.div 
            variants={fadeUp}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md xl:max-w-lg animate-float-slow">
              <img src="/illustrations/hiking.svg" alt="Hiking Swiss Alps" className="w-full h-auto drop-shadow-2xl dark:hidden" />
              <img src="/illustrations/hiking-dark.svg" alt="Hiking Swiss Alps" className="w-full h-auto drop-shadow-2xl hidden dark:block" />
            </div>
          </motion.div>

        </Section>
        
        {/* Stats placed below */}
        <Section className="relative z-10 mx-auto w-full max-w-5xl mt-16 px-4 pb-8">
          <motion.div 
            variants={fadeUp} 
            className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-xl p-8 shadow-2xl shadow-[var(--accent-muted)]/20"
          >
            {[
              { icon: <BookOpen size={24} />, value: "500+", label: d.hero.stats.words },
              { icon: <Star size={24} />, value: "98%", label: d.hero.stats.accuracy },
              { icon: <Users size={24} />, value: "1k+", label: d.hero.stats.learners },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  {stat.icon}
                  <span className="text-3xl font-extrabold text-[var(--fg)]">{stat.value}</span>
                </div>
                <span className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ─── Learning Section ─── */}
      <section className="relative px-4 py-20 sm:py-28 bg-[var(--bg-secondary)] overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-1/2 -left-32 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.06] blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-6xl">
          <Section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <motion.div variants={fadeUp} className="order-2 lg:order-1 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-md xl:max-w-lg animate-float-slow">
                <img src="/illustrations/online-learning.svg" alt="Online Learning" className="w-full h-auto drop-shadow-2xl dark:hidden" />
                <img src="/illustrations/online-learning-dark.svg" alt="Online Learning" className="w-full h-auto drop-shadow-2xl hidden dark:block" />
              </div>
            </motion.div>
            <div className="order-1 lg:order-2 flex flex-col items-center text-center lg:items-start lg:text-left">
              <motion.div variants={fadeUp} className="mb-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-muted)] bg-[var(--accent-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                  {d.learningSection?.badge || "Pace Yourself"}
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="mb-6 text-3xl font-extrabold sm:text-4xl text-[var(--fg)]">
                {d.learningSection?.title || "Learn at your own rhythm"}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[var(--fg-muted)] leading-relaxed">
                {d.learningSection?.description || "Our interactive modules adapt to your learning speed. No rush, no pressure—just consistent progress tailored for your daily routine."}
              </motion.p>
            </div>
          </Section>
        </div>
      </section>

      {/* ─── Progress Section ─── */}
      <section className="relative px-4 py-20 sm:py-28 overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-1/2 -right-32 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[var(--swiss-red)] opacity-[0.06] blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-6xl">
          <Section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <motion.div variants={fadeUp} className="mb-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-muted)] bg-[var(--accent-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                  {d.progressSection?.badge || "Track Success"}
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="mb-6 text-3xl font-extrabold sm:text-4xl text-[var(--fg)]">
                {d.progressSection?.title || "Celebrate your victories"}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[var(--fg-muted)] leading-relaxed">
                {d.progressSection?.description || "Visualize your journey as you master new vocabulary. Every word learned brings you one step closer to fluency and confidence."}
              </motion.p>
            </div>
            <motion.div variants={fadeUp} className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md xl:max-w-lg animate-float-slow">
                <img src="/illustrations/celebrating.svg" alt="Celebrating Success" className="w-full h-auto drop-shadow-2xl dark:hidden" />
                <img src="/illustrations/celebrating-dark.svg" alt="Celebrating Success" className="w-full h-auto drop-shadow-2xl hidden dark:block" />
              </div>
            </motion.div>
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
              className="flex-1 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                  {d.demo?.exampleQuestion || "Example Question"}
                </span>
                <span className="rounded-full bg-[var(--accent-muted)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                  1 / 10
                </span>
              </div>
              <div className="mb-6 rounded-xl bg-[var(--bg-secondary)] p-4 text-center">
                <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--fg-muted)] mb-1">
                  <Flag code="ch" size={12} /> Swiss German
                </p>
                <p className="text-3xl font-extrabold text-[var(--fg)]">Grüezi</p>
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onMouseEnter={playHover}
                    onClick={() => { if (opt.correct) playSuccess(); else playError(); }}
                    className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                      opt.correct
                        ? "border-[var(--success)] bg-[var(--success-muted)] text-[var(--success)]"
                        : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
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
              className="rounded-3xl border border-[var(--accent-muted)] bg-[var(--surface)] p-10 lg:p-16 relative overflow-hidden"
              style={{ boxShadow: `0 20px 80px color-mix(in srgb, var(--accent) 20%, transparent)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/10 via-transparent to-[var(--swiss-red)]/10 pointer-events-none" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent)] blur-[100px] pointer-events-none" 
              />
              
              <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  <div className="mb-6 flex justify-center lg:justify-start">
                    <SwissCrossMark size={56} rounded={14} />
                  </div>
                  <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl text-[var(--fg)]">
                    {d.ctaBanner?.title || "Ready to learn Swiss German?"}
                  </h2>
                  <p className="mb-8 text-lg text-[var(--fg-muted)]">
                    {d.ctaBanner?.subtitle || "Join thousands of learners. Sign in with GitHub and start your journey today."}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
                    {session ? (
                      <Link
                        href={`/${lang}/dashboard`}
                        onMouseEnter={playHover}
                        onClick={playClick}
                        className="group inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-base font-bold text-white hover:bg-[var(--accent-hover)] transition-all hover:scale-[1.02] shadow-lg shadow-[var(--accent-muted)]"
                      >
                        {d.nav.dashboard}
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    ) : (
                      <button
                        onMouseEnter={playHover}
                        onClick={() => { signIn("github"); playClick(); }}
                        className="group inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-base font-bold text-white hover:bg-[var(--accent-hover)] transition-all hover:scale-[1.02] shadow-lg shadow-[var(--accent-muted)]"
                      >
                        <SiGithub size={18} />
                        {d.signin?.github || "Continue with GitHub"}
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    )}
                  </div>
                </div>
                <motion.div variants={fadeUp} className="flex justify-center lg:justify-end">
                  <div className="relative w-full max-w-sm animate-float-slow">
                    <img src="/illustrations/secure-login.svg" alt="Secure Login" className="w-full h-auto drop-shadow-2xl dark:hidden" />
                    <img src="/illustrations/secure-login-dark.svg" alt="Secure Login" className="w-full h-auto drop-shadow-2xl hidden dark:block" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[var(--border)] px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[var(--fg-muted)] sm:flex-row">
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
