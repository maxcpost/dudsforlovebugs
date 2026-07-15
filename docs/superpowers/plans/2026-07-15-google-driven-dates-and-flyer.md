# Google-Driven Dates, Schedule & Flyer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the site owner control all sale dates, the full day-by-day schedule, and the downloadable flyer from a Google Sheet + Drive folder, with a Google Apps Script that bakes those changes into the static site's HTML across all three versions.

**Architecture:** A Google Apps Script bound to the Sheet reads the Sheet (dates + schedule) and the Drive folder (flyer) natively, renders new HTML for a set of clearly-marked "managed regions," and commits the changed files to the GitHub repo via the GitHub REST API. The rendering logic is a pure, Node-testable JavaScript module that is also valid as an Apps Script file. A deploy-only GitHub Action publishes each commit to the live GitHub Pages preview.

**Tech Stack:** Vanilla JS (Apps Script V8 runtime + Node for tests), GitHub REST API (Git Data API for atomic multi-file commits), Google `SpreadsheetApp`/`DriveApp`, existing Bootstrap/static-HTML site.

## Global Constraints

- Static site under `new-site/`; hosted on GitHub Pages. No server, no build framework beyond this automation.
- Dates/schedule/flyer must end up in **static HTML** (SEO); never fetched client-side.
- **$0 ongoing cost** — Apps Script, GitHub Pages, GitHub API only. No Google Cloud service account, no paid tier.
- Three site versions share the same data: **Safe** (`new-site/…`), **Bold** (`new-site/bold/…`), **Bold 2** (`new-site/bold2/…`).
- MySaleManager and all external links are untouched.
- Only one secret exists: a fine-grained GitHub token (Contents: write, this repo only), stored in Apps Script Script Properties — never committed.
- Managed regions are delimited by `<!-- dflb:NAME -->` … `<!-- /dflb:NAME -->` HTML comments; the script only ever rewrites content strictly between a marker pair.
- Sale date range renders as e.g. `August 15–17, 2026` using a literal en-dash `–` (U+2013).

---

## File Structure

**New — automation (repo copy of the Apps Script + tests):**
- `automation/apps-script/render.js` — pure render functions (date range, schedule timeline, Event JSON-LD, countdown target, region replacement). CommonJS-guarded so it runs in both Node and Apps Script.
- `automation/apps-script/main.js` — Apps Script entry: read Sheet/Drive, call render.js, commit to GitHub. (Not unit-tested; run manually in Apps Script.)
- `automation/apps-script/README.md` — one-time setup runbook (Sheet, Drive folder, script paste, token, triggers).
- `automation/test/render.test.cjs` — Node tests for render.js.
- `automation/package.json` — `node --test` runner.

**New — site data + deploy:**
- `new-site/js/sale-date.js` — generated: `window.DFLB_SALE_TARGET = "<ISO>";`.
- `.github/workflows/deploy.yml` — deploy-only: on push to `main`, publish `new-site/` to `gh-pages` (subpath-prefixed, mirroring `publish-preview.sh`).

**Modified — site pages (add managed-region markers only; layout untouched):**
- `new-site/index.html`, `new-site/bold/index.html`, `new-site/bold2/index.html` — hero date, next-sale date, Event JSON-LD (split into its own script), load `sale-date.js`.
- `new-site/schedule/index.html`, `new-site/bold/schedule/index.html`, `new-site/bold2/schedule/index.html` — hero date, schedule timeline, flyer link.
- `new-site/js/countdown.js` — read `window.DFLB_SALE_TARGET`.

---

## Task 1: Automation scaffold + date-range renderer

**Files:**
- Create: `automation/package.json`
- Create: `automation/apps-script/render.js`
- Test: `automation/test/render.test.cjs`

**Interfaces:**
- Produces: `formatDateRange(startISO, endISO) -> string` — `"2026-08-15"`,`"2026-08-17"` → `"August 15–17, 2026"`. Same month → one month name; different months → both; different years → both years.
- Produces (module): `render.js` exports an object via CommonJS when `typeof module !== 'undefined'`; in Apps Script the same declarations are globals.

- [ ] **Step 1: Create the test runner package**

`automation/package.json`:
```json
{
  "name": "dflb-automation",
  "private": true,
  "type": "commonjs",
  "scripts": { "test": "node --test" }
}
```

- [ ] **Step 2: Write the failing test**

