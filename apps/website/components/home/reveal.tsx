"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Orchestrated entrance for home sections. Springs stay critically damped
 * (bounce 0) so motion settles without overshoot; reduced-motion users get a
 * short opacity cross-fade instead of travel.
 */
export function Reveal({ children, className, delay = 0, immediate = false }: { readonly children: ReactNode; readonly className?: string; readonly delay?: number; readonly immediate?: boolean }) {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 };
  const settle = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  const transition = { type: "spring" as const, bounce: 0, duration: 0.6, delay };
  if (immediate) return <motion.div className={className} initial={initial} animate={settle} transition={transition}>{children}</motion.div>;
  return <motion.div className={className} initial={initial} whileInView={settle} viewport={{ once: true, margin: "-12% 0px" }} transition={transition}>{children}</motion.div>;
}
