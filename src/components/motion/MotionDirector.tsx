"use client";

import { useEffect } from "react";
import { inView, startMotion, type Kit } from "@/lib/motion";

/**
 * Mounted last on the page. Starts the deferred motion queue (see lib/motion)
 * and, once every section has created its pins, adds the shared reveals so
 * they are measured against the final, pin-spaced layout:
 *
 *  [data-lines]       heading line-mask reveal (each line rises into place)
 *  [data-reveal]      fade-up, 24px, 0.6s, once
 *  [data-wave]        ink band's wave edge flattens as the band scrolls in
 *
 * Anything already on screen when motion starts is left as it is.
 */
/**
 * Line-mask reveal without a split-text plugin: every word gets its own clipped
 * box and slides up out of it; words on the same line share a delay, so it
 * reads as lines rising. Nested markup (the red <em>) is kept. Returns a revert.
 */
function maskWords(el: HTMLElement) {
  const original = el.innerHTML;
  const words: HTMLElement[] = [];
  const walk = (node: Node) => {
    for (const n of [...node.childNodes]) {
      if (n.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const part of (n.textContent ?? "").split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.append(part);
            continue;
          }
          const box = document.createElement("span");
          box.className = "lm";
          const word = document.createElement("span");
          word.textContent = part;
          box.append(word);
          frag.append(box);
          words.push(word);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === Node.ELEMENT_NODE) walk(n);
    }
  };
  walk(el);
  // one layout read per heading, at setup time (never on scroll)
  const tops = words.map((w) => (w.parentElement as HTMLElement).offsetTop);
  const lineOf: number[] = [];
  tops.forEach((t, i) => lineOf.push(i === 0 ? 0 : lineOf[i - 1] + (t > tops[i - 1] + 4 ? 1 : 0)));
  return { words, lineOf, revert: () => (el.innerHTML = original) };
}

/**
 * Phones only. Makes the long scroll feel like turning logbook pages:
 * every section sinks and fades behind the next one as it slides up, and each
 * section's centrepiece gets its own entrance. Transform/opacity only, no pins.
 */
