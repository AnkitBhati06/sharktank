"use client";

import { useEffect, useRef, useState } from "react";
import { config, register } from "@/content/event";
import { Rich, plain } from "@/lib/rich";
import { ms, pad, useNow } from "@/lib/time";
import { Wave } from "../Wave";

/** Two digits that roll in when their value changes (not on first paint). */
function Digits({ value }: { value: string }) {
  const first = useRef(true);
  const [roll, setRoll] = useState(false);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setRoll(true);
  }, [value]);
  return (
    <span className="digits num" aria-hidden="true">
      <span key={value} className={roll ? "roll" : undefined}>
        {value}
      </span>
    </span>
  );
}

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

export function Register() {
  const now = useNow(1000);
  const deadline = ms(config.round1Deadline);
  const left = now === null ? null : Math.max(0, deadline - now);
  const closed = left === 0;
  const url = config.registrationUrl.trim();

  const parts =
    left === null
      ? ["––", "––", "––", "––"]
      : [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60, Math.floor(left / 1e3) % 60].map(pad);

  const spoken =
    left === null ? "" : closed ? "Dive 01 has closed." : `${parts[0]} days, ${parts[1]} hours and ${parts[2]} minutes left to register.`;
  const heading = closed ? register.closedHeading : register.heading;

  return (
    <section className="sec ink dots band" id="register" aria-labelledby="register-title">
      <Wave fill="var(--ink)" />
      <div className="wrap">
        <p className="label kick">{register.kicker}</p>
        <h2 className="h2 accent" id="register-title" style={{ marginInline: "auto" }} data-lines aria-label={plain(heading)} key={heading}>
          <Rich text={heading} />
        </h2>
        <div className="cd" role="timer" aria-label={spoken || "Countdown to the Dive 01 deadline"}>
          {UNITS.map((u, i) => (
            <div key={u}>
              <Digits value={parts[i]} />
              <small className="label">{u}</small>
            </div>
          ))}
        </div>
        <ol className="steps">
          {register.steps.map((s) => (
            <li key={s.label} data-reveal>
              <p className="label">{s.label}</p>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="go">
          {url ? (
            <a className="btn btn-paper" href={url} target="_blank" rel="noopener noreferrer">
              {register.cta} <span className="ar" aria-hidden="true">↗</span>
            </a>
          ) : (
            <a className="btn btn-paper" aria-disabled="true" role="link">
              {register.ctaSoon}
            </a>
          )}
          <p>{url ? register.note : register.noteSoon}</p>
        </div>
      </div>
    </section>
  );
}
