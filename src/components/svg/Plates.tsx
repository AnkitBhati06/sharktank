import type { DiveId } from "@/content/event";

/* Engraved line-art plates for the four dive cards. `.acc` takes the dive colour. */

function Shallows() {
  return (
    <>
      <path d="M20 70 Q 70 58 120 70 T 220 70 T 320 70 T 420 70" opacity=".7" />
      <path d="M10 92 Q 60 82 110 92 T 210 92 T 310 92 T 410 92" opacity=".4" />
      <g opacity=".35">
        <path d="M120 70 L60 400" />
        <path d="M170 70 L150 400" />
        <path d="M230 70 L250 400" />
        <path d="M290 70 L350 400" />
      </g>
      <g strokeWidth="1.6">
        <rect x="70" y="140" width="56" height="74" transform="rotate(-18 98 177)" fill="url(#hatchL)" />
        <rect x="250" y="120" width="50" height="66" transform="rotate(22 275 153)" />
        <rect x="300" y="250" width="46" height="60" transform="rotate(-30 323 280)" fill="url(#hatchL)" />
        <rect x="96" y="285" width="44" height="58" transform="rotate(12 118 314)" />
        <rect x="190" y="320" width="40" height="52" transform="rotate(-8 210 346)" />
      </g>
      <g transform="translate(200 215) scale(1.25)" className="acc">
        <circle r="70" fill="rgba(255,177,90,.07)" stroke="none" />
        <use href="#bulbG" />
      </g>
      <g fill="currentColor" stroke="none" opacity=".6">
        <circle cx="196" cy="150" r="2.4" />
        <circle cx="204" cy="132" r="1.8" />
        <circle cx="199" cy="116" r="1.4" />
      </g>
    </>
  );
}

function DropOff() {
  return (
    <>
      <path d="M0 160 L120 158 L150 164 L168 190 L172 260 L182 330 L186 400 L0 400 Z" fill="url(#hatchL)" />
      <path d="M0 160 L120 158 L150 164 L168 190 L172 260 L182 330 L186 400" strokeWidth="2" />
      <g className="acc" transform="translate(128 132) scale(.62)">
        <use href="#bulbG" />
      </g>
      <path d="M150 128 L400 70 M150 128 L400 210" strokeDasharray="4 6" className="acc" />
      <path d="M150 128 L400 70 L400 210 Z" fill="rgba(61,99,176,.18)" stroke="none" />
      <g transform="translate(270 112) scale(.2)">
        <use href="#shk" fill="#0B0D0C" stroke="currentColor" strokeWidth="6" />
      </g>
      <g opacity=".5" strokeWidth="1">
        <path d="M210 300 h40 M210 330 h60 M210 360 h80" />
      </g>
      <text x="300" y="304" fill="currentColor" stroke="none" fontFamily="var(--f-mono)" fontSize="11" opacity=".7">
        −400 M
      </text>
    </>
  );
}

function Trench() {
  return (
    <>
      <ellipse cx="200" cy="210" rx="190" ry="150" opacity=".25" />
      <ellipse cx="205" cy="215" rx="160" ry="124" opacity=".35" transform="rotate(-6 205 215)" />
      <ellipse cx="208" cy="220" rx="128" ry="98" opacity=".45" transform="rotate(-10 208 220)" />
      <ellipse cx="212" cy="226" rx="98" ry="72" opacity=".6" transform="rotate(-14 212 226)" />
      <ellipse cx="216" cy="232" rx="66" ry="46" opacity=".75" transform="rotate(-18 216 232)" />
      <ellipse cx="220" cy="238" rx="34" ry="22" transform="rotate(-20 220 238)" fill="url(#hatchL)" />
      <g fill="currentColor" stroke="none" fontFamily="var(--f-mono)" fontSize="10" opacity=".7">
        <text x="20" y="214">−300</text>
        <text x="58" y="222">−500</text>
        <text x="92" y="230">−600</text>
        <text x="126" y="238">−700</text>
      </g>
      <g className="acc">
        <g transform="translate(150 120) scale(.42)"><use href="#bulbG" /></g>
        <g transform="translate(240 96) scale(.36)"><use href="#bulbG" /></g>
        <g transform="translate(300 150) scale(.32)"><use href="#bulbG" /></g>
      </g>
      <g opacity=".45" strokeDasharray="2 4">
        <path d="M150 140 V230" />
        <path d="M240 112 V236" />
        <path d="M300 165 V240" />
      </g>
    </>
  );
}

function Tank() {
  return (
    <>
      <path d="M110 150 L250 120 L330 150 L190 182 Z" opacity=".6" />
      <path d="M110 150 V320 L190 352 V182 M190 352 L330 320 V150 M250 120 V140" opacity=".6" />
      <path d="M110 320 L250 290 L330 320" opacity=".25" strokeDasharray="3 5" />
      <path d="M250 140 V290" opacity=".25" strokeDasharray="3 5" />
      <g className="acc" transform="translate(220 236) scale(.7)">
        <circle r="60" fill="rgba(208,57,44,.12)" stroke="none" />
        <use href="#bulbG" />
      </g>
      <path d="M220 182 V206" className="acc" />
      <g transform="translate(20 40) scale(.6)">
        <use href="#shk" fill="#0B0D0C" stroke="currentColor" strokeWidth="3" />
      </g>
      <circle cx="337" cy="96" r="2.6" fill="#D0392C" stroke="none" />
    </>
  );
}

const PLATES = { 1: Shallows, 2: DropOff, 3: Trench, 4: Tank } as const;

export function DivePlate({ id }: { id: DiveId }) {
  const Art = PLATES[id];
  return (
    <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth={id === 3 ? 1.2 : 1.4} aria-hidden="true" focusable="false">
      <Art />
    </svg>
  );
}