function phoneScenes({ gsap, layerWhileActive }: Kit) {
  const once = (trigger: gsap.DOMTarget, start = "top 82%") => ({ trigger, start, once: true });
  const $ = (sel: string) => gsap.utils.toArray<HTMLElement>(sel);

  // 1. Chapter turn: the current section sinks (lags 30% of a screen) and fades as the next covers it.
  const secs = $("main > section");
  secs.forEach((sec, i) => {
    const next = secs[i + 1];
    if (i === 0 || !next || next.id === "crew") return; // hero has its own dive; crew continues the rules page
    const wraps = $(`#${sec.id} > .wrap`);
    gsap.fromTo(
      wraps,
      { y: 0, opacity: 1 },
      {
        y: () => Math.round(innerHeight * 0.3),
        opacity: 0.25,
        ease: "power1.in",
        immediateRender: false,
        force3D: true,
        scrollTrigger: {
          trigger: next,
          start: "top bottom",
          end: "top 15%",
          scrub: true,
          invalidateOnRefresh: true,
          onToggle: layerWhileActive(wraps),
        },
      },
    );
  });

  // 2. 01.11: the day and month slide in from opposite sides, the red dot pops.
  gsap
    .timeline({ scrollTrigger: once(".fd-date", "top 88%") })
    .from(".fd-date .fa", { x: -70, opacity: 0, duration: 0.8, ease: "power3.out" }, 0)
    .from(".fd-date .fb", { x: 70, opacity: 0, duration: 0.8, ease: "power3.out" }, 0)
    .from(".fd-date em", { scale: 0, duration: 0.5, ease: "back.out(3)" }, 0.45);

  // 3. Fig. 01: the shark swims in as you scroll.
  gsap.fromTo(
    ".specimen",
    { x: "-38%", rotation: -6 },
    { x: 0, rotation: 0, ease: "power2.out", scrollTrigger: { trigger: ".specimen", start: "top bottom", end: "top 45%", scrub: true } },
  );

  // 4. The pressure gauge turns and settles into place.
  gsap.from(".gauge", { rotation: -28, scale: 0.8, opacity: 0, duration: 1, ease: "back.out(1.6)", scrollTrigger: once(".gauge") });

  // 5. Sealed files drop in tilted and settle; the stamps slam down.
  $(".file").forEach((f, i) =>
    gsap.from(f, { y: 90, rotation: i % 2 ? 10 : -10, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: once(f, "top 90%") }),
  );
  $(".file .stamp").forEach((st) =>
    gsap.from(st, { scale: 2.6, opacity: 0, duration: 0.42, ease: "power4.in", delay: 0.55, scrollTrigger: once(st, "top 80%") }),
  );

  // 6. Countdown boxes pop up one by one; the steps slide in.
  gsap.from("#register .cd > div", { y: 40, scale: 0.85, opacity: 0, duration: 0.7, ease: "back.out(1.8)", stagger: 0.1, scrollTrigger: once("#register .cd", "top 88%") });
  gsap.from("#register .steps li", { x: -40, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.15, scrollTrigger: once("#register .steps", "top 88%") });

  // 7. Rules and questions cascade in.
  gsap.from("#rules [role=tabpanel]:not([hidden]) .ruled li", { x: -24, opacity: 0, duration: 0.6, stagger: 0.07, ease: "power2.out", scrollTrigger: once("#rules .ruled", "top 88%") });
  gsap.from("#rules .faq details", { y: 24, opacity: 0, duration: 0.6, stagger: 0.07, ease: "power2.out", scrollTrigger: once("#rules .faq details", "top 92%") });

  // 8. Crew cards slide in from alternating sides.
  $(".crew .card").forEach((c, i) =>
    gsap.from(c, { x: i % 2 ? 48 : -48, rotation: i % 2 ? 3 : -3, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: once(c, "top 90%") }),
  );

  // 9. "Sink" and "Swim." close in from opposite sides, "or" spins into place.
  // (Sideways, so nothing crosses the label above or the buttons below.)
  const endST = { trigger: ".end h2", start: "top bottom", end: "center 55%", scrub: true };
  gsap.fromTo(".end h2 .sk", { x: -90, opacity: 0.2 }, { x: 0, opacity: 1, ease: "none", scrollTrigger: endST });
  gsap.fromTo(".end h2 .sw", { x: 90, opacity: 0.2 }, { x: 0, opacity: 1, ease: "none", scrollTrigger: endST });
  gsap.fromTo(".end h2 em", { scale: 0.4, rotation: -25 }, { scale: 1, rotation: 0, ease: "none", scrollTrigger: endST });
}

function sharedReveals(kit: Kit) {
  const { gsap, ScrollTrigger } = kit;
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

  // Heading line-rise and the ink bands' wave edge: on every screen size.
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const reverts: (() => void)[] = [];
    below("[data-lines]").forEach((el) => {
      const { words, lineOf, revert } = maskWords(el);
      reverts.push(revert);
      gsap.from(words, {
        yPercent: 110,
        duration: 0.9,
        ease: "power3.out",
        stagger: (i) => lineOf[i] * 0.08,
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
      });
    });
    gsap.utils.toArray<HTMLElement>("[data-wave]").forEach((w) => {
      gsap.fromTo(
        w,
        { scaleY: 1 },
        { scaleY: 0, ease: "none", scrollTrigger: { trigger: w.parentElement, start: "top bottom", end: "top 20%", scrub: true } },
      );
    });
    return () => reverts.forEach((r) => r());
  });

  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => fadeUp(below("[data-reveal]")));
  // Phones: generic fade-ups, except where a section has its own phone scene.
  mm.add("(max-width: 767.98px) and (prefers-reduced-motion: no-preference)", () => {
    fadeUp(below("[data-reveal]:not([data-own-lite])"));
    phoneScenes(kit);
  });

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
