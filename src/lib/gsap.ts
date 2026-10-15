"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Loaded on demand by lib/motion (never in the first-load bundle); registered once.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });
  // Mobile address-bar show/hide changes innerHeight; don't refresh pins for that.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/**
 * Pin with transforms when Lenis drives a mouse/trackpad scroll: entering and
 * leaving a pin then costs a transform instead of a full-page layout.
 * Touch devices scroll natively, where transform pins would lag, so they keep
 * fixed pinning.
 */
export const pinType = (): "transform" | "fixed" => (ScrollTrigger.isTouch === 1 ? "fixed" : "transform");

/**
 * will-change only while a pinned scrub is active: the scaled layers keep one
 * raster instead of being re-rasterised at every scale step, and the hint is
 * dropped as soon as the pin is left.
 */
export const layerWhileActive = (targets: gsap.TweenTarget) => (self: ScrollTrigger) =>
  gsap.set(targets, { willChange: self.isActive ? "transform, opacity" : "auto" });

export { gsap, ScrollTrigger };