`automation/test/render.test.cjs`:
```js
const test = require('node:test');
const assert = require('node:assert');
const R = require('../apps-script/render.js');

test('formatDateRange: same month', () => {
  assert.strictEqual(R.formatDateRange('2026-08-15', '2026-08-17'), 'August 15–17, 2026');
});
test('formatDateRange: cross month', () => {
  assert.strictEqual(R.formatDateRange('2026-08-30', '2026-09-01'), 'August 30 – September 1, 2026');
});
test('formatDateRange: cross year', () => {
  assert.strictEqual(R.formatDateRange('2026-12-31', '2027-01-02'), 'December 31, 2026 – January 2, 2027');
});
test('formatDateRange: single day', () => {
  assert.strictEqual(R.formatDateRange('2026-08-15', '2026-08-15'), 'August 15, 2026');
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd automation && node --test`
Expected: FAIL — `Cannot find module '../apps-script/render.js'`.

- [ ] **Step 4: Implement `render.js` with `formatDateRange`**

`automation/apps-script/render.js`:
```js
// Pure render helpers. Valid in Node (CommonJS) AND Google Apps Script (V8):
// no import/export statements; a guarded module.exports at the very bottom.
var DFLB_MONTHS = ['January','February','March','April','May','June','July',
  'August','September','October','November','December'];

function _ymd(iso) {
  // Accept 'YYYY-MM-DD' or full ISO; parse as plain calendar parts (no TZ math).
  var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) throw new Error('bad date: ' + iso);
  return { y: +m[1], m: +m[2], d: +m[3] };
}

function formatDateRange(startISO, endISO) {
  var s = _ymd(startISO), e = _ymd(endISO);
  var sMon = DFLB_MONTHS[s.m - 1], eMon = DFLB_MONTHS[e.m - 1];
  if (s.y === e.y && s.m === e.m && s.d === e.d) return sMon + ' ' + s.d + ', ' + s.y;
  if (s.y !== e.y) return sMon + ' ' + s.d + ', ' + s.y + ' – ' + eMon + ' ' + e.d + ', ' + e.y;
  if (s.m !== e.m) return sMon + ' ' + s.d + ' – ' + eMon + ' ' + e.d + ', ' + s.y;
  return sMon + ' ' + s.d + '–' + e.d + ', ' + s.y;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatDateRange: formatDateRange };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd automation && node --test`
Expected: PASS (4/4).

- [ ] **Step 6: Commit**

```bash
git add automation/package.json automation/apps-script/render.js automation/test/render.test.cjs
git commit -m "feat(automation): date-range renderer + test scaffold"
```

---

## Task 2: Region-replace helper + countdown target

**Files:**
- Modify: `automation/apps-script/render.js`
- Test: `automation/test/render.test.cjs`

**Interfaces:**
- Produces: `replaceRegion(html, name, inner) -> string` — replaces text strictly between `<!-- dflb:name -->` and `<!-- /dflb:name -->` (markers preserved). Throws if the marker pair is missing.
- Produces: `saleDateFileContents(targetISO) -> string` — returns `window.DFLB_SALE_TARGET = "…";\n`.

- [ ] **Step 1: Write the failing tests**

Append to `automation/test/render.test.cjs`:
```js
test('replaceRegion swaps only inner content, keeps markers', () => {
  const html = 'A<!-- dflb:x -->OLD<!-- /dflb:x -->B';
  assert.strictEqual(R.replaceRegion(html, 'x', 'NEW'), 'A<!-- dflb:x -->NEW<!-- /dflb:x -->B');
});
test('replaceRegion throws on missing markers', () => {
  assert.throws(() => R.replaceRegion('nope', 'x', 'NEW'), /marker/);
});
test('saleDateFileContents', () => {
  assert.strictEqual(R.saleDateFileContents('2026-08-15T10:00:00-04:00'),
    'window.DFLB_SALE_TARGET = "2026-08-15T10:00:00-04:00";\n');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd automation && node --test`
Expected: FAIL — `replaceRegion is not a function`.

- [ ] **Step 3: Implement in `render.js` (above the export guard)**

```js
function replaceRegion(html, name, inner) {
  var open = '<!-- dflb:' + name + ' -->';
  var close = '<!-- /dflb:' + name + ' -->';
  var i = html.indexOf(open), j = html.indexOf(close);
  if (i === -1 || j === -1 || j < i) throw new Error('missing marker pair: ' + name);
  return html.slice(0, i + open.length) + inner + html.slice(j);
}

function saleDateFileContents(targetISO) {
  return 'window.DFLB_SALE_TARGET = "' + targetISO + '";\n';
}
```
Update the export object to include both: `{ formatDateRange, replaceRegion, saleDateFileContents }`.

- [ ] **Step 4: Run to verify pass**

Run: `cd automation && node --test`
Expected: PASS (7/7).

