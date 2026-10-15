/**
 * Breakpoint conditions shared by every section (no GSAP import, so it stays
 * in the first-load bundle for free).
 * - full:   >= 768px, motion allowed: pinning and scrubbing
 * - lite:   phones, motion allowed: simple fade-ups only
 * - stack:  room for the pinned dive-card stack
 */
export const MQ = {
  full: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  lite: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  stack: "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)",
} as const;
