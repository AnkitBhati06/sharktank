"use client";

import { useEffect, useRef } from "react";
import { loadKit } from "@/lib/motion";

/** Small red dot that follows a fine pointer and grows over links and buttons. Never on touch. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches || !ref.current) return;
    const el = ref.current;
    document.documentElement.classList.add("has-cur");
    // GSAP arrives after first paint; until then the dot simply stays hidden.
    let xTo: ((v: number) => unknown) | null = null;
    let yTo: ((v: number) => unknown) | null = null;
    let gone = false;
    loadKit().then(({ gsap }) => {
      if (gone) return;
      xTo = gsap.quickTo(el, "x", { duration: 0.25, ease: "power3.out" });
      yTo = gsap.quickTo(el, "y", { duration: 0.25, ease: "power3.out" });
    });
    const move = (e: PointerEvent) => {
      if (!xTo || !yTo) return;
      el.classList.add("on");
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      el.classList.toggle("big", !!t?.closest("a, button, summary, label, [role=tab]"));
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    return () => {
      gone = true;
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.classList.remove("has-cur");
    };
  }, []);
  return (
    <div className="cur" ref={ref} aria-hidden="true">
      <i />
    </div>
  );
}