- [ ] **Step 5: Commit**

```bash
git add automation/apps-script/render.js automation/test/render.test.cjs
git commit -m "feat(automation): region-replace helper + countdown target file"
```

---

## Task 3: Schedule-timeline + Event-JSON-LD renderers

**Files:**
- Modify: `automation/apps-script/render.js`
- Test: `automation/test/render.test.cjs`

**Interfaces:**
- Consumes: a `content` object shaped as
  `{ saleName, startISO, endISO, countdownISO, locationName, address, schedule: [{dateISO, time, event, details, tag}] }`.
- Produces: `renderScheduleTimeline(scheduleRows) -> string` — HTML for the timeline body: rows grouped by `dateISO` into day cards (matching the existing markup: a date chip `Wed / 13 / Aug` + a content block per day; multiple events same day → stacked in one block; `tag` values split on `·` become badges). Uses `escapeHtml` on all text.
- Produces: `renderEventJsonLd(content) -> string` — a full `<script type="application/ld+json">{…Event…}</script>` string with `startDate`/`endDate` from `content` (start at 10:00 local, end 14:00 local, `-04:00`).
- Produces: `escapeHtml(s) -> string`.

- [ ] **Step 1: Write failing tests**

Append to `automation/test/render.test.cjs`:
```js
const CONTENT = {
  saleName: 'Fall 2026', startISO: '2026-08-15', endISO: '2026-08-17',
  countdownISO: '2026-08-15T10:00:00-04:00',
  locationName: 'Jewish Community Center (JCC)',
  address: '1200 Edgewood Ave, Rochester, NY 14618',
  schedule: [
    { dateISO: '2026-08-13', time: '1 PM – 7 PM', event: 'Drop-Off', details: 'Bring tagged items.', tag: '' },
    { dateISO: '2026-08-15', time: '10 AM – 6 PM', event: 'Public Shopping', details: 'Doors open.', tag: 'Sale Day 1' },
    { dateISO: '2026-08-15', time: '9 – 10 AM', event: 'Early Access', details: 'Military & diapers.', tag: '' }
  ]
};
test('escapeHtml', () => {
  assert.strictEqual(R.escapeHtml('a & <b> "c"'), 'a &amp; &lt;b&gt; &quot;c&quot;');
});
test('timeline groups by day and renders each event', () => {
  const html = R.renderScheduleTimeline(CONTENT.schedule);
  assert.match(html, /Aug/);
  assert.match(html, /Public Shopping/);
  assert.match(html, /Early Access/);       // second event on Aug 15 present
  assert.strictEqual((html.match(/data-dflb-day/g) || []).length, 2); // two day cards
  assert.match(html, /Sale Day 1/);         // badge from tag
});
test('event json-ld carries the dates', () => {
  const s = R.renderEventJsonLd(CONTENT);
  assert.match(s, /"startDate":"2026-08-15T10:00:00-04:00"/);
  assert.match(s, /"endDate":"2026-08-17T14:00:00-04:00"/);
  assert.match(s, /application\/ld\+json/);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd automation && node --test`
Expected: FAIL — `escapeHtml is not a function`.

- [ ] **Step 3: Implement in `render.js`**

