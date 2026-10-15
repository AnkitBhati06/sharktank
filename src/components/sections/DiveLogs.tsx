"use client";

import { useRef, useState } from "react";
import { diveLogsIntro, dives, type Dive } from "@/content/event";
import { Rich } from "@/lib/rich";
import { diveStatus, useNow } from "@/lib/time";
import { MQ } from "@/lib/mq";
import { refreshMotion, useMotion } from "@/lib/motion";
import { DivePlate } from "../svg/Plates";
import { Wave } from "../Wave";

function DiveCard({ dive, now }: { dive: Dive; now: number | null }) {
  const [open, setOpen] = useState(false);
  const status = now === null ? null : diveStatus(dive, now);
  const rulesId = `dive-${dive.id}-rules`;

  const toggle = () => {
    setOpen((o) => !o);
    // Height changes move everything below: re-measure once the expand settles.
    window.setTimeout(refreshMotion, 650);
  };

  return (
    <article className={`log l${dive.id}${open ? " open" : ""}`} aria-labelledby={`dive-${dive.id}-title`}>
      <div className="copy" {...(open ? { "data-lenis-prevent": "" } : {})}>
        <div className="top-row">
          <span className="n num" aria-hidden="true">
            {dive.number}
          </span>
          <span className="label">Dive {dive.number}</span>
        </div>
        <p className="label meta">{dive.meta}</p>
        <h3 id={`dive-${dive.id}-title`}>{dive.title}</h3>
        <p className="line">{dive.hook}</p>
        <div className="facts label">
          <span>
            {dive.windowLabel} <b className="num">{dive.windowText}</b>
          </span>
          <span className="chip" data-s={status?.state ?? "upcoming"} aria-live="off">
            {status?.text ?? "Upcoming"}
          </span>
        </div>
        <dl className="spec">
          <div>
            <dt>Depth</dt>
            <dd className="num">{dive.depthText}</dd>
          </div>
          <div>
            <dt>Window</dt>
            <dd>{dive.windowLength}</dd>
          </div>
          <div>
            <dt>Format</dt>
            <dd>{dive.format}</dd>
          </div>
        </dl>
        <div className="more" id={rulesId} inert={!open}>
          <div>
            <ul aria-label={`${dive.title} rules`}>
              {dive.rules.map((r) => (
                <li key={r}>
                  <span>
                    <Rich text={r} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button className="btn btn-paper" type="button" aria-expanded={open} aria-controls={rulesId} onClick={toggle}>
          {open ? "Close the log" : "Open the log"} <span className="ar" aria-hidden="true">→</span>
        </button>
      </div>
      <div className="plate" aria-hidden="true">
        <div className="plate-in">
          <DivePlate id={dive.id} />
        </div>
      </div>
      <div className="shade" aria-hidden="true" />
    </article>
  );
}

export function DiveLogs() {
  const root = useRef<HTMLElement>(null);
  const now = useNow();

  useMotion(
    ({ gsap, pinType, layerWhileActive }) => {
      const box = root.current!.querySelector<HTMLElement>(".logs")!;
      const cards = gsap.utils.toArray<HTMLElement>(".log", box);
      const mm = gsap.matchMedia();

      // Desktop: pin the stack; each card slides up over the last, which recedes.
      mm.add(MQ.stack, () => {
        box.classList.add("is-stacked");
        const shades = cards.map((c) => c.querySelector(".shade"));
        const plates = cards.map((c) => c.querySelector(".plate-in"));
        gsap.set(cards.slice(1), { yPercent: 102 });

        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 1, force3D: true },
          scrollTrigger: {
            trigger: box,
            pinType: pinType(),
            // 72px header + 28px air
            start: "top 100px",
            end: () => `+=${Math.round(innerHeight * 0.85 * (cards.length - 1))}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: layerWhileActive([...cards, ...shades, ...plates]),
          },
        });
        cards.forEach((card, i) => {
          // plate parallax across the stretch where this card is on top
          tl.fromTo(plates[i], { y: i === 0 ? 0 : 30 }, { y: -30, duration: i === 0 ? 1 : 2 }, Math.max(0, i - 1));
          if (i === 0) return;
          tl.to(card, { yPercent: 0 }, i - 1)
            .to(cards[i - 1], { scale: 0.94 }, i - 1)
            .to(shades[i - 1], { opacity: 0.5 }, i - 1);
        });

        // Keyboard: focusing a covered card scrolls to where that card is on top.
        const st = tl.scrollTrigger!;
        const onFocus = (e: FocusEvent) => {
          const i = cards.findIndex((c) => c.contains(e.target as Node));
          if (i < 0) return;
          const y = st.start + (st.end - st.start) * (i / (cards.length - 1));
          if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, Math.round(y));
        };
        box.addEventListener("focusin", onFocus);

        return () => {
          box.removeEventListener("focusin", onFocus);
          box.classList.remove("is-stacked");
        };
      });

      // Everything else: plain list, cards fade up once.
      mm.add("(max-width: 1023.98px) and (prefers-reduced-motion: no-preference), (max-height: 699.98px) and (prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card) =>
          gsap.from(card, {
            opacity: 0,
            y: 24,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 90%", once: true },
          }),
        );
      });

      return () => mm.revert();
    },
    root,
  );

  return (
    <section className="sec ink dots" id="logs" ref={root} aria-labelledby="logs-title">
      <Wave fill="var(--ink)" />
      <div className="wrap">
        <p className="label kicker" style={{ color: "var(--on-ink-muted)" }}>
          {diveLogsIntro.kicker}
        </p>
        <h2 className="h2" id="logs-title" data-lines>
          {diveLogsIntro.heading}
        </h2>
        <p className="lead" data-reveal>
          {diveLogsIntro.lead}
        </p>
        <div className="logs">
          {dives.map((d) => (
            <DiveCard key={d.id} dive={d} now={now} />
          ))}
        </div>
      </div>
    </section>
  );
}
