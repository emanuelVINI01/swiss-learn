"use client";

import { useState } from "react";
import { playClick } from "@/lib/audio";

export type RankingEntry = {
  userId: string;
  name: string | null;
  image: string | null;
  lessonsCount: number;
};

export type RankingPeriod = "day" | "week" | "month";

export function useRankingBoard(initialRanking: RankingEntry[]) {
  const [period, setPeriod] = useState<RankingPeriod>("week");
  const [ranking, setRanking] = useState<RankingEntry[]>(initialRanking);
  const [loading, setLoading] = useState(false);

  async function changePeriod(next: RankingPeriod) {
    playClick();
    setPeriod(next);
    setLoading(true);
    const res = await fetch(`/api/ranking?period=${next}`);
    if (res.ok) {
      const data = await res.json();
      setRanking(data.ranking ?? []);
    }
    setLoading(false);
  }

  return { period, ranking, loading, changePeriod };
}