```js
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
var DFLB_DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function _dayParts(dateISO) {
  var p = _ymd(dateISO);
  // Zeller-free DOW via UTC Date (calendar parts only; safe, no TZ drift for the label).
  var dow = new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
  return { dow: DFLB_DOW[dow], d: p.d, mon: DFLB_MONTHS[p.m - 1].slice(0, 3) };
}

function renderScheduleTimeline(rows) {
  // group preserving first-seen order
  var order = [], byDay = {};
  for (var i = 0; i < rows.length; i++) {
    var k = rows[i].dateISO;
    if (!byDay[k]) { byDay[k] = []; order.push(k); }
    byDay[k].push(rows[i]);
  }
  var out = [];
  for (var o = 0; o < order.length; o++) {
    var k2 = order[o], parts = _dayParts(k2), evs = byDay[k2];
    var chip = '<div class="flex-shrink-0 text-center rounded-3 p-2 p-sm-3" '
      + 'style="background:var(--dflb-pop);color:white;min-width:5rem;">'
      + '<p class="small fw-semibold text-uppercase mb-0" style="letter-spacing:0.08em;">' + parts.dow + '</p>'
      + '<p class="h3 fw-bold mb-0">' + parts.d + '</p>'
      + '<p class="small fw-semibold text-uppercase mb-0" style="letter-spacing:0.08em;">' + parts.mon + '</p></div>';
    var body = [];
    for (var e = 0; e < evs.length; e++) {
      var ev = evs[e];
      if (e > 0) body.push('<hr class="my-3" style="border-color:var(--dflb-grey-200);">');
      if (ev.tag) {
        var badges = String(ev.tag).split('·');
        for (var b = 0; b < badges.length; b++) {
          var t = badges[b].trim(); if (!t) continue;
          body.push('<span class="badge rounded-pill mb-2 me-1" style="background:var(--dflb-pop);'
            + 'font-size:0.6875rem;letter-spacing:0.08em;text-transform:uppercase;">' + escapeHtml(t) + '</span>');
        }
      }
      body.push('<p class="fw-bold mb-1">' + escapeHtml(ev.event) + '</p>');
      var line = ev.time ? '<strong>' + escapeHtml(ev.time) + '</strong> &mdash; ' + escapeHtml(ev.details)
                         : escapeHtml(ev.details);
      body.push('<p class="text-muted-dflb small mb-0">' + line + '</p>');
    }
    out.push('<div class="d-flex gap-3 gap-sm-4 mb-4" data-dflb-day="' + k2 + '" data-aos="fade-up">'
      + chip + '<div class="section-cream rounded-3 p-3 p-sm-4 flex-grow-1">' + body.join('') + '</div></div>');
  }
  return out.join('\n');
}

function renderEventJsonLd(c) {
  var ev = {
    '@type': 'Event',
    name: 'Duds for Love Bugs Consignment Sale',
    startDate: c.startISO + 'T10:00:00-04:00',
    endDate: c.endISO + 'T14:00:00-04:00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: c.locationName,
      address: { '@type': 'PostalAddress', streetAddress: '1200 Edgewood Ave',
        addressLocality: 'Rochester', addressRegion: 'NY', postalCode: '14618', addressCountry: 'US' } },
    description: 'Semi-annual children’s consignment sale featuring gently used clothing, toys, books, and baby gear at 50-90% off retail. Free admission.',
    organizer: { '@id': 'https://dudsforlovebugs.com/#org' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD',
      availability: 'https://schema.org/InStock', url: 'https://dudsforlovebugs.com/schedule/' }
  };
  ev['@context'] = 'https://schema.org';
  return '<script type="application/ld+json">' + JSON.stringify(ev) + '<\/script>';
}
```
Add all three (`escapeHtml`, `renderScheduleTimeline`, `renderEventJsonLd`) to the export object.

- [ ] **Step 4: Run to verify pass**

Run: `cd automation && node --test`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add automation/apps-script/render.js automation/test/render.test.cjs
git commit -m "feat(automation): schedule timeline + Event JSON-LD renderers"
```

---

## Task 4: Add managed-region markers to the three homepages + countdown refactor

**Files:**
- Modify: `new-site/index.html`, `new-site/bold/index.html`, `new-site/bold2/index.html`
- Modify: `new-site/js/countdown.js`
- Create: `new-site/js/sale-date.js`

**Interfaces:**
- Consumes: marker names `sale-dates`, `next-sale`, `event-jsonld` (from Task 2/3 renderers).
- Produces: homepages that still render identically today, but with markers + `sale-date.js` powering the countdown.

- [ ] **Step 1: Wrap the hero date** — in all three homepage files, replace the exact line
  `            August 15–17, 2026`
  with
  `            <!-- dflb:sale-dates -->August 15–17, 2026<!-- /dflb:sale-dates -->`

- [ ] **Step 2: Wrap the next-sale date** — in all three homepage files, replace
  `<p class="display-4 fw-bold text-gold mb-2" style="font-family: var(--font-heading);">August 15–17, 2026</p>`
  with the same line but the inner text wrapped:
  `<p class="display-4 fw-bold text-gold mb-2" style="font-family: var(--font-heading);"><!-- dflb:sale-dates2 -->August 15–17, 2026<!-- /dflb:sale-dates2 --></p>`
  (distinct name `sale-dates2` so one page can hold two date regions).

- [ ] **Step 3: Split the Event schema into its own marked script** — in all three homepage files:
  1. In the existing `<script type="application/ld+json">` `@graph` array, delete the trailing `,{"@type":"Event", … }` object (the 4th item) so the graph keeps WebSite/Organization/LocalBusiness only. (Remove the leading comma too.)
  2. Immediately after that `</script>`, add:
     ```html
     <!-- dflb:event-jsonld --><script type="application/ld+json">{"@context":"https://schema.org","@type":"Event","name":"Duds for Love Bugs Consignment Sale","startDate":"2026-08-15T10:00:00-04:00","endDate":"2026-08-17T14:00:00-04:00","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","location":{"@type":"Place","name":"Jewish Community Center (JCC)","address":{"@type":"PostalAddress","streetAddress":"1200 Edgewood Ave","addressLocality":"Rochester","addressRegion":"NY","postalCode":"14618","addressCountry":"US"}},"description":"Semi-annual children's consignment sale featuring gently used clothing, toys, books, and baby gear at 50-90% off retail. Free admission.","organizer":{"@id":"https://dudsforlovebugs.com/#org"},"offers":{"@type":"Offer","price":"0","priceCurrency":"USD","availability":"https://schema.org/InStock","url":"https://dudsforlovebugs.com/schedule/"}}</script><!-- /dflb:event-jsonld -->
     ```

- [ ] **Step 4: Create `new-site/js/sale-date.js`**
```js
window.DFLB_SALE_TARGET = "2026-08-15T10:00:00-04:00";
```

- [ ] **Step 5: Load `sale-date.js` before `countdown.js`** — in all three homepage files, immediately before the line `  <script src="/js/countdown.js" defer></script>` add:
  `  <script src="/js/sale-date.js" defer></script>`

- [ ] **Step 6: Refactor `new-site/js/countdown.js`** — replace the hardcoded date line
  `  var saleDate = new Date('2026-08-15T10:00:00-04:00').getTime();`
  with
  `  var saleDate = new Date(window.DFLB_SALE_TARGET || '2026-08-15T10:00:00-04:00').getTime();`

- [ ] **Step 7: Verify locally** — serve and screenshot each homepage; confirm the hero date, next-sale date, countdown, and (via view-source) the Event JSON-LD are unchanged visually.

Run:
```bash
cd new-site && python3 -m http.server 8137 >/tmp/s.log 2>&1 &
sleep 1
for u in "" "bold/" "bold2/"; do curl -s "http://localhost:8137/${u}" | grep -c "dflb:sale-dates"; done
```
Expected: each prints `2` (two date markers present). Then open `http://localhost:8137/` and confirm the countdown still ticks. Kill server: `pkill -f "http.server 8137"`.

