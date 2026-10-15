# Shark Tank IIITV 2026 · The Expedition Logbook

The website for **Shark Tank IIITV 2026**, the startup pitching competition of E-Cell, IIIT Vadodara.
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · GSAP 3 + ScrollTrigger · Lenis.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start   # production build
```

Node 20+ is required (tested on Node 22).

## Edit the event: `src/content/event.ts`

Every date, rule, FAQ, contact and line of copy lives in **`src/content/event.ts`**. Components only read from it.

The four values you will most likely change sit at the top of the file in `config`:

| Field | What happens on the site |
|---|---|
| `registrationUrl` | Empty: the register button is disabled and reads "Registration form opens soon". Add the Google Form link and it becomes "Open the registration form ↗" (opens in a new tab). |
| `prizePool` | Empty: File 01 shows a redaction bar and a red "Classified" stamp. Set it (e.g. `"₹50,000"`) and the amount appears in red serif, stamped "Declassified". |
| `round1Deadline` | Drives the countdown. When it passes, the heading becomes "Dive 01 has closed." |
| `contacts[].phone` | Empty: "Number to be added". Fill it in and the number appears as selectable text with a Copy button. |

Other notes:

- Dates are ISO strings with `+05:30`. The dive status chips ("In N days", "Open now", "Done"), the hero status line and the chart's red TODAY marker are worked out in the visitor's browser from those dates. Days are counted in IST.
- The chart is drawn to scale from the dive `start`/`end`/`depth` values, so changing a date moves its station.
- In copy strings, `**bold**` renders bold and `_text_` renders as the red italic accent used in headings.

Redeploy after editing. The page is prerendered at build time.

## Deploy

**Vercel (recommended):** import the repository and keep the defaults (framework Next.js, `npm run build`). Optionally set `NEXT_PUBLIC_SITE_URL` (e.g. `https://sharktank.example.org`) so Open Graph URLs are absolute. Without it, the Vercel production URL is used.

**Any static host:** `npm run build:static` writes a plain static site to `out/` (about 1.4 MB). Upload that folder.

## Checks

Run these against a production build (`npm run build && npm start`):

```bash
npm run typecheck
npm run test:e2e   # BASE_URL=http://localhost:3000 by default
npm run perf       # scroll profile with 4x CPU throttling
REDUCED=1 npm run test:e2e   # same checks with prefers-reduced-motion
```

`test:e2e` (Playwright, uses the installed Chromium or `CHROME_PATH`) scrolls the whole page at **390×844, 768×1024 and 1440×900**. It saves a screenshot per viewport height to `screenshots/<size>/`. It asserts:

- no console errors;
- `scrollWidth === innerWidth` at every stop;
- exactly one hero `h1`, and it is visible;
- the four countdown digit groups don't overlap.

It also exercises the menu (focus moves to Close, Escape closes it), the rules tabs (arrow keys, Home/End), the dive-log expander (reached by keyboard), the pitch clock reaching Q&A (with the `aria-live` announcement), and the redaction message.

### Results on the build in this commit

| Check | Budget | Result |
|---|---|---|
| Lighthouse mobile, Performance | ≥ 90 | 97–99 (5 runs) |
| LCP | < 2.5 s | 2.11–2.23 s |
| CLS | < 0.05 | 0 |
| TBT | — | 84–158 ms |
| Lighthouse Accessibility / Best Practices / SEO | — | 100 / 100 / 100 |
| JS, first load (gzip) | — | 121 KB |
| JS, total incl. lazy GSAP/Lenis chunks (gzip) | < 180 KB | ~174 KB |
| Long tasks while scrolling, 390×844, 4× CPU | none > 50 ms | 0 (3 runs) |
| Long tasks while scrolling, 1440×900, 4× CPU | none > 50 ms | **4–7, not met in this environment, see below** |
| e2e, all sizes, normal and reduced motion | pass | pass |

**What could not be verified here.** These measurements came from a cloud container with headless Chromium and **no GPU**, so all compositing and rasterising ran on the CPU. On desktop, the remaining slow frames happen only inside the two pinned scrubs (porthole dive, card stack). They show up as compositor `Commit` waits plus Lenis's scroll write. Main-thread script and style work is not the cause: the same number of slow frames appears **with CPU throttling off**, and turning the pins off removes them entirely. On a real browser with GPU compositing these layers should be cheap, but that was not measured. Please profile once in desktop Chrome (Performance panel, 4× CPU) and on a real mid-range Android phone before launch.

## How the motion is built (and why it stays smooth)

- **Only `transform`, `opacity` and SVG `stroke-dashoffset` animate.** The only other transitions are the button colour, the menu's circular `clip-path` (on click, never on scroll) and the rules expander's `grid-template-rows` (on click).
- **No scroll listeners.** Lenis is driven by `gsap.ticker` and calls `ScrollTrigger.update`; every scroll effect is a ScrollTrigger.
- **Motion never blocks first paint.** Sections register their setup with `useMotion` (`src/lib/motion.ts`). After the first paint and an idle callback, GSAP, ScrollTrigger, SplitText and Lenis are loaded with a dynamic `import()`. Each setup then runs in its own task, in page order, followed by one `ScrollTrigger.refresh()`.
- **Pins** use ScrollTrigger `pin` with pin spacing. With mouse/trackpad scrolling they are transform pins, so entering or leaving a pin costs no page layout; touch devices keep fixed pins. `will-change` is applied only while a pin is active.
- **Phones (< 768 px) and `prefers-reduced-motion`:** no pins, no scrubbed scaling, no Lenis for reduced motion. Content uses 24 px / 0.6 s fade-ups, triggered once, and stays fully visible under reduced motion.
- Ambient loops (orbits, rays, marine snow, shark, bulb, pulsing pins) pause while their section is off screen.
- `lenis.css` is deliberately **not** imported. Its selectors depend on classes Lenis re-applies to `<html>` at every scroll start and stop, which restyled the whole page each time (see the comment in `globals.css`).
- JetBrains Mono and the italic serif appear only below the fold. Their files load after the `load` event (`html.late-fonts`), so they stay off the critical path.

## Structure

```
src/
  app/            layout (fonts, metadata), page, globals.css (tokens + all styles), icon.svg
  content/event.ts   single source of truth
  components/
    sections/     Hero, Statement, DiveLogs, Chart (+ Fig. 01), FieldDay, PitchClock,
                  SealedFiles, Register, Rules (+ FAQ), Crew, End
    svg/          shared defs (shark, hatches, bulb), logo, the four dive plates
    motion/       SmoothScroll (Lenis), MotionDirector (shared reveals, starts the queue)
    Header, Cursor, StickyCta, Wave
  lib/            motion queue, GSAP kit, breakpoints, time/status helpers, rich text
scripts/          e2e.mjs, perf.mjs, make-grain.mjs (generates public/grain.png)
screenshots/      output of the last e2e run
```

## Placeholders still open

- `config.registrationUrl`: the Google Form link
- `config.prizePool`
- `config.contacts[].phone` (both)
- There is no OG image: `/public/campaign/` didn't exist when this was built. Title and description meta tags are set. To add an image, place a 1200×630 `opengraph-image.png` in `src/app/`.
