// Scroll-performance probe: 4x CPU throttling via CDP, scrolls the whole page
// in small wheel-like steps, and records long tasks and frame gaps.
//
//   npm run build && npm start        (other terminal)
//   npm run perf                      (BASE_URL defaults to http://localhost:3000)
//
// Headless Chromium rasterises on the CPU, so absolute frame times are worse
// than a real phone with a GPU. Treat the long-task count as the main signal.
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const RATE = Number(process.env.CPU ?? 4);
const exe = process.env.CHROME_PATH ?? (existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined);
const SIZES = [
  { name: "390x844", width: 390, height: 844, mobile: true },
  { name: "1440x900", width: 1440, height: 900, mobile: false },
];

const browser = await chromium.launch({ executablePath: exe });
let bad = false;

for (const s of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, isMobile: s.mobile, hasTouch: s.mobile });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: RATE });

  await page.evaluate(() => {
    window.__long = [];
    window.__frames = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(Math.round(e.duration)))).observe({ type: "longtask" });
    let last = performance.now();
    const f = (t) => {
      window.__frames.push(t - last);
      last = t;
      if (!window.__stop) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });

  // Scroll top to bottom: wheel on desktop (drives Lenis), stepped native scroll on touch.
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const step = 120;
  const t0 = Date.now();
  if (!s.mobile) {
    await page.mouse.move(s.width / 2, s.height / 2);
    for (let y = 0; y < total + 400; y += step) {
      await page.mouse.wheel(0, step);
      await page.waitForTimeout(16);
    }
  } else {
    for (let y = 0; y <= total + step; y += step / 2) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(16);
    }
  }
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    window.__stop = true;
    const f = window.__frames.slice(2);
    const sorted = [...f].sort((a, b) => a - b);
    const pct = (p) => sorted[Math.floor(sorted.length * p)] ?? 0;
    return {
      longTasks: window.__long,
      frames: f.length,
      p50: pct(0.5).toFixed(1),
      p95: pct(0.95).toFixed(1),
      over50: f.filter((x) => x > 50).length,
      atBottom: Math.abs(scrollY - (document.documentElement.scrollHeight - innerHeight)) < 4,
    };
  });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n${s.name} @ ${RATE}x CPU, ${secs}s of scrolling`);
  console.log(`  long tasks (>50ms): ${r.longTasks.length}${r.longTasks.length ? ` [${r.longTasks.join(", ")} ms]` : ""}`);
  console.log(`  frames: ${r.frames}, frame time p50 ${r.p50} ms, p95 ${r.p95} ms, frames >50ms: ${r.over50}`);
  console.log(`  reached bottom: ${r.atBottom}`);
  if (r.longTasks.length) bad = true;
  await ctx.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