- [ ] **Step 8: Commit**
```bash
git add new-site/index.html new-site/bold/index.html new-site/bold2/index.html new-site/js/countdown.js new-site/js/sale-date.js
git commit -m "feat(site): managed-region markers on homepages + data-driven countdown"
```

---

## Task 5: Add managed-region markers to the three schedule pages

**Files:**
- Modify: `new-site/schedule/index.html`, `new-site/bold/schedule/index.html`, `new-site/bold2/schedule/index.html`

**Interfaces:**
- Consumes: marker names `sale-dates`, `schedule`, `flyer`.
- Produces: schedule pages whose hero date, timeline, and flyer link are rewriteable.

- [ ] **Step 1: Wrap the schedule hero date** — in all three schedule files, replace
  `<h1 class="display-3 fw-bold mb-4" data-aos="fade-up" data-aos-delay="100">August 15&ndash;17, 2026</h1>`
  with
  `<h1 class="display-3 fw-bold mb-4" data-aos="fade-up" data-aos-delay="100"><!-- dflb:sale-dates -->August 15&ndash;17, 2026<!-- /dflb:sale-dates --></h1>`

- [ ] **Step 2: Wrap the timeline** — in all three schedule files, find the container that holds the day rows (the sequence of `<div class="d-flex gap-3 gap-sm-4 … mb-4" … data-aos="fade-up">…</div>` blocks, ending at the last day row). Insert `<!-- dflb:schedule -->` immediately before the first day-row `<div class="d-flex gap-3` and `<!-- /dflb:schedule -->` immediately after the closing `</div>` of the last day row. (Verify the wrapped span contains only the day rows — not the surrounding section header.)

- [ ] **Step 3: Wrap the flyer link** — in all three schedule files, wrap the whole flyer anchor. Replace
  `<a href="/images/flyer.jpg" download class="btn btn-outline-gold d-inline-flex align-items-center gap-2" data-aos="fade-up" data-aos-delay="200">`
  … through its closing `</a>` … by adding `<!-- dflb:flyer -->` immediately before the `<a` and `<!-- /dflb:flyer -->` immediately after the matching `</a>`. (Leave the inner markup as-is; the script rewrites `href` + `download` only.)

- [ ] **Step 4: Verify locally**

Run:
```bash
cd new-site && python3 -m http.server 8137 >/tmp/s.log 2>&1 &
sleep 1
for u in "schedule/" "bold/schedule/" "bold2/schedule/"; do
  echo -n "$u "; curl -s "http://localhost:8137/${u}" | grep -oE "dflb:(sale-dates|schedule|flyer)" | sort -u | tr '\n' ' '; echo;
done
pkill -f "http.server 8137"
```
Expected: each line lists `dflb:flyer dflb:sale-dates dflb:schedule`.

