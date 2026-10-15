// End-to-end check: scrolls the whole page at three sizes, saves a screenshot
// every viewport height, and asserts the acceptance rules from the brief.
//
//   npm run build && npm start   (in another terminal)
//   npm run test:e2e             (BASE_URL defaults to http://localhost:3000)
//
// Env: BASE_URL, CHROME_PATH (defaults to Playwright's bundled Chromium),
//      SHOTS_DIR (default ./screenshots), REDUCED=1 to emulate reduced motion.
import { chromium } from "playwright-core";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.SHOTS_DIR ?? "screenshots";
const REDUCED = process.env.REDUCED === "1";
const SIZES = [
  { name: "390x844", width: 390, height: 844, mobile: true },
  { name: "768x1024", width: 768, height: 1024, mobile: true },
  { name: "1440x900", width: 1440, height: 900, mobile: false },
];

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const guess = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
  return existsSync(guess) ? guess : undefined;
}

const failures = [];
const fail = (size, msg) => {
  failures.push(`[${size}] ${msg}`);
  console.log(`  ✗ ${msg}`);
};
const pass = (msg) => console.log(`  ✓ ${msg}`);

const browser = await chromium.launch({ executablePath: chromePath() });

for (const s of SIZES) {
  const label = REDUCED ? `${s.name}-reduced` : s.name;
  console.log(`\n${label}`);
  const dir = join(OUT, label);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    deviceScaleFactor: 1,
    isMobile: s.mobile,
    hasTouch: s.mobile,
    reducedMotion: REDUCED ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);

  // Hero h1 visible.
  const h1 = page.locator("h1");
  if ((await h1.count()) !== 1) fail(label, `expected exactly one h1, found ${await h1.count()}`);
  else if (!(await h1.isVisible())) fail(label, "hero h1 not visible");
  else {
    const box = await h1.boundingBox();
    if (!box || box.y + box.height < 0 || box.y > s.height) fail(label, "hero h1 outside the first viewport");
    else pass("hero h1 visible");
  }

  // Scroll the whole page, a screenshot per viewport height.
  let y = 0;
  let i = 0;
  let maxOverflow = 0;
  for (;;) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(650);
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
      sh: document.documentElement.scrollHeight,
      sy: window.scrollY,
    }));
    maxOverflow = Math.max(maxOverflow, m.sw - m.iw);
    await page.screenshot({ path: join(dir, `${String(i).padStart(2, "0")}.png`) });
    i++;
    if (m.sy + s.height >= m.sh - 2 || i > 80) break;
    y += s.height;
  }
  if (maxOverflow > 0) fail(label, `horizontal overflow: scrollWidth exceeds innerWidth by ${maxOverflow}px`);
  else pass("scrollWidth === innerWidth at every stop");
  pass(`${i} screenshots → ${dir}`);

  // Countdown digits must not overlap each other.
  await page.locator("#register .cd").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const boxes = await page.$$eval("#register .cd .digits", (els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      const t = e.firstElementChild?.getBoundingClientRect() ?? r;
      return { x: t.left, y: t.top, w: t.width, h: t.height, cw: r.width };
    }),
  );
  let overlap = boxes.length !== 4;
  for (let a = 0; a < boxes.length; a++)
    for (let b = a + 1; b < boxes.length; b++) {
      const A = boxes[a];
      const B = boxes[b];
      if (A.x < B.x + B.w && B.x < A.x + A.w && A.y < B.y + B.h && B.y < A.y + A.h) overlap = true;
    }
  const clipped = boxes.some((b) => b.w > b.cw + 1);
  if (overlap) fail(label, `countdown digits overlap: ${JSON.stringify(boxes)}`);
  else if (clipped) fail(label, "countdown digits wider than their cell");
  else pass("countdown digits do not overlap");

  // Interactions (keyboard + pointer), run once per size.
  try {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const menuBtn = page.locator(".top .menu-btn");
    await menuBtn.click();
    await page.waitForTimeout(900);
    if (!(await page.locator("#site-menu.open").count())) throw new Error("menu did not open");
    const focusedClose = await page.evaluate(() => document.activeElement?.textContent?.trim());
    if (focusedClose !== "Close") throw new Error(`menu focus went to "${focusedClose}"`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    if (await page.locator("#site-menu.open").count()) throw new Error("Escape did not close the menu");
    if ((await menuBtn.getAttribute("aria-expanded")) !== "false") throw new Error("aria-expanded not reset");
    pass("menu opens, focuses Close, closes on Escape");

    const tab = page.locator('[role="tab"]').first();
    await tab.scrollIntoViewIfNeeded();
    await tab.focus();
    await page.keyboard.press("ArrowRight");
    const sel = await page.evaluate(() => ({
      focus: document.activeElement?.textContent,
      selected: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent,
      visible: [...document.querySelectorAll('[role="tabpanel"]')].filter((p) => !p.hidden).map((p) => p.id),
    }));
    if (sel.focus !== "Dive 01" || sel.selected !== "Dive 01" || sel.visible.join() !== "panel-dive01")
      throw new Error(`tabs arrow key: ${JSON.stringify(sel)}`);
    await page.keyboard.press("End");
    if ((await page.evaluate(() => document.activeElement?.textContent)) !== "Finale") throw new Error("End key did not select last tab");
    pass("rules tabs work with arrow keys / End");

    // Keyboard path: in the pinned desktop stack, focusing a covered card must bring it on top.
    const more = page.locator(".log .copy .btn").first();
    await more.scrollIntoViewIfNeeded();
    await more.focus();
    await page.waitForTimeout(700);
    const onTop = await more.evaluate((b) => {
      const r = b.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!hit && b.contains(hit);
    });
    if (!onTop) throw new Error("focused dive-log button is covered by another card");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(800);
    if ((await more.getAttribute("aria-expanded")) !== "true") throw new Error("dive log did not expand");
    const rulesH = await page.locator(".log .more").first().evaluate((e) => e.getBoundingClientRect().height);
    if (rulesH < 40) throw new Error(`expanded rules height ${rulesH}`);
    await page.keyboard.press("Enter");
    pass("dive log button reachable by keyboard; rules expand and collapse");

    const fast = page.locator(".toggle input");
    await fast.scrollIntoViewIfNeeded();
    await fast.check();
    await page.locator(".gctrl .btn").first().click();
    await page.waitForFunction(() => document.querySelector(".gauge .read small")?.textContent === "Jury Q&A", null, { timeout: 40000 });
    const said = await page.locator(".gauge-wrap [aria-live]").textContent();
    if (!/Jury Q and A/.test(said ?? "")) throw new Error(`aria-live said "${said}"`);
    await page.locator(".gctrl .btn").nth(1).click();
    const reset = await page.locator(".gauge .read b").textContent();
    if (reset !== "5:00") throw new Error(`reset shows ${reset}`);
    pass("pitch clock runs into Q&A (aria-live announces it) and resets");

    const red = page.locator(".redact").first();
    await red.scrollIntoViewIfNeeded();
    await red.click();
    const msg = await page.locator(".denied").first().textContent();
    if (!/Access denied/.test(msg ?? "")) throw new Error("redaction message missing");
    pass("redaction tap shows the access message");
  } catch (e) {
    fail(label, `interaction: ${e.message}`);
  }

  if (errors.length) fail(label, `console errors:\n    ${errors.join("\n    ")}`);
  else pass("no console errors");

  await ctx.close();
}

await browser.close();
if (failures.length) {
  console.log(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log("\nAll checks passed.");
