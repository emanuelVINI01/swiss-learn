"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, BookOpen, Trophy } from "lucide-react";
import { playHover, playClick } from "@/lib/audio";

type NavDict = {
  dashboard: string;
  questions: string;
  ranking: string;
};

type Props = {
  lang: string;
  nav: NavDict;
};

export default function BottomNav({ lang, nav }: Props) {
  const pathname = usePathname();

  const items = [
    { href: `/${lang}/dashboard`, label: nav.dashboard, icon: LayoutDashboard },
    { href: `/${lang}/questions`, label: nav.questions, icon: BookOpen },
    { href: `/${lang}/ranking`, label: nav.ranking, icon: Trophy },
  ];

  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={playHover}
              onClick={playClick}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors"
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-[var(--accent)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={20} className={active ? "text-[var(--accent)]" : "text-[var(--fg-muted)]"} />
              <span className={active ? "text-[var(--accent)]" : "text-[var(--fg-muted)]"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