- [ ] **Step 5: Commit**
```bash
git add new-site/schedule/index.html new-site/bold/schedule/index.html new-site/bold2/schedule/index.html
git commit -m "feat(site): managed-region markers on schedule pages"
```

---

## Task 6: Apps Script engine (`main.js`) + runbook

**Files:**
- Create: `automation/apps-script/main.js`
- Create: `automation/apps-script/README.md`

**Interfaces:**
- Consumes: `render.js` globals (`formatDateRange`, `replaceRegion`, `renderScheduleTimeline`, `renderEventJsonLd`, `saleDateFileContents`).
- Consumes (Script Properties): `GITHUB_TOKEN`, `GITHUB_REPO` (`maxcpost/dudsforlovebugs`), `GITHUB_BRANCH` (`main`), `SHEET_ID`, `DRIVE_FOLDER_ID`.
- Produces: `run()` — the trigger entry point.

- [ ] **Step 1: Write `main.js`** (not unit-tested; verified by manual run in Task 8). Full content:
```js
// Apps Script engine. Paste this + render.js into the Sheet's Apps Script project.
// Reads Sheet + Drive natively; commits regenerated files to GitHub in one commit.

function _props() { return PropertiesService.getScriptProperties(); }
function _gh(path, method, payload) {
  var p = _props();
  var url = 'https://api.github.com/repos/' + p.getProperty('GITHUB_REPO') + path;
  var res = UrlFetchApp.fetch(url, {
    method: method || 'get',
    contentType: 'application/json',
    headers: { Authorization: 'token ' + p.getProperty('GITHUB_TOKEN'),
               Accept: 'application/vnd.github+json', 'User-Agent': 'dflb-appsscript' },
    payload: payload ? JSON.stringify(payload) : undefined,
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  if (code >= 300) throw new Error('GitHub ' + method + ' ' + path + ' -> ' + code + ': ' + res.getContentText());
  return JSON.parse(res.getContentText());
}

function readContent() {
  var ss = SpreadsheetApp.openById(_props().getProperty('SHEET_ID'));
  var info = {}, infoRows = ss.getSheetByName('Sale Info').getDataRange().getValues();
  for (var i = 0; i < infoRows.length; i++) {
    var key = String(infoRows[i][0]).trim(); if (key) info[key] = infoRows[i][1];
  }
  function iso(v) { // Date cell -> 'YYYY-MM-DD'
    var d = (v instanceof Date) ? v : new Date(v);
    return Utilities.formatDate(d, 'America/New_York', 'yyyy-MM-dd');
  }
  function isoDT(v) { var d = (v instanceof Date) ? v : new Date(v);
    return Utilities.formatDate(d, 'America/New_York', "yyyy-MM-dd'T'HH:mm:ss") + '-04:00'; }

  var schedule = [], rows = ss.getSheetByName('Schedule').getDataRange().getValues();
  for (var r = 1; r < rows.length; r++) { // row 0 = headers
    if (!rows[r][0]) continue;
    schedule.push({ dateISO: iso(rows[r][0]), time: String(rows[r][1] || ''),
      event: String(rows[r][2] || ''), details: String(rows[r][3] || ''), tag: String(rows[r][4] || '') });
  }
  return {
    saleName: String(info['Sale name'] || ''),
    startISO: iso(info['Sale start date']), endISO: iso(info['Sale end date']),
    countdownISO: isoDT(info['Countdown to']),
    locationName: String(info['Location name'] || 'Jewish Community Center (JCC)'),
    address: String(info['Address'] || ''), schedule: schedule
  };
}

function readFlyer() {
  var folder = DriveApp.getFolderById(_props().getProperty('DRIVE_FOLDER_ID'));
  var it = folder.getFiles(), newest = null;
  while (it.hasNext()) { var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f; }
  if (!newest) return null;
  var name = newest.getName(), ext = (name.match(/\.([A-Za-z0-9]+)$/) || [null,'pdf'])[1].toLowerCase();
  return { ext: ext, base64: Utilities.base64Encode(newest.getBlob().getBytes()) };
}

function renderFlyerAnchor(ext) {
  return '<a href="/images/flyer.' + ext + '" download="dflb-flyer.' + ext + '" '
    + 'class="btn btn-outline-gold d-inline-flex align-items-center gap-2" data-aos="fade-up" data-aos-delay="200">'
    + '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">'
    + '<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/></svg>'
    + 'Download Printable Flyer</a>';
}

var DFLB_HOMES = ['new-site/index.html', 'new-site/bold/index.html', 'new-site/bold2/index.html'];
var DFLB_SCHEDULES = ['new-site/schedule/index.html', 'new-site/bold/schedule/index.html', 'new-site/bold2/schedule/index.html'];

function run() {
  var c = readContent();
  if (!c.startISO || !c.endISO) { Logger.log('Core dates blank; skipping.'); return; } // safety guard
  var range = formatDateRange(c.startISO, c.endISO);
  var timeline = renderScheduleTimeline(c.schedule);
  var eventLd = renderEventJsonLd(c);
  var flyer = readFlyer();

  var files = {}; // path -> new UTF-8 string (null = binary handled separately)
  // Home pages
  for (var h = 0; h < DFLB_HOMES.length; h++) {
    var html = _ghGetText(DFLB_HOMES[h]);
    html = replaceRegion(html, 'sale-dates', range);
    html = replaceRegion(html, 'sale-dates2', range);
    html = replaceRegion(html, 'event-jsonld', eventLd);
    files[DFLB_HOMES[h]] = html;
  }
  // Schedule pages
  for (var s = 0; s < DFLB_SCHEDULES.length; s++) {
    var sh = _ghGetText(DFLB_SCHEDULES[s]);
    sh = replaceRegion(sh, 'sale-dates', range);
    sh = replaceRegion(sh, 'schedule', timeline);
    if (flyer) sh = replaceRegion(sh, 'flyer', renderFlyerAnchor(flyer.ext));
    files[DFLB_SCHEDULES[s]] = sh;
  }
  // countdown target
  files['new-site/js/sale-date.js'] = saleDateFileContents(c.countdownISO);

  commitAll(files, flyer);
}

function _ghGetText(path) {
  var p = _props();
  var res = _gh('/contents/' + path + '?ref=' + p.getProperty('GITHUB_BRANCH'), 'get');
  return Utilities.newBlob(Utilities.base64Decode(res.content)).getDataAsString();
}

function commitAll(textFiles, flyer) {
  var p = _props(), branch = p.getProperty('GITHUB_BRANCH');
  var ref = _gh('/git/ref/heads/' + branch, 'get');
  var baseSha = ref.object.sha;
  var baseCommit = _gh('/git/commits/' + baseSha, 'get');
  var tree = [];
  for (var path in textFiles) {
    var blob = _gh('/git/blobs', 'post', { content: textFiles[path], encoding: 'utf-8' });
    tree.push({ path: path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  if (flyer) {
    var fblob = _gh('/git/blobs', 'post', { content: flyer.base64, encoding: 'base64' });
    tree.push({ path: 'new-site/images/flyer.' + flyer.ext, mode: '100644', type: 'blob', sha: fblob.sha });
  }
  var newTree = _gh('/git/trees', 'post', { base_tree: baseCommit.tree.sha, tree: tree });
  var commit = _gh('/git/commits', 'post', {
    message: 'chore(content): sync dates/schedule/flyer from Google', tree: newTree.sha, parents: [baseSha] });
  _gh('/git/refs/heads/' + branch, 'patch', { sha: commit.sha });
  Logger.log('Committed ' + commit.sha);
}
```

