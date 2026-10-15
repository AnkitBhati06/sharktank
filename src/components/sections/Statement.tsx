"use client";

import { useRef } from "react";
import { statement } from "@/content/event";
import { Rich } from "@/lib/rich";
import { useMotion } from "@/lib/motion";
import { Wave } from "../Wave";

/** Ink at this opacity over paper reads as #BDB7AC, the "wet ink" start colour. */
const DRY = 0.23;

export function Statement() {
  const root = useRef<HTMLElement>(null);
  const words = statement.lead.split(/\s+/);

  useMotion(
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const ws = gsap.utils.toArray<HTMLElement>(".st .w", root.current);
        gsap.fromTo(
          ws,
          { opacity: DRY },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: ".st", start: "top 80%", end: "bottom 40%", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    root,
  );

  return (
    <section className="sec statement" id="statement" ref={root} aria-labelledby="statement-label">
      <Wave fill="var(--paper)" />
      <div className="wrap">
        <h2 className="label kicker" id="statement-label">
          {statement.label}
        </h2>
        <p className="st">
          {words.map((w, i) => (
            <span key={i}>
              <span className="w">{w}</span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
        <hr />
        <p className="body" data-reveal>
          <Rich text={statement.body} />
        </p>
      </div>
    </section>
  );
}
