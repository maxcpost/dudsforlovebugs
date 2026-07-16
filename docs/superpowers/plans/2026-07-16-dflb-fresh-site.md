# DFLB Fresh Site (`dflb/`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a completely fresh, self-contained "Candy Editorial" version of the DFLB site at `dflb/` — 13 pages, content carried over verbatim from `new-site/` root pages, Google Sheet/Drive pipeline markers intact.

**Architecture:** Hand-written static HTML + one custom stylesheet (no Bootstrap/Tailwind/build step). A small CSS shim renders the markup `automation/apps-script/render.js` injects. The Apps Script path lists gain the `dflb/` targets (rides along with the already-pending `main.gs` re-paste).

**Tech Stack:** HTML5, custom CSS (custom properties), vanilla JS, AOS 2.3.4 (CDN), Google Fonts (Nunito 800/900 + Open Sans 400/600), Node for test scripts.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-16-dflb-fresh-site-design.md` — palette, page-color assignments, and shim class list live there and are normative.
- **Verbatim content:** every visible word comes from the matching `new-site/` root page. No rewording. Verified by the ordered-subsequence text check (Task 7).
- Visible text never contains "MySaleManager". VIP email is `vipconsigner@gmail.com`.
- External links preserved exactly (MySaleManager URLs with `partnercode=DFLB`, `forms.gle/rv3MY1PFxXJtELih8`, PayPal, Facebook, Instagram).
- Marker pairs must survive: home = `dflb:sale-dates`, `dflb:sale-dates2`, `dflb:event-jsonld`; schedule = `dflb:sale-dates`, `dflb:schedule`, `dflb:flyer` (Task 7 dry-run proves it).
- WCAG 2.2 AA: one H1/page, skip link, semantic landmarks, AA contrast (Task 1 validator), visible focus, `prefers-reduced-motion` honored, no `px` font sizes, explicit `width`/`height` on images, hero image never lazy, below-fold images `loading="lazy" decoding="async"`.
- All root-absolute URLs (`/css/site.css`, `/images/...`, `/schedule/`) — `dflb/` is its own web root; preview with a server rooted at `dflb/`.
- Scripts `defer`. Titles/meta/canonical/OG/Twitter/JSON-LD copied verbatim from source pages.

---

### Task 1: Scaffold, design tokens, palette validation, JS

**Files:**
- Create: `dflb/css/site.css`, `dflb/js/main.js`, `dflb/js/countdown.js`, `dflb/js/sale-date.js`
- Create (copies): `dflb/images/**` (logo.png, favicon-192.png, apple-touch-icon.png, og-image.png, natalie.png, flyer.jpg, sell.jpg, shop.jpg, volunteer.jpg, gallery/photo-1..24.jpg), `dflb/favicon.ico`
- Test: `automation/test/contrast.test.cjs`

**Interfaces:**
- Produces: CSS classes used by every page task — `.site-header`, `.nav-links`, `.btn-candy`, `.btn-ghost`, `.hero-ombre`, `.countdown-pill`, `.carousel`, `.page-banner.banner--{sky,pink,purple,mint,sunshine}` (white polka-dot pattern), `.section`, `.candy-card`, `.step-row`, `.site-footer`, `.skip-link`, `.mobile-menu` — plus the pipeline shim classes from the spec §3.
- Produces: `js/main.js` behaviors — `#mobile-nav-toggle` opens `#mobile-menu` (100dvh overlay, hamburger→X, Esc closes); `[data-carousel]` auto-rotates children `[data-slide]` every 5s, pauses on hover/focus, disabled under reduced motion; prev/next buttons `[data-carousel-prev/next]`.
- Produces: countdown contract — `window.DFLB_SALE_TARGET` read by `countdown.js`, writes `#countdown-days/-hours/-minutes/-seconds`.

- [ ] **Step 1: Write the palette contrast test** — `automation/test/contrast.test.cjs`:

```js
// WCAG AA check for every text/bg pair the design uses.
const pairs = [
  // [fg, bg, minRatio, label]
  ['#231F2E', '#FFFFFF', 4.5, 'ink on white'],
  ['#4A4458', '#FFFFFF', 4.5, 'body on white'],
  ['#231F2E', '#FFFBF7', 4.5, 'ink on cream'],
  ['#4A4458', '#FFFBF7', 4.5, 'body on cream'],
  ['#FFFFFF', '#C7256E', 4.5, 'white on deep pink (--dflb-pop, chips, buttons)'],
  ['#FFFFFF', '#0273AE', 4.5, 'white on deep sky'],
  ['#FFFFFF', '#6D28D9', 4.5, 'white on deep purple'],
  ['#FFFFFF', '#047857', 4.5, 'white on deep green'],
  ['#92600A', '#FFFFFF', 4.5, 'deep amber text on white'],
  ['#231F2E', '#FBBF24', 4.5, 'ink on sunshine (banner text)'],
  ['#231F2E', '#F472B6', 4.5, 'ink on bright pink (banner text)'],
  ['#231F2E', '#38BDF8', 4.5, 'ink on bright sky (banner text)'],
  ['#231F2E', '#A78BFA', 4.5, 'ink on bright purple (banner text)'],
  ['#231F2E', '#34D399', 4.5, 'ink on bright mint (banner text)'],
];
function lum(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
let fail = 0;
for (const [fg, bg, min, label] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: ${r.toFixed(2)} (need ${min})`);
}
if (fail) { console.error(fail + ' pair(s) below AA'); process.exit(1); }
console.log('All palette pairs pass WCAG AA.');
```

- [ ] **Step 2: Run it** — `node automation/test/contrast.test.cjs`. Expected: some banner-text pairs may FAIL (bright hues are borderline). Darken the failing token(s) in the test until all PASS (e.g. sunshine `#FBBF24`→ok with ink; brights may need `#F065A8`-level tweaks). The passing values become the canonical tokens in `site.css` — update the spec §4 palette lines to match if any changed.
- [ ] **Step 3: Copy assets**

```bash
mkdir -p dflb/css dflb/js dflb/images/gallery
cp new-site/favicon.ico dflb/
cp new-site/images/{logo.png,favicon-192.png,apple-touch-icon.png,og-image.png,natalie.png,flyer.jpg,sell.jpg,shop.jpg,volunteer.jpg} dflb/images/
cp new-site/images/gallery/photo-*.jpg dflb/images/gallery/
```

- [ ] **Step 4: Write `dflb/js/sale-date.js` + `dflb/js/countdown.js`** — `sale-date.js` is byte-identical to `new-site/js/sale-date.js` (`window.DFLB_SALE_TARGET = "2026-08-15T10:00:00-04:00";`). `countdown.js` is byte-identical to `new-site/js/countdown.js` (same element IDs).
- [ ] **Step 5: Write `dflb/js/main.js`** — mobile menu toggle (aria-expanded, body scroll lock, Esc close, icon swap), consign dropdown (click toggle, outside-click + Esc close), carousel per the Interfaces block (setInterval 5000ms, `matchMedia('(prefers-reduced-motion: reduce)')` guard, pause on `mouseenter`/`focusin`), AOS init if present.
- [ ] **Step 6: Write `dflb/css/site.css`** — layered: (1) reset + tokens (validated palette as `--candy-*`/`--deep-*`, plus `--dflb-pop:{deep pink}`, `--dflb-charcoal:#231F2E`, `--dflb-grey-200:#E9E4EE`, fonts, spacing scale); (2) base type (Nunito headings 800/900, Open Sans body, rem sizes); (3) components listed in Interfaces (glass sticky header via `backdrop-filter`, ombre hero `linear-gradient(105deg, pink, purple, sky, mint, sunshine)` under a translucent white wash, polka-dot banners via `background-image: radial-gradient(circle, rgba(255,255,255,.55) 18px, transparent 19px)` sized ~90px grid on the page color, countdown pills, rounded carousel with soft shadow); (4) **pipeline shim** — every selector from spec §3 styled to look native to the design; (5) focus-visible outlines, `@media (prefers-reduced-motion: reduce)` kill animations, mobile-menu 100dvh overlay.
- [ ] **Step 7: Commit** — `git add dflb automation/test/contrast.test.cjs && git commit -m "feat(dflb): scaffold fresh site — tokens, shim CSS, JS, assets"`

### Task 2: Homepage (`dflb/index.html`)

**Files:**
- Create: `dflb/index.html`
- Read (source of truth): `new-site/index.html`

**Interfaces:**
- Consumes: Task 1 CSS/JS contracts.
- Produces: the shared shell (head pattern, header/nav, footer, mobile menu) that Tasks 3–5 replicate on every page — copy this file's shell verbatim when building subpages, changing only per-page head metadata, nav `aria-current`, banner, and main content.

- [ ] **Step 1: Read `new-site/index.html` fully.** Inventory in order: head metadata block, nav labels/links, every `<section>`'s copy, footer copy. All of it transfers verbatim and in the same order.
- [ ] **Step 2: Build the page.** Head: identical title/meta/canonical/OG/Twitter/site JSON-LD + the `<!-- dflb:event-jsonld -->…<!-- /dflb:event-jsonld -->` block copied byte-for-byte; fonts (Nunito 800/900, Open Sans 400/600) with preconnect; `/css/site.css`; AOS CSS; `defer` scripts `/js/sale-date.js`, `/js/countdown.js`, `/js/main.js`, AOS JS. Body: skip link → glass header (logo, Schedule, Consign dropdown, Volunteering, Donate, Vendors, Gallery, Contact — exact labels/order from source — pink "Consignor Login" pill) → **hero**: ombre band (no dots), huge visible `<h1>` = the source's H1 text ("Rochester's Favorite Children's Consignment Sale…" exactly as written), sale-dates line wrapped `<!-- dflb:sale-dates -->…<!-- /dflb:sale-dates -->` (and second occurrence `sale-dates2` if the source has one — check; if the source only has one region, still include a `sale-dates2` pair where the dates repeat lower on the page, since `main.js` replaces both), countdown pills (`#countdown-days/-hours/-minutes/-seconds`), source CTA buttons, photo carousel of `images/gallery/` picks (first slide `fetchpriority="high"`, no lazy; rest lazy) → remaining sections verbatim in source order (Shop/Consign/Volunteer cards, How-it-works steps, VIP teaser, About Natalie, donate strip, final CTA) restyled as candy cards/steps → footer.
- [ ] **Step 3: Serve and eyeball** — `python3 -m http.server 8043 --directory dflb` → check http://localhost:8043/ desktop + narrow viewport (mobile menu, countdown ticking, carousel rotating).
- [ ] **Step 4: Commit** — `git commit -m "feat(dflb): homepage — ombre hero, carousel, verbatim content"`

### Task 3: Schedule page (`dflb/schedule/index.html`)

**Files:**
- Create: `dflb/schedule/index.html`
- Read: `new-site/schedule/index.html`

**Interfaces:**
- Consumes: Task 2 shell; shim classes (the injected timeline must render correctly).
- Produces: the interior-page banner pattern (`.page-banner.banner--sky` + white dots + H1) Tasks 4–5 reuse.

- [ ] **Step 1: Build from source.** Head verbatim (title/meta/canonical/OG/JSON-LD). Banner: sky + white polka dots, H1 = source H1 content including the `<!-- dflb:sale-dates -->…<!-- /dflb:sale-dates -->` region byte-for-byte. Timeline section: copy the entire `<!-- dflb:schedule -->…<!-- /dflb:schedule -->` region byte-for-byte (current injected markup — the shim styles it). Flyer: copy `<!-- dflb:flyer -->…<!-- /dflb:flyer -->` byte-for-byte. All other copy verbatim in order.
- [ ] **Step 2: Verify rendered timeline** at http://localhost:8043/schedule/ — date chips deep-pink/white, cream cards, badges legible (shim working).
- [ ] **Step 3: Commit** — `git commit -m "feat(dflb): schedule page with pipeline regions intact"`

### Task 4: Consign cluster (6 pages)

**Files:**
- Create: `dflb/{consign,registration,what-can-i-sell,tagging-merchandise,vip-tagging,purple-play-rack-ppr}/index.html`
- Read: matching `new-site/<slug>/index.html` for each

**Interfaces:**
- Consumes: shell (Task 2), banner pattern (Task 3). Banner colors per spec §4: consign=pink, registration=purple, what-can-i-sell=mint, tagging-merchandise=sunshine, vip-tagging=pink, purple-play-rack-ppr=purple.

- [ ] **Step 1..6:** For each page in the order listed: read the source fully; build head verbatim; banner in assigned color with source H1; carry every section's copy verbatim and in order (tables/lists keep their items exactly); keep all MySaleManager/Google-Form links exact; VIP page keeps the hero **and** closing-CTA application buttons (`forms.gle/rv3MY1PFxXJtELih8`) and `vipconsigner@gmail.com`. Spot-check each at http://localhost:8043/<slug>/ before moving on.
- [ ] **Step 7: Commit** — `git commit -m "feat(dflb): consign cluster pages"`

### Task 5: Community cluster (5 pages)

**Files:**
- Create: `dflb/{volunteering,donate,vendors,gallery,contact}/index.html`
- Read: matching `new-site/<slug>/index.html`

**Interfaces:**
- Consumes: shell + banner pattern. Colors: volunteering=mint, donate=pink, vendors=sunshine, gallery=sky, contact=purple.

- [ ] **Step 1..5:** Same procedure as Task 4. Gallery: responsive grid of all 24 `images/gallery/photo-*.jpg` (lazy, explicit dimensions, alt text from source). Contact: form markup/action verbatim from source (labels bound with `for`/`id`), map/link/NAP text exact.
- [ ] **Step 6: Commit** — `git commit -m "feat(dflb): community cluster pages"`

### Task 6: Automation path updates

**Files:**
- Modify: `automation/apps-script/main.js` (DFLB_HOMES, DFLB_SCHEDULES, sale-date write)

**Interfaces:**
- Consumes: marker regions from Tasks 2–3.

- [ ] **Step 1: Edit `main.js`:** append `'dflb/index.html'` to `DFLB_HOMES`; append `'dflb/schedule/index.html'` to `DFLB_SCHEDULES`; after the existing `files['new-site/js/sale-date.js'] = …` line add `if (c.countdownISO) files['dflb/js/sale-date.js'] = saleDateFileContents(c.countdownISO);`
- [ ] **Step 2: Run existing automation tests** — `node automation/test/render.test.cjs` (or `npm test` in `automation/` if defined). Expected: PASS.
- [ ] **Step 3: Commit** — `git commit -m "feat(automation): sync dflb/ pages from the Google Sheet"` (note in body: re-paste main.gs into Apps Script — already pending).

### Task 7: Verification suite

**Files:**
- Create: `automation/test/dflb-markers.test.cjs`, `automation/test/dflb-verbatim.test.cjs`

- [ ] **Step 1: Marker dry-run test** — `automation/test/dflb-markers.test.cjs`:

```js
const fs = require('fs');
const { replaceRegion } = require('../apps-script/render.js');
const checks = [
  ['dflb/index.html', ['sale-dates', 'sale-dates2', 'event-jsonld']],
  ['dflb/schedule/index.html', ['sale-dates', 'schedule', 'flyer']],
];
let fail = 0;
for (const [path, regions] of checks) {
  const html = fs.readFileSync(path, 'utf8');
  for (const r of regions) {
    try { replaceRegion(html, r, 'X'); console.log(`PASS ${path} ${r}`); }
    catch (e) { console.error(`FAIL ${path} ${r}: ${e.message}`); fail++; }
  }
}
process.exit(fail ? 1 : 0);
```

Run from repo root: `node automation/test/dflb-markers.test.cjs`. Expected: 6× PASS.

- [ ] **Step 2: Verbatim-content test** — `automation/test/dflb-verbatim.test.cjs`: for each of the 13 slugs, extract visible text (strip `<script>`/`<style>`/comments, strip tags, collapse whitespace, split to lines) from `new-site/<slug>/index.html` and `dflb/<slug>/index.html`; assert every source line appears in the new page **as an ordered subsequence** (insertions allowed only for UI chrome like carousel Previous/Next labels; deletions/rewording = FAIL, print the missing line). Also assert `grep -ri "mysalemanager" dflb --include='*.html'` matches only inside `href` attributes. Run: `node automation/test/dflb-verbatim.test.cjs`. Expected: 13× PASS.
- [ ] **Step 3: Browser pass** — serve `dflb/`, screenshot home + schedule + one candy-colored subpage at desktop (1440) and mobile (390) widths; click-test: mobile menu open/close, consign dropdown, carousel prev/next, countdown ticking, flyer download link, external links.
- [ ] **Step 4: Fix anything found, re-run all three test scripts + contrast test.** Expected: all PASS.
- [ ] **Step 5: Commit** — `git commit -m "test(dflb): marker, verbatim, and contrast verification"`
