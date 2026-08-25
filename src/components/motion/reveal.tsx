"use client";

import type { ComponentProps } from "react";
import { motion, useReducedMotion, type Transition, type Variants } from "framer-motion";

/**
 * The two motion primitives used everywhere on the site: a staggered
 * group and the items inside it. Covers both cases from the brief —
 * `trigger="mount"` for the one orchestrated hero reveal on page load,
 * and the default `trigger="inView"` for scroll-triggered section fades.
 *
 * `prefers-reduced-motion` is respected here once, centrally: children
 * render in their final state immediately, no transition, no stagger.
 */

const EASE: Transition["ease"] = [0.16, 1, 0.3, 1];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

type MotionGroupProps = ComponentProps<typeof motion.div> & {
  trigger?: "mount" | "inView";
  /** Seconds between each child's reveal. */
  stagger?: number;
};

export function MotionGroup({
  trigger = "inView",
  stagger = 0.12,
  children,
  ...props
}: MotionGroupProps) {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : stagger,
        delayChildren: reduceMotion ? 0 : 0.05,
      },
    },
  };

  const triggerProps =
    trigger === "inView"
      ? { whileInView: "show" as const, viewport: { once: true, margin: "-64px" } }
      : { animate: "show" as const };

  return (
    <motion.div
      initial={reduceMotion ? "show" : "hidden"}
      variants={container}
      {...triggerProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  children,
  ...props
}: ComponentProps<typeof motion.div>) {
  return (
    <motion.div variants={itemVariants} {...props}>
      {children}
    </motion.div>
  );
}
