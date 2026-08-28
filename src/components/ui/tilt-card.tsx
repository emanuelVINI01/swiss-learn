"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTilt } from "@/hooks/use-tilt";

export function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, rotateX, rotateY, hovered, handleMouseMove, handleMouseEnter, handleMouseLeave } = useTilt();

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-2xl ${className}`}
    >
      {/* 3D Inner Content */}
      <div
        style={{
          transform: "translateZ(30px)",
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative"
      >
        {children}

        {/* Shine effect */}
        {hovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 60%)`,
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
