"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { event, fieldDay } from "@/content/event";
import { Rich, plain } from "@/lib/rich";
import { useMotion } from "@/lib/motion";
import { pad } from "@/lib/time";

const PITCH = event.pitchSeconds;
const QA = event.qaSeconds;
const TOT = PITCH + QA;
const CX = 200;
const CY = 200;
const R = 150;
const A0 = -135; // 270° sweep
const A1 = 135;
const ang = (s: number) => A0 + (A1 - A0) * (s / TOT);
const pt = (a: number, r: number) => [CX + r * Math.sin((a * Math.PI) / 180), CY - r * Math.cos((a * Math.PI) / 180)];
const f1 = (n: number) => n.toFixed(1);
const arc = (a: number, b: number, r: number) => {
  const [x0, y0] = pt(a, r);
  const [x1, y1] = pt(b, r);
  return `M${f1(x0)} ${f1(y0)} A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${f1(x1)} ${f1(y1)}`;
};

// Static dial geometry (computed once at module load, rendered on the server).
const TICKS = Array.from({ length: TOT / 30 + 1 }, (_, i) => {
  const s = i * 30;
  const a = ang(s);
  const major = s % 60 === 0;
  const [x0, y0] = pt(a, R - 12);
  const [x1, y1] = pt(a, R - (major ? 30 : 22));
  const [lx, ly] = pt(a, R - 48);
  return { s, major, x0, y0, x1, y1, lx, ly, minute: s <= PITCH ? s / 60 : (s - PITCH) / 60 };
});

type Phase = "pitch" | "qa" | "done";
const phaseOf = (e: number): Phase => (e < PITCH ? "pitch" : e < TOT ? "qa" : "done");
const PHASE_TEXT: Record<Phase, string> = { pitch: "Pitch", qa: "Jury Q&A", done: "Time" };
const PHASE_SAY: Record<Phase, string> = {
  pitch: "",
  qa: "Pitch time over. Jury Q and A begins.",
  done: "Time is up.",
};

