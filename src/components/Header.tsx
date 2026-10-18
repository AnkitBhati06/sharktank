"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chapters, event, menu, registerLink } from "@/content/event";
import { useMotion } from "@/lib/motion";
import { LogoMark } from "./svg/Logo";
import { useScroller } from "./motion/SmoothScroll";

/** `orgMark` is the organiser logo, rendered on the server (see app/page.tsx). */
export function Header({ orgMark }: { orgMark?: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const noRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const progRef = useRef<HTMLSpanElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { scrollTo, lock } = useScroller();

  useMotion(
    ({ gsap, ScrollTrigger }) => {
      // Page progress: 2px red bar, scaleX scrubbed 0 -> 1.
      gsap.to(progRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: true, refreshPriority: -1 },
      });

      // Live chapter indicator: text rolls up when the chapter changes.
      let current = "";
      const show = (no: string, name: string) => {
        if (no === current || !noRef.current || !nameRef.current) return;
        const first = current === "";
        current = no;
        const el = nameRef.current;
        noRef.current.textContent = no;
        if (first || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          el.textContent = name;
          return;
        }
        gsap.killTweensOf(el);
        gsap.to(el, {
          yPercent: -100,
          duration: 0.22,
          ease: "power2.in",
          onComplete: () => {
            el.textContent = name;
            gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: "power3.out" });
          },
        });
      };
      chapters.forEach((c) => {
        const el = document.getElementById(c.id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 50%",
          end: "bottom 50%",
          refreshPriority: -1,
          onToggle: (self) => self.isActive && show(c.no, c.name),
        });
      });
      show(chapters[0].no, chapters[0].name);
    },
    root,
  );

  const setMenu = useCallback(
    (next: boolean) => {
      const btn = menuBtn.current;
      const p = panel.current;
      if (next && btn && p) {
        // Circle grows from the Menu button to the farthest corner.
        const r = btn.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        p.style.setProperty("--mx", `${x}px`);
        p.style.setProperty("--my", `${y}px`);
        p.style.setProperty("--mr", `${Math.ceil(far) + 2}px`);
      }
      setOpen(next);
      lock(next);
    },
    [lock],
  );

  useEffect(() => {
    if (open) {
      closeBtn.current?.focus({ preventScroll: true });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setMenu(false);
          menuBtn.current?.focus({ preventScroll: true });
        }
        if (e.key === "Tab" && panel.current) {
          const items = panel.current.querySelectorAll<HTMLElement>("a, button");
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open, setMenu]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenu(false);
    menuBtn.current?.focus({ preventScroll: true });
    requestAnimationFrame(() => scrollTo(href));
  };

  return (
    <>
      <header className="top" ref={root}>
        <div className="wrap top-in">
          <a className="mark" href="#top" aria-label={`${event.name} home`}>
            <LogoMark />
            <span>
              <b>
                {event.name.replace(/\s*IIITV$/, "")}
                <span className="x">IIITV</span>
              </b>
              <small>{event.organiserShort}</small>
            </span>
          </a>
          <span className="org">
            {orgMark}
          </span>
          <span className="chap label" aria-hidden="true">
            <b className="num" ref={noRef}>
              {chapters[0].no}
            </b>
            <span>·</span>
            <span className="roll">
              <span ref={nameRef}>{chapters[0].name}</span>
            </span>
          </span>
          <a className="btn btn-ink btn-reg" {...registerLink}>
            Register
          </a>
          <button
            ref={menuBtn}
            className="menu-btn"
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setMenu(!open)}
          >
            Menu
          </button>
        </div>
        <span className="prog" ref={progRef} aria-hidden="true" />
      </header>

      <div
        id="site-menu"
        ref={panel}
        className={`menu${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
      >
        <div className="wrap menu-head">
          <span className="label" style={{ color: "var(--on-ink-muted)" }}>
            Logbook · Index
          </span>
          <button
            ref={closeBtn}
            className="menu-btn"
            type="button"
            onClick={() => {
              setMenu(false);
              menuBtn.current?.focus({ preventScroll: true });
            }}
          >
            Close
          </button>
        </div>
        <nav className="wrap" aria-label="Sections">
          {menu.map((m, i) => (
            <a key={m.href} href={m.href} onClick={(e) => go(e, m.href)}>
              <small className="num">{String(i).padStart(2, "0")}</small>
              {m.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
