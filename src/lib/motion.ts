export const motionTokens = {
  duration: {
    instant: 0,
    fast: 0.16,
    base: 0.24,
    slow: 0.38,
    themeToggle: 0.72,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1] as const,
    emphasized: [0.34, 1.56, 0.64, 1] as const,
  },
  spring: {
    soft: {
      type: "spring" as const,
      stiffness: 280,
      damping: 26,
      mass: 0.9,
    },
  },
};

export function getMotionDurationCssVar(duration: keyof typeof motionTokens.duration) {
  return `var(--motion-duration-${duration})`;
}
