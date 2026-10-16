"use client";

import { useRef, useState } from "react";
import { faq, rules } from "@/content/event";
import { Rich, plain } from "@/lib/rich";

export function Rules() {
  const [sel, setSel] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (i: number, focus = false) => {
    const n = rules.tabs.length;
    const next = (i + n) % n;
    setSel(next);
    if (focus) tabs.current[next]?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: sel + 1, ArrowDown: sel + 1, ArrowLeft: sel - 1, ArrowUp: sel - 1, Home: 0, End: rules.tabs.length - 1 };
    if (e.key in keys) {
      e.preventDefault();
      pick(keys[e.key], true);
    }
  };

  return (
    <section className="sec" id="rules" aria-labelledby="rules-title">
      <div className="wrap two">
        <div>
          <p className="label kicker">{rules.kicker}</p>
          <h2 className="h2" id="rules-title" data-lines aria-label={plain(rules.heading)}>
            <Rich text={rules.heading} />
          </h2>
          <div className="tabs" role="tablist" aria-label="Rules by round" onKeyDown={onKey}>
            {rules.tabs.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                className="tabbtn"
                role="tab"
                type="button"
                id={`tab-${t.id}`}
                aria-controls={`panel-${t.id}`}
                aria-selected={sel === i}
                tabIndex={sel === i ? 0 : -1}
                onClick={() => pick(i)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          {rules.tabs.map((t, i) => (
            <div key={t.id} className="panel" role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={sel !== i} tabIndex={0}>
              <ol className="ruled">
                {t.items.map((item, j) => (
                  <li key={item}>
                    <span className="n" aria-hidden="true">
                      {t.prefix}.{String(j + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <Rich text={item} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap two faq">
        <div>
          <p className="label kicker">{faq.kicker}</p>
          <h2 className="h2" data-lines aria-label={plain(faq.heading)}>
            <Rich text={faq.heading} />
          </h2>
        </div>
        <div data-reveal data-own-lite>
          {faq.items.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p className="a">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
