"use client";

import { useRef } from "react";
import { event, registerLink } from "@/content/event";
import { MQ } from "@/lib/mq";
import { useMotion } from "@/lib/motion";
import { useNow, ms } from "@/lib/time";
import { config } from "@/content/event";

/** Offset of `el` from the top of `ancestor`, ignoring transforms. */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== ancestor) {
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return y;
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const now = useNow();

  let status = event.heroStatus.open;
  if (now !== null) {
    if (now > ms(event.rangeEnd) + 86_400_000) status = event.heroStatus.complete;
    else if (now > ms(config.round1Deadline)) status = event.heroStatus.round1Closed;
  }

  useMotion(
    ({ gsap, ScrollTrigger, pinType, layerWhileActive }) => {
      const hero = root.current!;
      const q = gsap.utils.selector(hero);
      const scaler = q(".porthole-scaler")[0] as HTMLElement;
      const mm = gsap.matchMedia();

      // Desktop / tablet: pin and dive through the glass.
      mm.add(MQ.full, () => {
        const tall = () => hero.offsetHeight > innerHeight;
        // Where the porthole's centre sits inside the hero (layout px, no transforms).
        const centre = () => offsetWithin(scaler, hero) + scaler.offsetHeight / 2;
        // Hero top in viewport coordinates while pinned.
        const pinnedTop = () => (tall() ? innerHeight - hero.offsetHeight : 0);
        const dy = () => innerHeight / 2 - (pinnedTop() + centre());
        // Scale so the glass covers the whole viewport (at least 2.6x).
        const cover = () => {
          const r = scaler.offsetWidth / 2;
          const need = Math.hypot(innerWidth / 2, innerHeight / 2) / r;
          return Math.max(2.6, need * 1.04);
        };

        const tl = gsap.timeline({
          defaults: { ease: "none", force3D: true },
          scrollTrigger: {
            trigger: hero,
            pinType: pinType(),
            start: () => (tall() ? "bottom bottom" : "top top"),
            end: () => `+=${Math.round(innerHeight * 0.8)}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: layerWhileActive([scaler, ...q(".fade-out, .orbit, .p-ring, .rivets, .glass .txt, .hero-water")]),
          },
        });
        tl.to(scaler, { scale: cover, y: dy, ease: "power2.in", duration: 1 }, 0)
          .to(q(".p-ring, .rivets"), { opacity: 0, duration: 0.45 }, 0.1)
          .to(q(".fade-out"), { opacity: 0, y: -40, duration: 0.35, stagger: 0.03 }, 0)
          .to(q(".orbit"), { opacity: 0, duration: 0.35 }, 0)
          .to(q(".glass .txt"), { opacity: 0, duration: 0.3 }, 0.45)
          .to(q(".hero-water"), { opacity: 1, duration: 0.12 }, 0.88);
      });

      // Phones: no pin. As the hero scrolls away the porthole swells (max 1.8x, so it
      // never covers the buttons), the ring and title fade, and the water closes in.
      mm.add(MQ.lite, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none", force3D: true },
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
            onToggle: layerWhileActive([scaler, ...q(".p-ring, .rivets, .glass .txt, .orbit, .hero-water")]),
          },
        });
        tl.to(scaler, { scale: 1.8, ease: "power1.in", duration: 1 }, 0)
          .to(q(".p-ring, .rivets"), { opacity: 0, duration: 0.4 }, 0.15)
          .to(q(".glass .txt"), { opacity: 0, y: -20, duration: 0.35 }, 0.3)
          .to(q(".orbit"), { opacity: 0, duration: 0.4 }, 0)
          .to(q(".hero-water"), { opacity: 0.9, duration: 0.25 }, 0.75);
      });

      // Pause the ambient loops (orbits, rays, snow, shark, bulb) once the hero is off screen.
      const idle = ScrollTrigger.create({
        trigger: hero,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => hero.classList.toggle("idle", !self.isActive),
      });

      return () => {
        idle.kill();
        mm.revert();
      };
    },
    root,
  );

  return (
    <section className="hero" id="top" ref={root} aria-labelledby="hero-title">
      <div className="wrap">
        <div className="frame">
          <i className="fade-out" aria-hidden="true" />
          <i className="fade-out" aria-hidden="true" />
          <i className="fade-out" aria-hidden="true" />
          <i className="fade-out" aria-hidden="true" />
          <div className="dates fade-out">
            <div className="rule" />
            <p className="label k">
              <span className="pulse" aria-hidden="true" />
              <span>{status}</span>
            </p>
            <p className="big num">
              {event.heroDates.from} <span aria-hidden="true">—</span>
              <span className="sr-only">to</span> {event.heroDates.to}
            </p>
            <p className="label sub">{event.heroSub}</p>
            <div className="rule" />
          </div>

          <div className="stage">
            <div className="orbit o1" aria-hidden="true">
              <div className="orbit-in">
                <svg viewBox="0 0 1000 1000">
                  <circle className="o" cx="500" cy="500" r="470" />
                  <circle cx="970" cy="500" r="7" fill="#121412" />
                </svg>
              </div>
            </div>
            <div className="orbit o2" aria-hidden="true">
              <div className="orbit-in">
                <svg viewBox="0 0 1000 1000">
                  <circle className="o" cx="500" cy="500" r="480" />
                  <circle cx="500" cy="20" r="5" fill="#D0392C" />
                </svg>
              </div>
            </div>

            <div className="porthole-scaler">
              <div className="porthole">
                <div className="p-ring" aria-hidden="true" />
                <div className="rivets" aria-hidden="true">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="49" fill="none" stroke="#C9A36A" strokeWidth="1.1" strokeDasharray=".01 6.4" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="glass">
                  <div className="rays" aria-hidden="true" />
                  <div className="snow" aria-hidden="true" />
                  <div className="snow s2" aria-hidden="true" />
                  <div className="swim" aria-hidden="true">
                    <svg viewBox="0 0 600 230">
                      <use href="#shk" fill="#030809" />
                      <use href="#shk" fill="none" stroke="rgba(143,230,214,.35)" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="bulb" aria-hidden="true">
                    <svg viewBox="-40 -40 80 90">
                      <use href="#bulbG" />
                    </svg>
                  </div>
                  <div className="txt">
                    <p className="label">{event.organiser} presents</p>
                    <h1 id="hero-title">
                      Shark Tank<span className="sr-only"> IIITV 2026</span>
                    </h1>
                    <p className="iiitv" aria-hidden="true">
                      <i />
                      <b>IIITV</b>
                      <i />
                    </p>
                    <p className="label ed">
                      {event.year} · {event.edition}
                    </p>
                  </div>
                  <div className="vignette" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

          <div className="hero-cta fade-out">
            <a className="btn btn-ink" href="#logs">
              Begin the descent <span className="ar" aria-hidden="true">→</span>
            </a>
            <a className="btn btn-line" {...registerLink}>
              Register your team
            </a>
          </div>
          <p className="hero-note label fade-out">{event.heroNote}</p>
        </div>
      </div>
      <div className="hero-water" aria-hidden="true" />
    </section>
  );
}
