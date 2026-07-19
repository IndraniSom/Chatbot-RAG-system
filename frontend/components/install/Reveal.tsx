"use client";

import { motion, type Variants, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

function useHydratedReducedMotion(): boolean {
  const preferred = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted && preferred;
}

/** Scroll-triggered reveal that becomes a simple fade in reduced-motion mode. */
const makeVariants = (reduceMotion: boolean): Variants => ({
  hidden: { opacity: 0, y: reduceMotion ? 0 : 22 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: reduceMotion ? 0.01 : 0.6,
      delay: reduceMotion ? 0 : delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
});

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "span";
}) {
  const reduceMotion = useHydratedReducedMotion();
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      variants={makeVariants(reduceMotion)}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}

/** Staggered container: children using `RevealItem` cascade in. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: reduceMotion ? 0 : stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.div className={className} variants={makeVariants(reduceMotion)}>
      {children}
    </motion.div>
  );
}
