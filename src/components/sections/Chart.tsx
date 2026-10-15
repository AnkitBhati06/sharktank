"use client";

import { useRef } from "react";
import { chartCopy, dives, event, specimen } from "@/content/event";
import { Rich, plain } from "@/lib/rich";
import { ms, useNow } from "@/lib/time";
import { MQ } from "@/lib/mq";
import { useMotion } from "@/lib/motion";

/* ---- chart geometry (viewBox 1000 x 380), all derived from event.ts ---- */
const X0 = 60;
const X1 = 980;
const Y0 = 60;
const PX_PER_M = 0.2667;
const DAY = 86_400_000;
const T0 = ms(event.rangeStart);
const T1 = ms(event.rangeEnd);
const x = (t: number) => X0 + ((t - T0) / (T1 - T0)) * (X1 - X0);
const y = (depth: number) => Y0 + depth * PX_PER_M;
const r1 = (n: number) => Math.round(n * 10) / 10;
const COLORS = ["var(--d1)", "var(--d2)", "var(--d3)", "var(--d4)"];

/** Day-start of an ISO time in IST. */
const dayStart = (iso: string) => {
  const t = ms(iso) + 330 * 60_000;
  return t - (t % DAY) - 330 * 60_000;
};

const stations = dives.map((d, i) => {
  const s = dayStart(d.start);
  const e = dayStart(d.end) + DAY; // windows run to the end of their last day
  const multi = e - s > DAY;
  return { d, i, multi, xs: r1(x(s)), xe: r1(x(Math.min(e, T1))), yd: r1(y(d.depth)) };
});

function seabedPath() {
  const [a, b, c, f] = stations;
  const pts: string[] = [`M${X0} ${Y0}`, `L${a.xs} ${a.yd}`, `L${a.xe} ${a.yd}`, `L${b.xs} ${a.yd}`, `L${b.xs} ${b.yd}`, `L${b.xe} ${b.yd}`];
  pts.push(`L${c.xs} ${c.yd}`); // slope down to the trench call
  const shelf = r1(x(T1 - 1 * DAY)); // hold depth until the eve of the finale
  pts.push(`L${shelf} ${c.yd}`, `L${f.xs} ${f.yd}`);
  return pts.join(" ");
}
const SEABED = seabedPath();
const GROUND = `${SEABED.replace(/^M\S+ \S+ /, `M${X0} ${stations[0].yd} `)} L${X1} 360 L${X0} 360 Z`;
const GRID = [0, 300, 600, 900];