- [ ] **Step 2: Write `automation/apps-script/README.md`** — the setup runbook:
```markdown
# DFLB content automation — setup

One-time, ~15 min. No Google Cloud, no billing.

## 1. Sheet
Create a Google Sheet with two tabs:
- **Sale Info**: column A labels / column B values — Sale name, Sale start date,
  Sale end date, Countdown to, Location name, Address. Apply Data > Data
  validation "is valid date" to the three date cells.
- **Schedule**: header row `Date | Time | Event | Details | Tag`, one row per
  event. Data validation: `Date` = date; `Tag` = dropdown of
  `Sale Day 1, Sale Day 2, Sale Day 3, 50% Off, VIP, Early Access`.

## 2. Drive folder
Create a folder; put exactly one flyer file (PDF/JPG/PNG) in it.

## 3. GitHub token
GitHub → Settings → Developer settings → Fine-grained tokens → new token,
Repository = maxcpost/dudsforlovebugs, Permissions → Contents: Read and write.
Copy the token.

## 4. Apps Script
Sheet → Extensions → Apps Script. Create two files: paste `render.js` and
`main.js`. Then Project Settings → Script properties, add:
- GITHUB_TOKEN = <token>
- GITHUB_REPO = maxcpost/dudsforlovebugs
- GITHUB_BRANCH = main
- SHEET_ID = <from the Sheet URL>
- DRIVE_FOLDER_ID = <from the folder URL>

## 5. First run + triggers
Run `run()` once; authorize Sheets/Drive/external requests when prompted.
Confirm a commit appears on `main`. Then Triggers (clock icon):
- add an installable trigger for `run` on a Time-driven, Hourly timer;
- optionally add an On-edit trigger for `run` (near-instant updates).
```

