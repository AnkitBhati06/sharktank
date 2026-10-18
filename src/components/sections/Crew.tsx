"use client";

import { useRef, useState } from "react";
import { config, crew, event, type Contact } from "@/content/event";
import { Rich, plain } from "@/lib/rich";

/** One contact detail (phone or email): a link, selectable text and a Copy button. */
function CopyLine({ kind, value, href, who }: { kind: "number" | "email"; value: string; href: string; who: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [state, setState] = useState<"idle" | "copied" | "selected">("idle");
  const selectText = () => {
    const el = ref.current;
    if (!el) return;
    const r = document.createRange();
    r.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
    setState("selected");
  };
  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error("no clipboard");
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      selectText();
    }
    window.setTimeout(() => setState("idle"), 1800);
  };
  return (
    <div className="ph">
      <a ref={ref} className={`num-sel${kind === "number" ? " num" : ""}`} href={href}>
        {value}
      </a>
      <button className="cp" type="button" onClick={copy} aria-label={`Copy ${who}'s ${kind}`}>
        {state === "copied" ? "Copied" : state === "selected" ? "Selected" : "Copy"}
      </button>
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? `${kind === "number" ? "Number" : "Email"} copied` : state === "selected" ? "Selected, press copy on your device" : ""}
      </span>
    </div>
  );
}

function ContactCard({ c }: { c: Contact }) {
  const phone = c.phone.trim();
  const email = (c.email ?? "").trim();
  const initials = c.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="card" data-reveal data-own-lite>
      <div className="av" aria-hidden="true">
        {initials}
      </div>
      <div>
        <h3>{c.name}</h3>
        <p className="role">{c.role}</p>
      </div>
      <div className="ph-list">
        {email && <CopyLine kind="email" value={email} href={`mailto:${email}`} who={c.name} />}
        {phone && <CopyLine kind="number" value={phone} href={`tel:${phone.replace(/[^+\d]/g, "")}`} who={c.name} />}
        {!email && !phone && (
          <div className="ph">
            <span className="tba">{crew.phoneMissing}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Crew() {
  return (
    <section className="sec" id="crew" style={{ paddingTop: 0 }} aria-labelledby="crew-title">
      <div className="wrap">
        <p className="label kicker">{crew.kicker}</p>
        <h2 className="h2" id="crew-title" data-lines aria-label={plain(crew.heading)}>
          <Rich text={crew.heading} />
        </h2>
        <div className="crew">
          <div className="card" data-reveal data-own-lite>
            <p className="label">{crew.venueLabel}</p>
            <h3>{event.venue}</h3>
            <p className="role">{crew.venueNote}</p>
            <div style={{ marginTop: "auto" }}>
              <a className="btn btn-line" href={event.mapsUrl} target="_blank" rel="noopener noreferrer">
                Open in Maps <span className="ar" aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
          {config.contacts.map((c) => (
            <ContactCard key={c.name} c={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
