"use client";

import { useRef } from "react";
import { event, fieldDay } from "@/content/event";
import { useMotion } from "@/lib/motion";
import { Wave } from "../Wave";
import { PitchClock } from "./PitchClock";

export function FieldDay() {
  const root = useRef<HTMLElement>(null);

  useMotion(
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".row", root.current).forEach((row) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 90%", once: true } });
          tl.from(row.querySelector(".rule-line"), { scaleX: 0, duration: 1.1, ease: "power3.out" }, 0).from(
            row.querySelectorAll(":scope > :not(.rule-line)"),
            { opacity: 0, y: 14, duration: 0.7, stagger: 0.08, ease: "power3.out" },
            0.05,
          );
        });
      });
      return () => mm.revert();
    },
    root,
  );

  return (
    <section className="sec ink dots" id="fieldday" ref={root} aria-labelledby="fieldday-title">
      <Wave fill="var(--ink)" />
      <div className="wrap">
        <p className="label kicker" style={{ color: "var(--d4-on-ink)" }}>
          {fieldDay.kicker}
        </p>
        <div className="fd-top">
          <h2 className="fd-date num" id="fieldday-title" aria-label={`${event.finaleDay.label}, Grand Finale`} data-reveal>
            {event.finaleDay.day}
            <em>.</em>
            {event.finaleDay.month}
          </h2>
          <p className="fd-where label" data-reveal>
            <b>{fieldDay.where}</b>
            {fieldDay.whereSub}
          </p>
        </div>
        <div className="runsheet" role="table" aria-label="Grand Finale run of show">
          {fieldDay.schedule.map((r) => (
            <div className={`row ${r.kind}`} role="row" key={r.time}>
              <span className="t mono num" role="cell">
                {r.time}
              </span>
              <div role="cell">
                <h3>{r.title}</h3>
                <p>{r.detail}</p>
              </div>
              <span className="loc label" role="cell">
                {r.place === "—" ? <span aria-label="No room">—</span> : r.place}
              </span>
              <span className="rule-line" aria-hidden="true" />
            </div>
          ))}
        </div>
        <PitchClock />
      </div>
    </section>
  );
}
