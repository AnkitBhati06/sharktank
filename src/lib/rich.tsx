import { Fragment } from "react";

/**
 * Tiny markup for copy in event.ts:
 *   **bold**    -> <b>
 *   _accent_    -> <em> (the red italic used in headings)
 */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**")) return <b key={i}>{p.slice(2, -2)}</b>;
        if (p.startsWith("_") && p.endsWith("_") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

/** Plain text version (for aria-labels). */
export const plain = (text: string) => text.replace(/\*\*|_/g, "");
