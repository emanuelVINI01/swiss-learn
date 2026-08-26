"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { MessageCircle, Globe2, Sparkles, CheckCircle2 } from "lucide-react";
import { Flag } from "@/components/ui/flag";

export function FloatingHeroCards() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const rotateX = useTransform(mouseY, [-500, 500], [5, -5]);
  const rotateY = useTransform(mouseX, [-500, 500], [-5, 5]);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-7xl h-[600px] hidden md:block"
      >
        {/* Card 1: Chat translation */}
        <motion.div
          initial={{ opacity: 0, y: 50, z: -100 }}
          animate={{ opacity: 0.8, y: 0, z: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="absolute -left-32 lg:-left-20 xl:-left-10 top-[10%] lg:top-[15%] w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5 shadow-2xl backdrop-blur-md"
          style={{ transform: "translateZ(80px) rotate(-10deg)" }}
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-muted)]">
              <MessageCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--fg-muted)]">Swiss German</p>
              <p className="font-bold text-[var(--fg)]">Wie gaats dir?</p>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--bg-secondary)]">
            <motion.div
              className="h-full rounded-full bg-[var(--accent)]"
              initial={{ width: "0%" }}
              animate={{ width: "75%" }}
              transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Card 2: Grammar/Correct */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, z: -50 }}
          animate={{ opacity: 0.9, scale: 1, z: 50 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          className="absolute -right-32 lg:-right-10 xl:right-0 top-[5%] lg:top-[10%] flex items-center gap-3 rounded-2xl border border-[var(--success-muted)] bg-[var(--success)]/10 p-4 shadow-xl backdrop-blur-md"
          style={{ transform: "translateZ(120px) rotate(15deg)" }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--success)] text-white shadow-lg shadow-[var(--success-muted)]">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--success)]">+15 XP</p>
            <p className="text-xs font-medium text-[var(--fg-muted)]">Perfect Streak!</p>
          </div>
        </motion.div>

        {/* Card 3: Floating Flag/Language */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ duration: 1, delay: 0.6, type: "spring" }}
          className="absolute -left-28 lg:-left-10 xl:left-0 bottom-[5%] lg:bottom-[10%] w-56 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)]/80 to-[var(--bg)]/80 p-4 shadow-2xl backdrop-blur-md"
          style={{ transform: "translateZ(150px) rotate(-15deg)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden shadow-md">
                <Flag code="ch" size={32} />
              </div>
              <p className="font-bold text-[var(--fg)]">Vocabulary</p>
            </div>
            <Sparkles size={16} className="text-[var(--accent)]" />
          </div>
        </motion.div>

        {/* Card 4: Progress Graph / Abstract */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
          className="absolute -right-36 lg:-right-20 xl:-right-5 bottom-[10%] lg:bottom-[15%] flex h-28 w-28 items-center justify-center rounded-3xl border border-[var(--accent-muted)] bg-gradient-to-tr from-[var(--accent)] to-[var(--swiss-red)] shadow-2xl shadow-[var(--accent-muted)]"
          style={{ transform: "translateZ(200px) rotate(22deg)" }}
        >
          <Globe2 size={40} className="text-white opacity-90" />
        </motion.div>

        {/* Floating gradient orbs for depth */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[20%] top-[40%] h-40 w-40 rounded-full bg-[var(--accent)] opacity-[0.15] blur-3xl"
          style={{ transform: "translateZ(-100px)" }}
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[20%] bottom-[20%] h-48 w-48 rounded-full bg-[var(--swiss-red)] opacity-[0.1] blur-3xl"
          style={{ transform: "translateZ(-150px)" }}
        />
      </motion.div>
    </div>
  );
}
