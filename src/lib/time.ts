import { useEffect, useState } from "react";
import type { Dive } from "@/content/event";

export const ms = (iso: string) => new Date(iso).getTime();
export const pad = (n: number) => String(n).padStart(2, "0");

const DAY = 86_400_000;
const IST_OFFSET = 330 * 60_000;

/** Calendar day number in IST, so "in N days" counts midnights in India, not in the viewer's zone. */
const istDay = (t: number) => Math.floor((t + IST_OFFSET) / DAY);

export type DiveStatus = { state: "upcoming" | "open" | "done"; text: string };

export function diveStatus(d: Pick<Dive, "start" | "end">, now: number): DiveStatus {
  const s = ms(d.start);
  const e = ms(d.end);
  if (now >= s && now <= e) return { state: "open", text: "Open now" };
  if (now > e) return { state: "done", text: "Done" };
  const days = Math.max(1, istDay(s) - istDay(now));
  return { state: "upcoming", text: `In ${days} ${days === 1 ? "day" : "days"}` };
}

/**
 * Current time, available only after hydration (null during prerender) so
 * date-dependent text never causes a hydration mismatch.
 * `everyMs` re-ticks; 0 means read once.
 */
export function useNow(everyMs = 0): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    if (!everyMs) return;
    const id = window.setInterval(() => setNow(Date.now()), everyMs);
    return () => window.clearInterval(id);
  }, [everyMs]);
  return now;
}
