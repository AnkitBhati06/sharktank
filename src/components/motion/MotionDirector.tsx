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

function sharedReveals({ gsap, ScrollTrigger }: Kit) {
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

  mm.add("(prefers-reduced-motion: no-preference)", () => fadeUp(below("[data-reveal]")));

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
