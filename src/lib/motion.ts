"use client";

import { useEffect, useRef, type RefObject } from "react";
/** The GSAP kit, loaded with a dynamic import once the page is idle. */
export type Kit = typeof import("./gsap");

let kitPromise: Promise<Kit> | null = null;
let kit: Kit | null = null;
export const loadKit = () => (kitPromise ??= import("./gsap").then((k) => (kit = k)));

/** Re-measure every trigger (e.g. after content changes height). No-op before motion loads. */
export const refreshMotion = () => kit?.ScrollTrigger.refresh();

/**
 * Motion setup is kept off the critical path.
 *
 * Sections register their GSAP/ScrollTrigger setup with `useMotion`. Nothing
 * runs during hydration: once the page has painted and the browser is idle,
 * `startMotion` runs each setup in its own task (yielding in between, so there
 * is no long task) in DOM order, then measures the page once. Pins are created
 * before the reveals below them, so every trigger sees the final layout.
 */

type Cleanup = void | (() => void);
type Job = {
  setup: (kit: Kit) => Cleanup;
  scope?: RefObject<Element | null>;
  ctx?: { revert: () => void };
  cleanup?: Cleanup;
  dead?: boolean;
};

const queue: Job[] = [];
let phase: "idle" | "running" | "done" = "idle";

const yieldToMain = () =>
  new Promise<void>((resolve) => {
    const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (s?.yield) s.yield().then(resolve);
    else setTimeout(resolve, 0);
  });

const afterPaintAndIdle = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() =>
      setTimeout(() => {
        if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout: 1500 });
        else setTimeout(resolve, 200);
      }, 0),
    );
  });

function run(job: Job) {
  if (job.dead || job.ctx || !kit) return;
  const k = kit;
  job.ctx = k.gsap.context(() => {
    job.cleanup = job.setup(k);
  }, job.scope?.current ?? undefined);
}

function dispose(job: Job) {
  job.dead = true;
  if (typeof job.cleanup === "function") job.cleanup();
  job.ctx?.revert();
  const i = queue.indexOf(job);
  if (i >= 0) queue.splice(i, 1);
}

/** Register a section's motion. `setup` may return a cleanup function. */
export function useMotion(setup: (kit: Kit) => Cleanup, scope?: RefObject<Element | null>) {
  const ref = useRef(setup);
  ref.current = setup;
  useEffect(() => {
    const job: Job = { setup: (k) => ref.current(k), scope };
    queue.push(job);
    if (phase === "done") {
      run(job);
      refreshMotion();
    }
    return () => dispose(job);
  }, [scope]);
}

/** Called once, by the last component on the page. */
export async function startMotion(finalise: (kit: Kit) => Cleanup): Promise<() => void> {
  let final: Cleanup;
  let cancelled = false;
  if (phase === "idle") {
    phase = "running";
    await document.fonts?.ready;
    await afterPaintAndIdle();
    const k = await loadKit();
    for (const job of [...queue]) {
      if (cancelled) break;
      run(job);
      await yieldToMain();
    }
    final = finalise(k);
    k.ScrollTrigger.sort();
    k.ScrollTrigger.refresh();
    phase = "done";
  }
  return () => {
    cancelled = true;
    if (typeof final === "function") final();
  };
}

/** True when an element is already on screen (used to avoid hiding visible content late). */
export const inView = (el: Element, ratio = 0.9) => el.getBoundingClientRect().top < innerHeight * ratio;