- [ ] **Step 3: Commit**
```bash
git add automation/apps-script/main.js automation/apps-script/README.md
git commit -m "feat(automation): Apps Script engine + setup runbook"
```

---

## Task 7: Deploy-on-commit GitHub Action

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `new-site/` on `main`.
- Produces: an updated `gh-pages` branch (subpath-prefixed) on every push to `main` — so the Apps Script's commit auto-publishes. Deploy-only; no Google credentials.

- [ ] **Step 1: Write the workflow**
```yaml
name: Deploy preview to gh-pages
on:
  push:
    branches: [main]
    paths: ['new-site/**']
  workflow_dispatch: {}
permissions:
  contents: write
concurrency:
  group: pages-deploy
  cancel-in-progress: true
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build subpath-prefixed site
        run: |
          set -euo pipefail
          PREFIX="/dudsforlovebugs"
          rm -rf _site && mkdir _site
          cp -R new-site/. _site/
          rm -rf _site/node_modules _site/package.json _site/package-lock.json
          touch _site/.nojekyll
          find _site -name '*.html' -print0 | xargs -0 sed -i -E \
            -e "s|(href=\")/([a-z0-9])|\1${PREFIX}/\2|g" \
            -e "s|(src=\")/([a-z0-9])|\1${PREFIX}/\2|g" \
            -e "s|href=\"/\"|href=\"${PREFIX}/\"|g"
      - name: Publish
        run: |
          set -euo pipefail
          cd _site
          git init -q && git checkout -qb gh-pages
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A && git commit -qm "Deploy ${GITHUB_SHA::7}"
          git push -f "https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.git" gh-pages
```

- [ ] **Step 2: Sanity-check the sed locally** (Linux/macOS BSD sed differs — the workflow runs on Ubuntu/GNU sed, so verify there):
Run: `grep -n "sed -i -E" .github/workflows/deploy.yml`
Expected: present. (Functional verification happens on the first real push in Task 8.)

- [ ] **Step 3: Commit**
```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy new-site to gh-pages on push to main"
```

---

## Task 8: End-to-end dry run & cutover (manual, developer-run)

**Files:** none (operational).

- [ ] **Step 1:** Push `main` (`git push origin main`). Confirm the deploy Action runs green and the live preview still matches (no visual change yet — markers are invisible).
- [ ] **Step 2:** Do the `README.md` setup (Sheet, Drive folder, token, paste scripts, script properties).
- [ ] **Step 3:** In the Apps Script editor, run `run()` once against a **test branch** first: temporarily set `GITHUB_BRANCH` to `content-test`, create that branch from `main`, run, and inspect the diff on GitHub. Confirm dates/schedule/flyer/sale-date.js changed and nothing else.
- [ ] **Step 4:** Point `GITHUB_BRANCH` back to `main`, edit a date in the Sheet, run `run()`, and confirm: commit on `main` → deploy Action → live preview shows the new date within a minute. Check the countdown, the schedule timeline, and the flyer download.
- [ ] **Step 5:** Enable the hourly (and optional on-edit) trigger.

---

## Self-Review

- **Spec coverage:** Sheet (two tabs, structured fields) → Tasks 6+README; Drive flyer (newest wins) → Task 6 `readFlyer`; baked-into-HTML for SEO → Tasks 3–5 (markers) + `renderEventJsonLd`; all three versions → Tasks 4–5 operate on all three; native Google read + single GitHub token → Task 6; hourly + on-edit triggers → Task 6 README/Task 8; light safety (skip if blank/unreadable) → Task 6 `run()` guard + `muteHttpExceptions`/throw; $0 cost → no paid services used; deploy/subpath reconciliation → Task 7. Covered.
- **Placeholder scan:** none — all steps carry real code/commands.
- **Type consistency:** `content` shape identical across Tasks 3 and 6; marker names (`sale-dates`, `sale-dates2`, `event-jsonld`, `schedule`, `flyer`) consistent between the HTML tasks (4–5) and the Apps Script `run()` (Task 6); `render.js` exports match every call site.
- **Ambiguity:** flyer link stays root-relative (`/images/flyer.<ext>`); the deploy Action does the subpath prefixing — no other component touches it.
