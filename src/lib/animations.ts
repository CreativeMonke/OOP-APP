import type { Variants } from "framer-motion";

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.99, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    filter: "blur(4px)",
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

export const cardHoverVariants: Variants = {
  rest: { y: 0, boxShadow: "0 4px 16px rgba(99,102,241,0.1)" },
  hover: {
    y: -3,
    boxShadow: "0 12px 32px rgba(99,102,241,0.25)",
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
};

export const quizShakeVariants: Variants = {
  shake: {
    x: [0, -8, 8, -4, 4, 0],
    transition: { duration: 0.4, ease: "easeInOut" },
  },
  idle: { x: 0 },
};

export const quizCorrectVariants: Variants = {
  correct: {
    boxShadow: [
      "0 0 0px rgba(34,197,94,0)",
      "0 0 20px rgba(34,197,94,0.6)",
      "0 0 10px rgba(34,197,94,0.3)",
    ],
    transition: { duration: 0.6, ease: "easeOut" },
  },
  idle: { boxShadow: "0 0 0px rgba(34,197,94,0)" },
};

export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.09, delayChildren: 0.04 },
  },
};

// "Lens focus" reveal — each section rises and sharpens into place
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.985, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 28, mass: 0.9 },
  },
};

export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export const sidebarVariants: Variants = {
  open: {
    width: 240,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  closed: {
    width: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export const checkmarkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.4, ease: "easeOut" }, opacity: { duration: 0.1 } },
  },
};
