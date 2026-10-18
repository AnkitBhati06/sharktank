"use client";

import { registerLink } from "@/content/event";
import { useRef } from "react";
import { useMotion } from "@/lib/motion";

/** Phones only (CSS): shows after the hero, hides while the register section is on screen. */
export function StickyCta() {
  const ref = useRef<HTMLAnchorElement>(null);
  useMotion(({ ScrollTrigger }) => {
    let past = false;
    let atRegister = false;
    const sync = () => ref.current?.classList.toggle("show", past && !atRegister);
    ScrollTrigger.create({
      start: () => innerHeight * 0.7,
      end: "max",
      refreshPriority: -1,
      onToggle: (s) => {
        past = s.isActive;
        sync();
      },
    });
    ScrollTrigger.create({
      trigger: "#register",
      start: "top bottom",
      end: "bottom top",
      refreshPriority: -1,
      onToggle: (s) => {
        atRegister = s.isActive;
        sync();
      },
    });
  });
  return (
    <a ref={ref} className="btn btn-ink sticky-cta" {...registerLink} tabIndex={-1} aria-hidden="true">
      Register your team <span className="ar">→</span>
    </a>
  );
}
