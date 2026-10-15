/** Logo mark: ring, dotted inner ring, dorsal fin, red waterline. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden="true" focusable="false">
      <circle cx="22" cy="22" r="20.5" fill="none" stroke="#121412" strokeWidth="1.5" />
      <circle cx="22" cy="22" r="16" fill="none" stroke="#121412" strokeWidth=".8" strokeDasharray="1.5 3" />
      <path d="M8 27 C 15 26.5, 19 23, 23 10 C 24 18, 28 24, 36 27 Z" fill="#121412" />
      <path d="M6 30 Q 14 27 22 30 T 38 30" fill="none" stroke="#D0392C" strokeWidth="1.6" />
    </svg>
  );
}
