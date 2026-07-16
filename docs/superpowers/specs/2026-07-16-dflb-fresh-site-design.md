# DFLB Fresh Site ("Candy Editorial") — Design Spec

**Date:** 2026-07-16
**Status:** Approved by Max (this session)
**Goal:** A completely fresh, professional-but-fun rebuild of the DFLB site in a new
self-contained directory, replacing none of the existing iterations. Content is carried
over **verbatim**; the Google Sheet / Google Drive content pipeline keeps working with
the same mechanism.

## 1. Location & structure

New top-level directory in this repo: **`dflb/`** — completely separate from
`new-site/` and all Safe/Bold iterations. It is its own web root (root-absolute URLs),
so launching it later = pointing the publish workflow at `dflb/` instead of `new-site/`.

```
dflb/
├── index.html                 Homepage
├── schedule/index.html        + the same 11 other subpage slugs as new-site root:
│   consign/ registration/ what-can-i-sell/ tagging-merchandise/ vip-tagging/
│   purple-play-rack-ppr/ volunteering/ donate/ vendors/ gallery/ contact/
├── css/site.css               One hand-written stylesheet (custom properties + shim)
├── js/main.js                 Nav / carousel / misc behavior
├── js/countdown.js            Same countdown logic as new-site
├── js/sale-date.js            Written by the Apps Script (same convention)
└── images/                    logo, favicons, natalie.png, gallery/photo-1..24.jpg
```

No Bootstrap, no Tailwind, no build step. AOS stays (CDN, deferred) because the
pipeline-injected markup carries `data-aos` attributes.

## 2. Content — verbatim (non-negotiable)

Every user-visible word is lifted exactly from the current `new-site/` root pages:
titles, meta descriptions, JSON-LD, headings, body copy, CTA labels, alt text where it
describes the same image. No rewording, no additions.

- All external links preserved exactly: MySaleManager (`...partnercode=DFLB`),
  Google Form `forms.gle/rv3MY1PFxXJtELih8`, PayPal, Facebook, Instagram.
- Visible text never says "MySaleManager" — buttons stay "Consignor Login" etc.
- VIP email: **vipconsigner@gmail.com** (with "e", per the 07-13 transcript).

## 3. Google Sheet / Drive pipeline — same mechanism

The Apps Script (`automation/apps-script/`) keeps working unchanged in *how* it works;
only its path lists learn the new directory.

- New pages carry identical marker pairs:
  - Home: `<!-- dflb:sale-dates -->`, `<!-- dflb:sale-dates2 -->`, `<!-- dflb:event-jsonld -->`
  - Schedule: `<!-- dflb:sale-dates -->`, `<!-- dflb:schedule -->`, `<!-- dflb:flyer -->`
- `dflb/js/sale-date.js` + `dflb/js/countdown.js` reproduce the countdown convention.
- **Repo edits required:** in `automation/apps-script/main.js` add
  `dflb/index.html` to `DFLB_HOMES`, `dflb/schedule/index.html` to `DFLB_SCHEDULES`,
  and write `dflb/js/sale-date.js` alongside `new-site/js/sale-date.js`.
  `render.js` is untouched. (A re-paste of `main.gs` into the Sheet's Apps Script
  project was already pending from the 5-version update; this rides along.)
- **CSS compatibility shim:** `site.css` styles the exact markup `render.js` emits —
  `.section-cream`, `.text-muted-dflb`, `.btn.btn-outline-gold`, `--dflb-pop`,
  `--dflb-grey-200`, `--dflb-charcoal`, and the Bootstrap-ish utilities it uses
  (`d-flex`, `d-inline-flex`, `gap-2/3`, `gap-sm-4`, `mb-0/1/2/4`, `my-3`,
  `flex-shrink-0`, `flex-grow-1`, `text-center`, `rounded-3`, `rounded-pill`,
  `p-2/3`, `p-sm-3/4`, `small`, `fw-semibold`, `fw-bold`, `h3`, `text-uppercase`,
  `ms-1`, `badge`, `align-items-center`). Scoped to what the injected regions need.

## 4. Look & feel — "Candy Editorial"

Professional-first modern editorial; fun comes from color + type, not clutter.
Direction per the 07-13 consultation: vibrant cotton-candy multicolor, **not** all-pink,
**not** washed pastel, **not** neon; polka dots are the kids theme.

- **Type:** Nunito 800/900 for display/headings, Open Sans 400/600 body
  (Google Fonts, preconnect, `font-display: swap`). Sizes in `rem`.
- **Palette (CSS custom properties, AA-validated before ship):**
  bright: pink `#F472B6`, sky `#38BDF8`, purple `#A78BFA`, mint `#34D399`,
  sunshine `#FBBF24`; deep (white-text-safe): pink `#C7256E`, sky `#0273AE`,
  purple `#6D28D9`, green `#047857`, amber `#92600A`; ink `#231F2E`,
  body `#4A4458`, cream `#FFFBF7`, white. `--dflb-pop` maps to deep pink.
- **Homepage:** glassy sticky nav (white blur, pink "Consignor Login" pill);
  soft multi-color **ombre hero, no polka dots on main**; huge visible H1
  “Rochester's Favorite Children's Consignment Sale” (fixes buried-H1 gap);
  sale dates from Sheet + live countdown pills; primary CTAs; rounded
  auto-rotating **carousel of real gallery photos** (pause on hover, reduced-motion
  safe). Sections below on white with candy accents, content verbatim from
  current homepage (Shop/Consign/Volunteer cards, two 3-step lists, VIP teaser,
  About Natalie, donate strip, final CTA), footer.
- **Interior pages:** each page one candy color — banner in that color with big
  soft **white polka dots**, H1 in banner, content on clean white.
  Assignments: schedule=sky, consign=pink, registration=purple,
  what-can-i-sell=mint, tagging-merchandise=sunshine, vip-tagging=pink,
  purple-play-rack-ppr=purple, volunteering=mint, donate=pink, vendors=sunshine,
  gallery=sky, contact=purple.
- **Mobile:** full-screen overlay menu (hamburger → X), 100dvh, links centered.

## 5. Quality bar & verification

- WCAG 2.2 AA: contrast (validated programmatically for every text/bg pair in the
  palette), one H1/page, skip link, semantic landmarks, labeled controls, visible
  focus, no "click here" links, `prefers-reduced-motion` respected.
- SEO: per-page title/meta/canonical/OG/Twitter/JSON-LD copied verbatim
  (canonicals stay on dudsforlovebugs.com paths). Root `sitemap.xml`/`robots.txt`
  are the live site's — untouched; regenerate when `dflb/` becomes the web root.
- Perf: hero/LCP image `fetchpriority="high"` not lazy; below-fold lazy +
  `decoding="async"`; explicit width/height; `defer` scripts.
- **Verification before "done":**
  1. `node automation/test/render.test.cjs` still passes.
  2. Marker dry-run: run `render.js`'s `replaceRegion` (Node) against
     `dflb/index.html` + `dflb/schedule/index.html` for every region the Apps
     Script touches — proves a Sheet sync can never hit "missing marker pair".
  3. Serve `dflb/` locally; screenshot desktop + mobile of home + representative
     subpages; click-test nav, carousel, mobile menu, countdown.
  4. Verbatim content diff: extracted visible text of each new page matches the
     corresponding root page (whitespace-insensitive).

## Out of scope (flagged for later)

Analytics snippet (needs GA ID decision), Namecheap/domain launch + publish-workflow
switch to `dflb/`, brand-guidelines doc, new photography from Natalie.
