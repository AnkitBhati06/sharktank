/** Shared SVG symbols: shark outline, engraving hatches, Edison bulb. Rendered once per page. */
export const SHARK_PATH =
  "M578,112 C566,88 526,70 470,66 L410,63 C394,44 374,20 352,4 C356,28 348,50 334,64 C272,70 196,84 126,99 C104,70 72,38 28,14 C50,50 68,82 86,108 C72,138 56,166 40,194 C78,172 104,142 126,120 C192,134 262,148 330,154 L392,156 C378,180 358,202 332,218 C370,206 404,182 432,156 C492,154 544,142 578,112 Z";

export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <path id="shk" d={SHARK_PATH} />
        <clipPath id="shkc">
          <use href="#shk" />
        </clipPath>
        <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#121412" strokeWidth="1.3" />
        </pattern>
        <pattern id="hatch2" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#121412" strokeWidth=".7" />
        </pattern>
        <pattern id="cross" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#121412" strokeWidth=".9" />
        </pattern>
        <pattern id="hatchL" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#ECE7DE" strokeWidth="1" />
        </pattern>
        <g id="bulbG">
          <path d="M-12 26 C-12 15 -26 8 -26 -10 A26 26 0 1 1 26 -10 C26 8 12 15 12 26 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M-11 27 H11 M-10 32 H10 M-9 37 H9" stroke="currentColor" strokeWidth="2" />
          <path d="M-5 41 H5" stroke="currentColor" strokeWidth="2" />
          <polyline points="-6,20 -6,-4 -3,-12 0,-4 3,-12 6,-4 6,20" fill="none" stroke="#FFB15A" strokeWidth="2" strokeLinejoin="round" />
        </g>
      </defs>
    </svg>
  );
}
