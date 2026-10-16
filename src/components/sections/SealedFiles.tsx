"use client";

import { useRef, useState } from "react";
import { config, sealed } from "@/content/event";
import { Rich, plain } from "@/lib/rich";

function Redaction({ label, denied, wide }: { label: string; denied: string; wide?: boolean }) {
  const [show, setShow] = useState(false);
  const timer = useRef<number>(0);
  const tap = () => {
    setShow(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShow(false), 2500);
  };
  return (
    <div>
      <button type="button" className={`redact${wide ? " wide" : ""}`} aria-label={`${label}, classified. Tap for status`} onClick={tap} />
      <span className={`denied${show ? " show" : ""}`} role="status">
        {show ? denied : ""}
      </span>
    </div>
  );
}

export function SealedFiles() {
  const prize = config.prizePool.trim();
  return (
    <section className="sec" id="sealed" aria-labelledby="sealed-title">
      <div className="wrap">
        <p className="label kicker">{sealed.kicker}</p>
        <h2 className="h2" id="sealed-title" data-lines aria-label={plain(sealed.heading)}>
          <Rich text={sealed.heading} />
        </h2>
        <div className="classified">
          <article className="file" data-reveal data-own-lite>
            <span className="tab mono">{sealed.prize.tab}</span>
            <p className="label">{sealed.prize.label}</p>
            <h3>{sealed.prize.title}</h3>
            {prize ? <p className="value num">{prize}</p> : <Redaction label={sealed.prize.label} denied={sealed.prize.denied} />}
            <p className="note-p">{prize ? sealed.prize.openNote : sealed.prize.sealedNote}</p>
            <span className={`stamp${prize ? " open" : ""}`}>{prize ? "Declassified" : "Classified"}</span>
          </article>
          <article className="file" data-reveal data-own-lite>
            <span className="tab mono">{sealed.jury.tab}</span>
            <p className="label">{sealed.jury.label}</p>
            <h3>{sealed.jury.title}</h3>
            <Redaction label={sealed.jury.label} denied={sealed.jury.denied} wide />
            <p className="note-p">{sealed.jury.note}</p>
            <span className="stamp">Classified</span>
          </article>
        </div>
      </div>
    </section>
  );
}
