"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type Lenis from "lenis";
import { loadKit } from "@/lib/motion";

type Scroller = {
  /** Smooth-scroll to an element or selector (falls back to native scrolling). */
  scrollTo: (target: string | HTMLElement) => void;
  lock: (locked: boolean) => void;
};

const Ctx = createContext<Scroller>({ scrollTo: () => {}, lock: () => {} });
export const useScroller = () => useContext(Ctx);

/**
 * Lenis drives the page scroll from GSAP's ticker, and every Lenis scroll
 * updates ScrollTrigger. No other code listens to `scroll`.
 * Lenis is skipped entirely for prefers-reduced-motion (native scrolling).
 * Both are loaded after first paint, so they never sit on the critical path.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [api] = useState<Scroller>(() => ({
    scrollTo: (target) => {
      const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      if (!el) return;
      if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: 0 });
      else el.scrollIntoView({ behavior: "auto", block: "start" });
    },
    lock: (locked) => {
      const l = lenisRef.current;
      if (l) (locked ? l.stop() : l.start());
      document.documentElement.style.overflow = locked ? "hidden" : "";
    },
  }));

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let teardown: (() => void) | undefined;
    let gone = false;
    Promise.all([import("lenis"), loadKit()]).then(([{ default: LenisCtor }, { gsap, ScrollTrigger }]) => {
      if (gone) return;
      const lenis = new LenisCtor({ lerp: 0.12, anchors: true, autoRaf: false });
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      teardown = () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
        lenisRef.current = null;
      };
    });
    return () => {
      gone = true;
      teardown?.();
    };
  }, []);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
