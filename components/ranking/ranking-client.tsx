"use client";

import { motion } from "framer-motion";
import AppShell from "@/components/ui/app-shell";
import RankingSection from "./ranking-section";

type RankingEntry = {
  userId: string;
  name: string | null;
  image: string | null;
  lessonsCount: number;
};

type Props = {
  dict: any;
  lang: string;
  currentUserId: string | undefined;
  initialRanking: RankingEntry[];
};

export default function RankingClient({ dict, lang, currentUserId, initialRanking }: Props) {
  const d = dict.dashboard;

  return (
    <AppShell lang={lang} dict={dict}>
      <main className="flex-1 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-2 text-2xl font-extrabold text-[var(--fg)] sm:text-3xl">{d.ranking}</h1>
            <p className="mx-auto max-w-lg text-sm text-[var(--fg-muted)]">{d.rankingSubtitle}</p>
          </motion.div>

          <RankingSection dict={dict} currentUserId={currentUserId} initialRanking={initialRanking} />
        </div>
      </main>
    </AppShell>
  );
}
