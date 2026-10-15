/** Soft wave on a band's top edge. MotionDirector flattens it (scaleY -> 0) as the band scrolls in. */
export function Wave({ fill }: { fill: string }) {
  return (
    <div className="wave" data-wave aria-hidden="true">
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
        <path d="M0 90 V62 C 180 20 360 8 560 34 C 760 60 900 84 1100 60 C 1250 42 1350 30 1440 40 V90 Z" fill={fill} />
      </svg>
    </div>
  );
}
