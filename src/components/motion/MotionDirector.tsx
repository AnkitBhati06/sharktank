"use client";

import { useEffect } from "react";
import { MQ } from "@/lib/mq";
import { inView, startMotion, type Kit } from "@/lib/motion";

/**
 * Mounted last on the page. Starts the deferred motion queue (see lib/motion)
 * and, once every section has created its pins, adds the shared reveals so
 * they are measured against the final, pin-spaced layout:
 *
 *  [data-lines]       heading line-mask reveal (desktop/tablet); fade-up on phones
 *  [data-reveal]      fade-up, 24px, 0.6s, once
 *  [data-reveal-lite] fade-up on phones only (desktop has its own scrub)
 *  [data-wave]        ink band's wave edge flattens as the band scrolls in
 *
 * Anything already on screen when motion starts is left as it is.
 */
function sharedReveals({ gsap, ScrollTrigger, SplitText }: Kit) {
  const mm = gsap.matchMedia();
  const below = (sel: string) => gsap.utils.toArray<HTMLElement>(sel).filter((el) => !inView(el));
  const fadeUp = (els: HTMLElement[]) => {
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: 24 });
    ScrollTrigger.batch(els, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, overwrite: true }),
    });
  };

  mm.add(MQ.full, () => {
    below("[data-lines]").forEach((el) => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 100,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 80%", once: true },
          }),
      });
    });
    fadeUp(below("[data-reveal]"));
    gsap.utils.toArray<HTMLElement>("[data-wave]").forEach((w) => {
      gsap.fromTo(
        w,
        { scaleY: 1 },
        { scaleY: 0, ease: "none", scrollTrigger: { trigger: w.parentElement, start: "top bottom", end: "top 20%", scrub: true } },
      );
    });
  });

  mm.add(MQ.lite, () => fadeUp(below("[data-reveal], [data-reveal-lite], [data-lines]")));

  return () => mm.revert();
}

export function MotionDirector() {
  useEffect(() => {
    // Below-the-fold font files (mono, serif italic) load once the page is up.
    const late = () => document.documentElement.classList.add("late-fonts");
    if (document.readyState === "complete") setTimeout(late, 0);
    else window.addEventListener("load", () => setTimeout(late, 0), { once: true });

    let stop: (() => void) | undefined;
    let gone = false;
    startMotion(sharedReveals).then((s) => (gone ? s() : (stop = s)));
    return () => {
      gone = true;
      stop?.();
    };
  }, []);
  return null;
}