export function PitchClock() {
  const root = useRef<HTMLDivElement>(null);
  const needle = useRef<SVGGElement>(null);
  const readout = useRef<HTMLElement>(null);
  const elapsed = useRef(0);
  const raf = useRef(0);
  const last = useRef(0);
  const fastRef = useRef(false);
  const phaseRef = useRef<Phase>("pitch");
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("pitch");
  const [say, setSay] = useState("");
  const [fast, setFast] = useState(false);
  fastRef.current = fast;

  const setNeedle = (seconds: number) => {
    if (needle.current) needle.current.style.transform = `rotate(${ang(Math.min(seconds, TOT))}deg)`;
  };

  const render = useCallback(() => {
    const e = Math.min(elapsed.current, TOT);
    setNeedle(e);
    const p = phaseOf(e);
    const left = p === "pitch" ? PITCH - e : p === "qa" ? TOT - e : 0;
    const s = Math.ceil(left);
    if (readout.current) readout.current.textContent = `${Math.floor(s / 60)}:${pad(s % 60)}`;
    if (phaseRef.current !== p) {
      phaseRef.current = p;
      setPhase(p);
      setSay(PHASE_SAY[p]);
    }
    return p;
  }, []);

  // rAF runs only while the clock is running.
  useEffect(() => {
    if (!running) return;
    last.current = performance.now();
    const loop = (t: number) => {
      elapsed.current += ((t - last.current) / 1000) * (fastRef.current ? 10 : 1);
      last.current = t;
      if (render() === "done") {
        setRunning(false);
        return;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [running, render]);

  const startPause = () => {
    if (!running && elapsed.current >= TOT) elapsed.current = 0;
    demoTl.current?.kill();
    setRunning((r) => !r);
  };
  const reset = () => {
    setRunning(false);
    elapsed.current = 0;
    setSay("");
    render();
  };

  // One demo sweep the first time the gauge comes into view.
  const demo = useRef({ s: 0 });
  const demoTl = useRef<{ kill: () => void } | null>(null);
  useMotion(
    ({ gsap, ScrollTrigger }) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 60%",
        once: true,
        onEnter: () => {
          if (elapsed.current > 0) return;
          demo.current.s = 0;
          demoTl.current = gsap
            .timeline({ onUpdate: () => setNeedle(demo.current.s), onComplete: () => elapsed.current === 0 && setNeedle(0) })
            .to(demo.current, { s: TOT, duration: 1.5, ease: "power3.out" })
            .to(demo.current, { s: 0, duration: 1.1, ease: "power2.inOut" });
        },
      });
    },
    root,
  );

  const label = elapsed.current === 0 && !running ? "Start" : running ? "Pause" : phase === "done" ? "Start" : "Resume";

  return (
    <div className="gauge-wrap" ref={root}>
      <div className="gauge" role="group" aria-label="Pitch clock">
        <svg viewBox="0 0 400 400" aria-hidden="true">
          <circle cx="200" cy="200" r="196" fill="#2A2620" />
          <circle cx="200" cy="200" r="186" fill="none" stroke="#B08A4A" strokeWidth="3" />
          <circle cx="200" cy="200" r="176" fill="#F1ECE3" />
          <path d={arc(ang(0), ang(PITCH), R)} fill="none" stroke="#1E8C7C" strokeWidth="12" />
          <path d={arc(ang(PITCH), ang(TOT), R)} fill="none" stroke="#D0392C" strokeWidth="12" />
          <g stroke="#121412">
            {TICKS.map((t) => (
              <line key={t.s} x1={f1(t.x0)} y1={f1(t.y0)} x2={f1(t.x1)} y2={f1(t.y1)} strokeWidth={t.major ? 2.4 : 1.2} />
            ))}
          </g>
          <g fontFamily="var(--f-mono)" fontSize="13" fill="#121412" textAnchor="middle">
            {TICKS.filter((t) => t.major).map((t) => (
              <text key={t.s} x={f1(t.lx)} y={f1(t.ly + 4)} fill={t.s > PITCH ? "#B3301F" : undefined}>
                {t.minute}
              </text>
            ))}
          </g>
          <text x="200" y="168" textAnchor="middle" fontFamily="var(--f-sans)" fontWeight="800" fontSize="11" letterSpacing="3" fill="#5E5B54">
            PITCH PRESSURE
          </text>
          <g className="needle" ref={needle} style={{ transform: `rotate(${A0}deg)` }}>
            <path d="M196 200 L200 50 L204 200 Z" fill="#121412" />
            <circle cx="200" cy="200" r="12" fill="#121412" />
            <circle cx="200" cy="200" r="4" fill="#B08A4A" />
          </g>
        </svg>
        <div className="read">
          <b className="num" ref={readout}>
            {Math.floor(PITCH / 60)}:{pad(PITCH % 60)}
          </b>
          <small className={`label${phase === "pitch" ? "" : " q"}`}>{PHASE_TEXT[phase]}</small>
        </div>
      </div>
      <div>
        <p className="label kicker" style={{ color: "var(--on-ink-muted)" }}>
          {fieldDay.clock.kicker}
        </p>
        <h2 className="h2" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }} data-lines aria-label={plain(fieldDay.clock.heading)}>
          <Rich text={fieldDay.clock.heading} />
        </h2>
        <p className="lead">{fieldDay.clock.lead}</p>
        <div className="gctrl">
          <button className="btn btn-paper" type="button" onClick={startPause}>
            {label} <span className="ar" aria-hidden="true">→</span>
          </button>
          <button className="btn btn-line" type="button" onClick={reset}>
            Reset
          </button>
          <label className="toggle">
            <input type="checkbox" checked={fast} onChange={(e) => setFast(e.target.checked)} /> Fast preview (10×)
          </label>
        </div>
        <p className="sr-only" aria-live="polite">
          {say}
        </p>
      </div>
    </div>
  );
}