export function Chart() {
  const root = useRef<HTMLElement>(null);
  const now = useNow();
  const showToday = now !== null && now >= T0 && now <= T1 + DAY;
  const tx = showToday ? r1(x(Math.min(now!, T1))) : 0;

  useMotion(
    ({ gsap, ScrollTrigger }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.full, () => {
        // The seabed draws itself, then each station pops in.
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: q(".chart")[0], start: "top 85%", end: "bottom 55%", scrub: true },
        });
        tl.fromTo(q(".seabed"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, 0).fromTo(
          q(".ground"),
          { opacity: 0 },
          { opacity: 0.45, duration: 0.35 },
          0.7,
        );
        q(".stn").forEach((g, i) => {
          tl.fromTo(g, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.1 }, [0.1, 0.38, 0.66, 0.9][i]);
        });
      });

      mm.add(MQ.lite, () => {
        gsap.from(q(".ladder .bar"), {
          scaleX: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: q(".ladder")[0], start: "top 85%", once: true },
        });
      });

      // Fig. 01: pins and notes light up A, B, C (a one-off reveal, fine on phones too).
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pins = q(".pin");
        const notes = q(".note");
        gsap.set(pins, { opacity: 0, scale: 0.4 });
        gsap.set(notes, { opacity: 0.28 });
        const tl = gsap.timeline({ scrollTrigger: { trigger: q(".fig")[0], start: "top 60%", once: true } });
        pins.forEach((p, i) => {
          tl.to(p, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, 0.25 + i * 0.7).to(
            notes[i],
            { opacity: 1, duration: 0.6 },
            0.25 + i * 0.7,
          );
        });
      });

      // Specimen pins pulse only while the figure is on screen.
      const fig = q(".fig")[0];
      fig.classList.add("idle");
      ScrollTrigger.create({
        trigger: fig,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => fig.classList.toggle("idle", !self.isActive),
      });

      return () => mm.revert();
    },
    root,
  );

  const chartLabel = `Expedition chart: ${dives
    .map((d) => `${d.title}, ${d.windowText}, at ${d.depth} metres`)
    .join("; ")}.`;

  return (
    <section className="sec" id="chart" ref={root} aria-labelledby="chart-title">
      <div className="wrap">
        <p className="label kicker">{chartCopy.kicker}</p>
        <h2 className="h2" id="chart-title" data-lines aria-label={plain(chartCopy.heading)}>
          <Rich text={chartCopy.heading} />
        </h2>

        <figure className="chart" data-reveal>
          <svg viewBox="0 0 1000 380" role="img" aria-label={chartLabel}>
            <g stroke="#121412" strokeOpacity=".12">
              {GRID.map((m) => (
                <line key={m} x1={X0} y1={r1(y(m))} x2={X1} y2={r1(y(m))} />
              ))}
            </g>
            <g textAnchor="end">
              {GRID.map((m) => (
                <text key={m} x="50" y={r1(y(m)) + 4}>
                  {m === 0 ? "0 M" : `−${m}`}
                </text>
              ))}
            </g>
            <path className="ground" d={GROUND} fill="url(#hatch2)" opacity=".45" />
            <path className="seabed" d={SEABED} pathLength={1} strokeDasharray="1" fill="none" stroke="#121412" strokeWidth="2.4" strokeLinejoin="round" />
            {stations.map(({ d, i, multi, xs, xe, yd }) => {
              const color = COLORS[i];
              const last = i === stations.length - 1;
              return (
                <g className="stn" key={d.id}>
                  {multi ? (
                    <rect x={xs} y={yd - 6.5} width={xe - xs} height="13" fill={color} />
                  ) : (
                    <circle cx={xs} cy={yd} r={last ? 10 : 8} fill={color} />
                  )}
                  {multi ? (
                    <>
                      <text className="t halo" x={xs + 6} y={yd + 34}>
                        {d.title}
                      </text>
                      <text className="halo" x={xs + 6} y={yd + 52}>
                        {d.chartNote}
                      </text>
                    </>
                  ) : (
                    <>
                      <text className="t" x={last ? X1 - 4 : xs} y={yd - 40} textAnchor={last ? "end" : "middle"}>
                        {d.title}
                      </text>
                      <text x={last ? X1 - 4 : xs} y={yd - 22} textAnchor={last ? "end" : "middle"}>
                        {d.chartNote}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
            {showToday && (
              <g>
                <line x1={tx} y1="40" x2={tx} y2="360" stroke="#D0392C" strokeDasharray="4 4" />
                <text className="today" x={tx} y="32" textAnchor="middle">
                  TODAY
                </text>
              </g>
            )}
          </svg>
          <figcaption className="chart-cap mono">
            <span>{chartCopy.caption}</span>
            <span>{chartCopy.range}</span>
          </figcaption>
        </figure>

        <ol className="ladder" aria-label="Depth of each dive">
          {dives.map((d, i) => (
            <li key={d.id} style={{ ["--c" as string]: COLORS[i], ["--w" as string]: `${d.depth / 10}%` }}>
              <span className="d num">{d.depthText}</span>
              <div>
                <span className="bar" aria-hidden="true" />
                <p>
                  {d.title}
                  <small>{d.ladderNote}</small>
                </p>
              </div>
            </li>
          ))}
        </ol>

        <figure className="fig" data-reveal>
          <figcaption className="fig-head">
            <span className="label">{specimen.label}</span>
            <span className="mono">{specimen.aside}</span>
          </figcaption>
          <div className="specimen">
            <svg viewBox="0 0 600 230" role="img" aria-label="Engraving of a shark with three marked points: A, the eye; B, the dorsal fin; C, the jaw.">
              <g clipPath="url(#shkc)">
                <rect width="600" height="230" fill="#ECE7DE" />
                <path d="M0,0 H600 V104 C540,118 470,120 400,116 C320,112 230,108 140,108 C90,108 40,110 0,112 Z" fill="url(#hatch)" />
                <path d="M0,0 H600 V92 C520,100 460,98 400,96 C320,92 230,90 140,92 C90,93 40,96 0,98 Z" fill="url(#cross)" />
                <path d="M0,104 C40,108 90,110 140,112 C230,116 320,124 400,130 C470,134 540,128 600,120 V230 H0 Z" fill="url(#hatch2)" opacity=".45" />
              </g>
              <use href="#shk" fill="none" stroke="#121412" strokeWidth="2.2" strokeLinejoin="round" />
              <g fill="none" stroke="#121412" strokeWidth="1.6" strokeLinecap="round">
                <path d="M452,98 C448,112 448,128 452,142" />
                <path d="M462,98 C458,112 458,128 462,140" />
                <path d="M472,98 C468,112 468,126 472,138" />
                <path d="M482,99 C479,111 479,124 482,135" />
                <path d="M566,124 C548,132 528,134 506,130" />
              </g>
              <circle cx="530" cy="96" r="4.2" fill="#121412" />
              <circle cx="531.3" cy="94.8" r="1.2" fill="#ECE7DE" />
            </svg>
            {/* Pins are HTML layers over the engraving so their pulse runs on the compositor. */}
            {[
              { k: "A", x: 530, y: 96 },
              { k: "B", x: 362, y: 30 },
              { k: "C", x: 540, y: 131 },
            ].map((p) => (
              <span key={p.k} className="pin" style={{ left: `${(p.x / 600) * 100}%`, top: `${(p.y / 230) * 100}%` }} aria-hidden="true">
                <i />
                <b>{p.k}</b>
              </span>
            ))}
          </div>
          <div className="notes">
            {specimen.notes.map((n) => (
              <div className="note" key={n.pin}>
                <p className="label">{n.label}</p>
                <h3>{n.title}</h3>
                <p>{n.text}</p>
              </div>
            ))}
          </div>
        </figure>
      </div>
    </section>
  );
}
